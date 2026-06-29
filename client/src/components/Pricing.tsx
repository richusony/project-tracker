import { useState, useEffect } from 'react';
import { DollarSign, Check, Plus, Pencil } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updatePricing, addHourlyPayment, updateHourlyPayment, getExchangeRate } from '../api';
import { IProject, IPricing, CURRENCIES } from '../types';
import { format } from 'date-fns';

interface Props {
  project: IProject;
  onUpdate: (p: IProject) => void;
}

function CurrencyBadge({ amount, currency, inrRate }: { amount?: number; currency: string; inrRate: number }) {
  const curr = CURRENCIES.find(c => c.code === currency);
  if (!amount) return null;
  return (
    <div className="text-right">
      <p className="font-bold text-ink text-sm">{curr?.symbol}{amount.toLocaleString()}</p>
      {currency !== 'INR' && inrRate > 0 && (
        <p className="text-xs text-ink-3 mt-0.5">
          ≈ ₹{(amount * inrRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      )}
    </div>
  );
}

function PaymentRow({
  label, amount, currency, inrRate, received, receivedDate,
  onMark,
}: {
  label: string; amount?: number; currency: string; inrRate: number;
  received: boolean; receivedDate?: string;
  onMark: (received: boolean, date?: Date) => void;
}) {
  if (!amount) return null;
  return (
    <div className="bg-surface-2 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          {received && receivedDate && (
            <p className="text-xs text-ink-3 mt-0.5">
              Received {format(new Date(receivedDate), 'MMM d, yyyy')}
            </p>
          )}
        </div>
        <CurrencyBadge amount={amount} currency={currency} inrRate={inrRate} />
      </div>
      {received ? (
        <span className="badge badge-green gap-1">
          <Check className="w-3 h-3" /> Received
        </span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="badge badge-amber">Pending</span>
          <DatePicker
            selected={null}
            onChange={date => date && onMark(true, date)}
            customInput={
              <button className="btn-primary text-xs py-1 px-2.5 gap-1">
                <Check className="w-3 h-3" /> Mark Received
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}

export default function Pricing({ project, onUpdate }: Props) {
  const p = project.pricing;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<IPricing>>({});
  const [inrRate, setInrRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: '', description: '' });
  const [addingPayment, setAddingPayment] = useState(false);

  useEffect(() => {
    if (p.currency) getExchangeRate(p.currency).then(setInrRate);
  }, [p.currency]);

  const saveEdit = async () => {
    setLoading(true);
    try {
      const updated = await updatePricing(project._id, form);
      onUpdate(updated);
      setEditing(false);
      if (form.currency) getExchangeRate(form.currency).then(setInrRate);
    } finally { setLoading(false); }
  };

  const markAdvance = async (received: boolean, date?: Date) => {
    const updated = await updatePricing(project._id, { advanceReceived: received, advanceReceivedDate: date || null });
    onUpdate(updated);
  };
  const markFinal = async (received: boolean, date?: Date) => {
    const updated = await updatePricing(project._id, { finalReceived: received, finalReceivedDate: date || null });
    onUpdate(updated);
  };
  const handleAddPayment = async () => {
    if (!newPayment.amount) return;
    setLoading(true);
    try {
      const updated = await addHourlyPayment(project._id, { amount: Number(newPayment.amount), description: newPayment.description });
      onUpdate(updated);
      setNewPayment({ amount: '', description: '' });
      setAddingPayment(false);
    } finally { setLoading(false); }
  };
  const markHourlyPayment = async (payId: string, received: boolean, date?: Date) => {
    const updated = await updateHourlyPayment(project._id, payId, { received, receivedDate: date || null });
    onUpdate(updated);
  };

  const curr = CURRENCIES.find(c => c.code === p.currency);

  /* ── Edit form ── */
  if (editing) {
    return (
      <div className="card-p space-y-4 animate-fade-in">
        <div className="section-title">
          <DollarSign className="w-4 h-4 text-brand-500" /> Configure Pricing
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Payment Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as IPricing['type'] }))}>
              <option value="none">Not Set</option>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </div>
        </div>
        {form.type === 'fixed' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Total Price</label>
              <input type="number" className="input" placeholder="0" value={form.fixedTotal || ''} onChange={e => setForm(f => ({ ...f, fixedTotal: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Advance Amount</label>
              <input type="number" className="input" placeholder="0" value={form.advanceAmount || ''} onChange={e => setForm(f => ({ ...f, advanceAmount: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Final Amount</label>
              <input type="number" className="input" placeholder="0" value={form.finalAmount || ''} onChange={e => setForm(f => ({ ...f, finalAmount: Number(e.target.value) }))} />
            </div>
          </div>
        )}
        {form.type === 'hourly' && (
          <div>
            <label className="label">Hourly Rate</label>
            <input type="number" className="input" placeholder="0" value={form.hourlyRate || ''} onChange={e => setForm(f => ({ ...f, hourlyRate: Number(e.target.value) }))} />
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={saveEdit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving…' : 'Save Pricing'}
          </button>
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (p.type === 'none') {
    return (
      <div className="card-p text-center py-12 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-stroke flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-6 h-6 text-ink-3" />
        </div>
        <p className="text-sm text-ink-2 mb-5">No pricing configured yet.</p>
        <button onClick={() => { setForm({ ...p }); setEditing(true); }} className="btn-primary">
          Set Up Pricing
        </button>
      </div>
    );
  }

  /* ── View ── */
  return (
    <div className="card-p space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="section-title">
          <DollarSign className="w-4 h-4 text-brand-500" /> Pricing
          <span className="badge badge-slate ml-1">
            {p.type === 'fixed' ? 'Fixed Price' : 'Hourly'} · {p.currency}
          </span>
        </div>
        <button onClick={() => { setForm({ ...p }); setEditing(true); }} className="btn-ghost gap-1.5 text-sm">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      </div>

      {/* Fixed pricing */}
      {p.type === 'fixed' && (
        <div className="space-y-3">
          {p.fixedTotal && (
            <div className="flex justify-between items-center py-3 border-b border-stroke">
              <span className="text-sm text-ink-2">Total Price</span>
              <CurrencyBadge amount={p.fixedTotal} currency={p.currency} inrRate={inrRate} />
            </div>
          )}
          <PaymentRow
            label="Advance Payment" amount={p.advanceAmount} currency={p.currency} inrRate={inrRate}
            received={p.advanceReceived} receivedDate={p.advanceReceivedDate}
            onMark={markAdvance}
          />
          <PaymentRow
            label="Final Payment" amount={p.finalAmount} currency={p.currency} inrRate={inrRate}
            received={p.finalReceived} receivedDate={p.finalReceivedDate}
            onMark={markFinal}
          />
        </div>
      )}

      {/* Hourly pricing */}
      {p.type === 'hourly' && (
        <div className="space-y-3">
          {p.hourlyRate && (
            <div className="flex justify-between items-center py-3 border-b border-stroke">
              <span className="text-sm text-ink-2">Hourly Rate</span>
              <CurrencyBadge amount={p.hourlyRate} currency={p.currency} inrRate={inrRate} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Payments</p>
            <button onClick={() => setAddingPayment(true)} className="btn-primary text-xs py-1.5 px-3 gap-1">
              <Plus className="w-3 h-3" /> Add Payment
            </button>
          </div>
          {addingPayment && (
            <div className="bg-surface-2 rounded-xl p-4 space-y-3 animate-slide-up">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Amount ({curr?.symbol})</label>
                  <input type="number" className="input text-sm" placeholder="0" value={newPayment.amount} onChange={e => setNewPayment(n => ({ ...n, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input className="input text-sm" placeholder="Optional" value={newPayment.description} onChange={e => setNewPayment(n => ({ ...n, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingPayment(false)} className="btn-secondary text-sm flex-1">Cancel</button>
                <button onClick={handleAddPayment} disabled={!newPayment.amount || loading} className="btn-primary text-sm flex-1">Add</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {p.hourlyPayments.map(payment => (
              <div key={payment._id} className="bg-surface-2 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{payment.description || 'Payment'}</p>
                    {payment.received && payment.receivedDate && (
                      <p className="text-xs text-ink-3 mt-0.5">
                        Received {format(new Date(payment.receivedDate), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <CurrencyBadge amount={payment.amount} currency={p.currency} inrRate={inrRate} />
                </div>
                {payment.received ? (
                  <span className="badge badge-green gap-1"><Check className="w-3 h-3" /> Paid</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="badge badge-amber">Pending</span>
                    <DatePicker
                      selected={null}
                      onChange={date => date && markHourlyPayment(payment._id, true, date)}
                      customInput={
                        <button className="btn-primary text-xs py-1 px-2.5 gap-1">
                          <Check className="w-3 h-3" /> Mark Received
                        </button>
                      }
                    />
                  </div>
                )}
              </div>
            ))}
            {p.hourlyPayments.length === 0 && !addingPayment && (
              <p className="text-sm text-ink-3 text-center py-4">No payments logged yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
