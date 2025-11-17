'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Invoice, Client } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function InvoicesPage() {
  const { firestore, user } = useFirebase();

  const clientsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'clients') : null, [firestore, user]);
  const invoicesCollection = useMemoFirebase(() => user ? query(collection(firestore, 'users', user.uid, 'invoices')) : null, [firestore, user]);
  
  const { data: clients, isLoading: isLoadingClients } = useCollection<Omit<Client, 'id'>>(clientsCollection);
  const { data: invoices, isLoading: isLoadingInvoices } = useCollection<Omit<Invoice, 'id' | 'client'>>(invoicesCollection);
  const [clientsById, setClientsById] = useState<{[key: string]: Client}>({});

  useEffect(() => {
    if (clients) {
      const byId = clients.reduce((acc, client) => {
        acc[client.id] = client;
        return acc;
      }, {} as {[key: string]: Client});
      setClientsById(byId);
    }
  }, [clients]);

  const combinedInvoices = invoices?.map(i => ({...i, client: clientsById[i.clientId]}));

  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Paid: 'default',
    Sent: 'secondary',
    Overdue: 'destructive',
    Draft: 'outline',
  };

  const isLoading = isLoadingClients || isLoadingInvoices;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>
          Manage your invoices and track payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>}
            {!isLoading && combinedInvoices?.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  <Link href={`/invoices/${invoice.id}`} className="text-primary hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell>{invoice.client?.firstName} {invoice.client?.lastName}</TableCell>
                <TableCell>{invoice.invoiceDate}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[invoice.status] || 'outline'}>{invoice.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(invoice.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
