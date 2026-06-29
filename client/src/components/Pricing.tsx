import { useState, useEffect } from 'react';
import { DollarSign, Check, Plus, Trash2 } from 'lucide-react';
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
      <div className="text-white font-semibold">{curr?.symbol}{amount.toLocaleString()}</div>
      {currency !== 'INR' && inrRate > 0 && (
        <div className="text-xs text-slate-400">≈ ₹{(amount * inrRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
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

  const startEdit = () => { setForm({ ...p }); setEditing(true); };

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
    const updated = await updatePricing(project._id, {
      advanceReceived: received,
      advanceReceivedDate: date || null,
    });
    onUpdate(updated);
  };

  const markFinal = async (received: boolean, date?: Date) => {
    const updated = await updatePricing(project._id, {
      finalReceived: received,
      finalReceivedDate: date || null,
    });
    onUpdate(updated);
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount) return;
    setLoading(true);
    try {
      const updated = await addHourlyPayment(project._id, {
        amount: Number(newPayment.amount),
        description: newPayment.description,
      });
      onUpdate(updated);
      setNewPayment({ amount: '', description: '' });
      setAddingPayment(false);
    } finally { setLoading(false); }
  };

  const markHourlyPayment = async (payId: string, received: boolean, date?: Date) => {
    const updated = await updateHourlyPayment(project._id, payId, {
      received,
      receivedDate: date || null,
    });
    onUpdate(updated);
  };

  const curr = CURRENCIES.find(c => c.code === p.currency);

  if (editing) {
    return (
      <div className="card space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-brand-500" /> Configure Pricing
        </h3>
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
              <label className="label">Total Project Price</label>
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
        <div className="flex gap-2">
          <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={saveEdit} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Pricing'}</button>
        </div>
      </div>
    );
  }

  if (p.type === 'none') {
    return (
      <div className="card text-center py-8">
        <DollarSign className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 mb-4">No pricing configured yet.</p>
        <button onClick={startEdit} className="btn-primary">Set Up Pricing</button>
      </div>
    );
  }

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-brand-500" /> Pricing
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">
            {p.type === 'fixed' ? 'Fixed Price' : 'Hourly'} · {p.currency}
          </span>
          <button onClick={startEdit} className="btn-secondary text-sm py-1.5">Edit</button>
        </div>
      </div>

      {p.type === 'fixed' && (
        <div className="space-y-3">
          {p.fixedTotal && (
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-400">Total Price</span>
              <CurrencyBadge amount={p.fixedTotal} currency={p.currency} inrRate={inrRate} />
            </div>
          )}
          {p.advanceAmount && (
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm text-slate-300 font-medium">Advance Payment</div>
                  {p.advanceReceived && p.advanceReceivedDate && (
                    <div className="text-xs text-slate-500">Received: {format(new Date(p.advanceReceivedDate), 'MMM d, yyyy')}</div>
                  )}
                </div>
                <CurrencyBadge amount={p.advanceAmount} currency={p.currency} inrRate={inrRate} />
              </div>
              {!p.advanceReceived ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-yellow-400">Pending</span>
                  <DatePicker
                    selected={null}
                    onChange={(date) => date && markAdvance(true, date)}
                    customInput={<button className="btn-primary text-xs py-1 px-2 flex items-center gap-1"><Check className="w-3 h-3" /> Mark Received</button>}
                    placeholderText="Select date"
                  />
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 font-medium">
                  <Check className="w-3 h-3" /> Received
                </span>
              )}
            </div>
          )}
          {p.finalAmount && (
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm text-slate-300 font-medium">Final Payment</div>
                  {p.finalReceived && p.finalReceivedDate && (
                    <div className="text-xs text-slate-500">Received: {format(new Date(p.finalReceivedDate), 'MMM d, yyyy')}</div>
                  )}
                </div>
                <CurrencyBadge amount={p.finalAmount} currency={p.currency} inrRate={inrRate} />
              </div>
              {!p.finalReceived ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-yellow-400">Pending</span>
                  <DatePicker
                    selected={null}
                    onChange={(date) => date && markFinal(true, date)}
                    customInput={<button className="btn-primary text-xs py-1 px-2 flex items-center gap-1"><Check className="w-3 h-3" /> Mark Received</button>}
                    placeholderText="Select date"
                  />
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 font-medium">
                  <Check className="w-3 h-3" /> Received
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {p.type === 'hourly' && (
        <div className="space-y-3">
          {p.hourlyRate && (
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-400">Hourly Rate</span>
              <CurrencyBadge amount={p.hourlyRate} currency={p.currency} inrRate={inrRate} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Payments</span>
            <button onClick={() => setAddingPayment(true)} className="btn-primary text-xs py-1 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Payment
            </button>
          </div>
          {addingPayment && (
            <div className="bg-slate-800 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" className="input text-sm" placeholder={`Amount (${curr?.symbol})`} value={newPayment.amount} onChange={e => setNewPayment(n => ({ ...n, amount: e.target.value }))} />
                <input className="input text-sm" placeholder="Description (optional)" value={newPayment.description} onChange={e => setNewPayment(n => ({ ...n, description: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingPayment(false)} className="btn-secondary text-sm py-1 flex-1">Cancel</button>
                <button onClick={handleAddPayment} disabled={!newPayment.amount || loading} className="btn-primary text-sm py-1 flex-1">Add</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {p.hourlyPayments.map(payment => (
              <div key={payment._id} className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">{payment.description || 'Payment'}</span>
                    <CurrencyBadge amount={payment.amount} currency={p.currency} inrRate={inrRate} />
                  </div>
                  {payment.received && payment.receivedDate && (
                    <div className="text-xs text-slate-500 mt-1">Received: {format(new Date(payment.receivedDate), 'MMM d, yyyy')}</div>
                  )}
                </div>
                {!payment.received ? (
                  <DatePicker
                    selected={null}
                    onChange={(date) => date && markHourlyPayment(payment._id, true, date)}
                    customInput={<button className="btn-primary text-xs py-1 px-2 whitespace-nowrap"><Check className="w-3 h-3 inline" /> Received</button>}
                  />
                ) : (
                  <span className="text-xs text-green-400 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Paid</span>
                )}
              </div>
            ))}
            {p.hourlyPayments.length === 0 && !addingPayment && (
              <p className="text-slate-500 text-sm text-center py-2">No payments added yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
