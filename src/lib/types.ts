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
  description?: string;
  price: number;
  imageUrl?: string;
}

export interface Service extends Item {}

export interface Part extends Item {
    cost: number;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
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
  clientId: string;
  client?: Client;
  estimateDate: string;
  expiryDate: string;
  lineItems?: LineItem[]; // lineItems are now a subcollection
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  estimateNumber: string;
  clientId: string;
  client?: Client;
  invoiceDate: string;
  dueDate: string;
  lineItems?: LineItem[]; // lineItems are now a subcollection
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

    
