import mongoose, { Schema, Document } from 'mongoose';

export interface IConfigFile {
  _id?: mongoose.Types.ObjectId;
  name: string;
  path: string;
  content: string;
  createdAt: Date;
}

export interface IEnvVariable {
  _id?: mongoose.Types.ObjectId;
  key: string;
  value: string;
  scope: 'all' | 'client' | 'server';
}

export interface IPaymentEntry {
  _id?: mongoose.Types.ObjectId;
  amount: number;
  received: boolean;
  receivedDate?: Date;
  description?: string;
}

export interface IPricing {
  type: 'fixed' | 'hourly' | 'none';
  currency: string;
  fixedTotal?: number;
  advanceAmount?: number;
  advanceReceived: boolean;
  advanceReceivedDate?: Date;
  finalAmount?: number;
  finalReceived: boolean;
  finalReceivedDate?: Date;
  hourlyRate?: number;
  hourlyPayments: IPaymentEntry[];
}

export interface ITimer {
  totalSeconds: number;
  isRunning: boolean;
  lastStarted?: Date;
}

export interface IMeetingLink {
  _id?: mongoose.Types.ObjectId;
  platform: 'google-meet' | 'zoom' | 'teams' | 'other';
  label?: string;
  url: string;
}

export interface IContact {
  _id?: mongoose.Types.ObjectId;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  meetingLinks: IMeetingLink[];
  notes?: string;
  createdAt: Date;
}

export interface IProject extends Document {
  name: string;
  brief?: string;
  status: 'planning' | 'ongoing' | 'on-hold' | 'completed' | 'abandoned';
  repoType?: 'single' | 'multi';
  timer: ITimer;
  configFiles: IConfigFile[];
  envVariables: IEnvVariable[];
  pricing: IPricing;
  contacts: IContact[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentEntrySchema = new Schema<IPaymentEntry>({
  amount: { type: Number, required: true },
  received: { type: Boolean, default: false },
  receivedDate: Date,
  description: String,
});

const PricingSchema = new Schema<IPricing>({
  type: { type: String, enum: ['fixed', 'hourly', 'none'], default: 'none' },
  currency: { type: String, default: 'USD' },
  fixedTotal: Number,
  advanceAmount: Number,
  advanceReceived: { type: Boolean, default: false },
  advanceReceivedDate: Date,
  finalAmount: Number,
  finalReceived: { type: Boolean, default: false },
  finalReceivedDate: Date,
  hourlyRate: Number,
  hourlyPayments: [PaymentEntrySchema],
});

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    brief: { type: String, trim: true },
    status: { type: String, enum: ['planning', 'ongoing', 'on-hold', 'completed', 'abandoned', 'active', 'paused'], default: 'ongoing' },
    timer: {
      totalSeconds: { type: Number, default: 0 },
      isRunning: { type: Boolean, default: false },
      lastStarted: Date,
    },
    configFiles: [
      {
        name: { type: String, required: true },
        path: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    repoType: { type: String, enum: ['single', 'multi'] },
    envVariables: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
        scope: { type: String, enum: ['all', 'client', 'server'], default: 'all' },
      },
    ],
    pricing: { type: PricingSchema, default: () => ({ type: 'none', currency: 'USD', advanceReceived: false, finalReceived: false, hourlyPayments: [] }) },
    contacts: [
      {
        name: { type: String, required: true, trim: true },
        role: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        meetingLinks: [
          {
            platform: { type: String, enum: ['google-meet', 'zoom', 'teams', 'other'], default: 'other' },
            label: { type: String, trim: true },
            url: { type: String, required: true, trim: true },
          },
        ],
        notes: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
