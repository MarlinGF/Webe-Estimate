
'use client';

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
import { DollarSign, FileText, Receipt, Users } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Estimate, Invoice, Client } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';

export default function Dashboard() {
  const { firestore, user } = useFirebase();

  const clientsPath = useMemo(() => user ? `users/${user.uid}/clients` : null, [user]);
  const clientsCollection = useMemoFirebase(() => clientsPath ? collection(firestore, clientsPath) : null, [firestore, clientsPath]);
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsCollection);
  
  const estimatesPath = useMemo(() => user ? `users/${user.uid}/estimates` : null, [user]);
  const estimatesQuery = useMemoFirebase(() => estimatesPath ? query(collection(firestore, estimatesPath)) : null, [firestore, estimatesPath]);
  const { data: estimates, isLoading: isLoadingEstimates } = useCollection<Estimate>(estimatesQuery);

  const invoicesPath = useMemo(() => user ? `users/${user.uid}/invoices` : null, [user]);
  const invoicesQuery = useMemoFirebase(() => invoicesPath ? query(collection(firestore, invoicesPath)) : null, [firestore, invoicesPath]);
  const { data: invoices, isLoading: isLoadingInvoices } = useCollection<Invoice>(invoicesQuery);
  
  const clientsById = useMemo(() => {
    if (!clients) return {};
    return clients.reduce((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {} as {[key: string]: Client});
  }, [clients]);

  const isLoading = isLoadingClients || isLoadingEstimates || isLoadingInvoices;

  const combinedEstimates = useMemo(() => {
    if (!estimates || !clientsById) return [];
    return estimates.map(e => ({...e, client: clientsById[e.clientId]}));
  }, [estimates, clientsById]);

  const combinedInvoices = useMemo(() => {
    if (!invoices || !clientsById) return [];
    return invoices.map(i => ({...i, client: clientsById[i.clientId]}));
  }, [invoices, clientsById]);

  const totalRevenue = useMemo(() => 
    invoices?.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0) ?? 0,
  [invoices]);
  
  const openEstimates = useMemo(() =>
    estimates?.filter(
      (est) => est.status === 'Sent' || est.status === 'Draft'
    ).length ?? 0,
  [estimates]);

  const overdueInvoices = useMemo(() =>
    invoices?.filter(
      (inv) => inv.status === 'Overdue'
    ).length ?? 0,
  [invoices]);
  
  const clientsCount = clients?.length ?? 0;

  const recentActivity = useMemo(() => 
    [...(combinedEstimates || []), ...(combinedInvoices || [])]
    .sort(
      (a, b) => {
        const dateA = new Date('invoiceDate' in a ? a.invoiceDate : a.estimateDate).getTime();
        const dateB = new Date('invoiceDate' in b ? b.invoiceDate : b.estimateDate).getTime();
        return dateB - dateA;
      }
    )
    .slice(0, 5), [combinedEstimates, combinedInvoices]);
  
  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Paid: 'default',
    Sent: 'secondary',
    Overdue: 'destructive',
    Approved: 'default',
    Draft: 'outline',
    Rejected: 'destructive',
  };


  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Based on amount paid on all invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Estimates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{openEstimates}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting client approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Require follow-up
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{clientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all documents
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            An overview of the latest estimates and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((doc) => (
                <TableRow key={('invoiceNumber' in doc ? doc.invoiceNumber : doc.estimateNumber) + doc.id}>
                  <TableCell>
                    {doc.client ? (
                      <>
                        <div className="font-medium">{doc.client?.firstName} {doc.client?.lastName}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {doc.client?.email}
                        </div>
                      </>
                    ) : 'Loading...'}
                  </TableCell>
                  <TableCell>
                    {'invoiceNumber' in doc ? 'Invoice' : 'Estimate'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[doc.status] || 'outline'}>{doc.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {'invoiceDate' in doc ? new Date(doc.invoiceDate).toLocaleDateString() : new Date(doc.estimateDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(doc.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
