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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Estimate, Client } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';

export default function EstimatesPage() {
  const { firestore, user } = useFirebase();

  const clientsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'clients') : null, [firestore, user]);
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsCollection);
  
  const estimatesCollection = useMemoFirebase(() => user ? query(collection(firestore, 'users', user.uid, 'estimates')) : null, [firestore, user]);
  const { data: estimates, isLoading: isLoadingEstimates } = useCollection<Estimate>(estimatesCollection);
  
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

  const isLoading = isLoadingClients || isLoadingEstimates;

  const combinedEstimates = useMemo(() => 
    estimates?.map(e => ({...e, client: clientsById[e.clientId]})) || [], 
  [estimates, clientsById]);

  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Approved: 'default',
    Sent: 'secondary',
    Rejected: 'destructive',
    Draft: 'outline',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Estimates</CardTitle>
          <CardDescription>
            Create and manage your estimates.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="gap-1">
          <Link href="/estimates/create">
            <PlusCircle className="h-4 w-4" />
            Create Estimate
          </Link>
        </Button>
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
            {!isLoading && combinedEstimates?.map((estimate) => (
              <TableRow key={estimate.id}>
                <TableCell className="font-medium">
                  <Link href={`/estimates/${estimate.id}`} className="text-primary hover:underline">
                    {estimate.estimateNumber}
                  </Link>
                </TableCell>
                <TableCell>{estimate.client?.firstName} {estimate.client?.lastName}</TableCell>
                <TableCell>{estimate.estimateDate}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[estimate.status] || 'outline'}>{estimate.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(estimate.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
