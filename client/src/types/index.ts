export interface IConfigFile {
  _id: string;
  name: string;
  path: string;
  content: string;
  createdAt: string;
}

export interface IEnvVariable {
  _id: string;
  key: string;
  value: string;
  scope: 'all' | 'client' | 'server';
}

export interface IPaymentEntry {
  _id: string;
  amount: number;
  received: boolean;
  receivedDate?: string;
  description?: string;
}

export interface IPricing {
  type: 'fixed' | 'hourly' | 'none';
  currency: string;
  fixedTotal?: number;
  advanceAmount?: number;
  advanceReceived: boolean;
  advanceReceivedDate?: string;
  finalAmount?: number;
  finalReceived: boolean;
  finalReceivedDate?: string;
  hourlyRate?: number;
  hourlyPayments: IPaymentEntry[];
}

export interface ITimer {
  totalSeconds: number;
  isRunning: boolean;
  lastStarted?: string;
}

export interface IMeetingLink {
  _id: string;
  platform: 'google-meet' | 'zoom' | 'teams' | 'other';
  label?: string;
  url: string;
}

export interface IContact {
  _id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  meetingLinks: IMeetingLink[];
  notes?: string;
  createdAt: string;
}

export interface IProject {
  _id: string;
  name: string;
  brief?: string;
  status: 'planning' | 'ongoing' | 'on-hold' | 'completed' | 'abandoned';
  repoType?: 'single' | 'multi';
  timer: ITimer;
  configFiles: IConfigFile[];
  envVariables: IEnvVariable[];
  pricing: IPricing;
  contacts: IContact[];
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INote {
  _id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];
