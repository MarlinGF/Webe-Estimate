export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  userId?: string;
}

export interface Item {
  id: string;
  name:string;
  description: string;
  price: number;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  client: Client;
  estimateDate: string;
  expiryDate: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  estimateNumber: string;
  client: Client;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  postedBy: string;
  location: string;
}
