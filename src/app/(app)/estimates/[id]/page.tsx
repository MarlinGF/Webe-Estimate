'use client';

import {
  Card,
  CardContent,
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
import { formatCurrency } from '@/lib/utils';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Download, FilePlus2, Pencil } from 'lucide-react';
import { useDoc, useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { Client, Estimate, LineItem } from '@/lib/types';

export default function EstimateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore, user } = useFirebase();

  const estimateRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid, 'estimates', id) : null, [firestore, user, id]);
  const { data: estimate, isLoading: isLoadingEstimate } = useDoc<Estimate>(estimateRef);

  const clientRef = useMemoFirebase(() => (user && estimate) ? doc(firestore, 'users', user.uid, 'clients', estimate.clientId) : null, [firestore, user, estimate]);
  const { data: client, isLoading: isLoadingClient } = useDoc<Client>(clientRef);
  
  const lineItemsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'estimates', id, 'lineItems') : null, [firestore, user, id]);
  const { data: lineItems, isLoading: isLoadingLineItems } = useCollection<LineItem>(lineItemsRef);

  const isLoading = isLoadingEstimate || isLoadingLineItems || isLoadingClient;

  if (isLoading) {
    return <div>Loading estimate...</div>;
  }

  if (!estimate) {
    notFound();
  }
  
  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Approved: 'default',
    Sent: 'secondary',
    Rejected: 'destructive',
    Draft: 'outline',
  };

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/estimates">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Estimate {estimate.estimateNumber}
          </h1>
          <Badge variant={statusColors[estimate.status] || 'outline'} className="ml-auto sm:ml-0">{estimate.status}</Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
             <Button variant="outline" size="sm" asChild>
              <Link href={`/estimates/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-2"/>
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2"/>
              Download
            </Button>
            <Button size="sm">
              <FilePlus2 className="h-4 w-4 mr-2"/>
              Convert to Invoice
            </Button>
          </div>
        </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">Estimate</CardTitle>
              <div className="text-muted-foreground">
                <div>{estimate.estimateNumber}</div>
                <div>Issued: {new Date(estimate.estimateDate).toLocaleDateString()}</div>
                <div>Expires: {new Date(estimate.expiryDate).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">Client</div>
              <div className="text-muted-foreground">
                {client ? `${client.firstName} ${client.lastName}` : estimate.clientId}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium"><div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} /></TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.quantity * item.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(estimate.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(estimate.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(estimate.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
        <Button variant="outline" size="sm" asChild>
              <Link href={`/estimates/${id}/edit`}>
                Edit
              </Link>
        </Button>
        <Button variant="outline" size="sm">
          Download
        </Button>
        <Button size="sm">
          Convert to Invoice
        </Button>
      </div>
    </div>
  );
}
