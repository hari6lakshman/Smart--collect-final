export type Case = {
  id: string;
  debtorName: string;
  invoiceNo: string;
  dueAmount: number;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Paid' | 'Defaulted';
  priorityScore: number | null;
  assignedDcaId: string | null;
  overdueAging: number;
  recoveryRate: number;
  hasOverdueHistory: number;
  communicationHistory: string;
  feedback?: string;
  responseMode?: 'calling' | 'email' | 'messaging';
};

export type Dca = {
  id: string;
  name: string;
  username: string;
  password: string;
  caseCount: number;
  recoveryRate: number;
  caseHistory: string;
};

export type TimetableEntry = {
  id: string;
  dcaId: string;
  date: string;
  task: string;
  time: string;
};
