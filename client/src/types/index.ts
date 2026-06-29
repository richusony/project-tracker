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

export interface IProject {
  _id: string;
  name: string;
  brief?: string;
  status: 'active' | 'paused' | 'completed';
  timer: ITimer;
  configFiles: IConfigFile[];
  envVariables: IEnvVariable[];
  pricing: IPricing;
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
