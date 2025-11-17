import type { Client, Estimate, Invoice, Item, Project } from './types';

export const clients: Client[] = [
  { id: 'cli-1', name: 'Innovate LLC', email: 'contact@innovatellc.com', phone: '555-1234', address: '123 Tech Park, Silicon Valley, CA' },
  { id: 'cli-2', name: 'Solutions Inc.', email: 'support@solutions.io', phone: '555-5678', address: '456 Business Blvd, New York, NY' },
  { id: 'cli-3', name: 'Creative Co.', email: 'hello@creative.co', phone: '555-8765', address: '789 Art Lane, Los Angeles, CA' },
  { id: 'cli-4', name: 'Synergy Group', email: 'info@synergy.com', phone: '555-4321', address: '321 Fusion Way, Chicago, IL' },
];

export const services: Item[] = [
  { id: 'ser-1', name: 'Web Design Consultation', description: 'Initial consultation and project scoping for web design projects.', price: 150 },
  { id: 'ser-2', name: 'Frontend Development (hourly)', description: 'Hourly rate for building responsive and interactive user interfaces.', price: 120 },
  { id: 'ser-3', name: 'Backend Development (hourly)', description: 'Hourly rate for server-side logic, APIs, and database management.', price: 135 },
  { id: 'ser-4', name: 'Full-Stack Project Retainer', description: 'Monthly retainer for ongoing full-stack development and maintenance.', price: 4500 },
];

export const parts: Item[] = [
  { id: 'par-1', name: 'Standard SSL Certificate', description: '1-year standard domain validation SSL certificate.', price: 50 },
  { id: 'par-2', name: 'Premium UI Kit License', description: 'Single project license for a premium UI component library.', price: 250 },
  { id: 'par-3', name: 'Cloud Server (Standard Tier)', description: 'Monthly cost for a standard tier cloud virtual private server.', price: 80 },
];

const estimate1LineItems = [
  { id: 'li-1', description: 'Web Design Consultation', quantity: 2, price: 150 },
  { id: 'li-2', description: 'Frontend Development (hourly)', quantity: 40, price: 120 },
  { id: 'li-3', description: 'Premium UI Kit License', quantity: 1, price: 250 },
];
const estimate1Subtotal = estimate1LineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
const estimate1Tax = estimate1Subtotal * 0.08;

const estimate2LineItems = [
  { id: 'li-4', description: 'Backend Development (hourly)', quantity: 50, price: 135 },
  { id: 'li-5', description: 'Cloud Server (Standard Tier)', quantity: 1, price: 80 },
  { id: 'li-6', description: 'Standard SSL Certificate', quantity: 1, price: 50 },
];
const estimate2Subtotal = estimate2LineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
const estimate2Tax = estimate2Subtotal * 0.08;

export const estimates: Estimate[] = [
  {
    id: 'est-1',
    estimateNumber: 'EST-2024-001',
    client: clients[0],
    estimateDate: '2024-07-15',
    expiryDate: '2024-08-14',
    lineItems: estimate1LineItems,
    subtotal: estimate1Subtotal,
    tax: estimate1Tax,
    total: estimate1Subtotal + estimate1Tax,
    status: 'Approved',
  },
  {
    id: 'est-2',
    estimateNumber: 'EST-2024-002',
    client: clients[1],
    estimateDate: '2024-07-18',
    expiryDate: '2024-08-17',
    lineItems: estimate2LineItems,
    subtotal: estimate2Subtotal,
    tax: estimate2Tax,
    total: estimate2Subtotal + estimate2Tax,
    status: 'Sent',
  },
  {
    id: 'est-3',
    estimateNumber: 'EST-2024-003',
    client: clients[2],
    estimateDate: '2024-07-20',
    expiryDate: '2024-08-19',
    lineItems: [{ id: 'li-7', description: 'Full-Stack Project Retainer', quantity: 1, price: 4500 }],
    subtotal: 4500,
    tax: 360,
    total: 4860,
    status: 'Draft',
  },
];

export const invoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    estimateNumber: 'EST-2024-001',
    client: clients[0],
    invoiceDate: '2024-07-20',
    dueDate: '2024-08-19',
    lineItems: estimate1LineItems,
    subtotal: estimate1Subtotal,
    tax: estimate1Tax,
    total: estimate1Subtotal + estimate1Tax,
    amountPaid: estimate1Subtotal + estimate1Tax,
    status: 'Paid',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    estimateNumber: 'EST-2024-004', // Made up for example
    client: clients[3],
    invoiceDate: '2024-06-01',
    dueDate: '2024-07-01',
    lineItems: [{ id: 'li-8', description: 'Emergency Server Maintenance', quantity: 5, price: 200 }],
    subtotal: 1000,
    tax: 80,
    total: 1080,
    amountPaid: 0,
    status: 'Overdue',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    estimateNumber: 'EST-2024-005', // Made up for example
    client: clients[1],
    invoiceDate: '2024-07-22',
    dueDate: '2024-08-21',
    lineItems: [{ id: 'li-9', description: 'Marketing Site Development', quantity: 1, price: 6000 }],
    subtotal: 6000,
    tax: 480,
    total: 6480,
    amountPaid: 0,
    status: 'Sent',
  },
];

export const projects: Project[] = [
    { id: 'proj-1', title: 'E-commerce Platform Redesign', description: 'Looking for a full redesign of our Shopify store. Need a modern, mobile-first design and improved performance.', budget: 15000, postedBy: 'FashionForward Inc.', location: 'Remote' },
    { id: 'proj-2', title: 'Mobile App for Local Services', description: 'We need an iOS and Android app that connects users with local service providers. Key features: booking, payments, reviews.', budget: 45000, postedBy: 'ConnectLocal', location: 'Austin, TX' },
    { id: 'proj-3', title: 'Internal Dashboard for Analytics', description: 'Develop a custom analytics dashboard using React and D3.js to visualize our sales data from multiple sources.', budget: 25000, postedBy: 'DataDriven Corp', location: 'Remote' },
]
