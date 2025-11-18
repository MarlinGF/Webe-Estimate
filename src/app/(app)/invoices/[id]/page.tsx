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
import { formatCurrency, stripHtml } from '@/lib/utils';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Download, Pencil } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useDoc, useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { Client, Invoice, LineItem, Service, Part } from '@/lib/types';
import { LineItemRow } from '@/components/line-item-row';
import { useMemo } from 'react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore, user } = useFirebase();

  const invoiceRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid, 'invoices', id) : null, [firestore, user, id]);
  const { data: invoice, isLoading: isLoadingInvoice } = useDoc<Invoice>(invoiceRef);
  
  const clientRef = useMemoFirebase(() => (user && invoice) ? doc(firestore, 'users', user.uid, 'clients', invoice.clientId) : null, [firestore, user, invoice]);
  const { data: client, isLoading: isLoadingClient } = useDoc<Client>(clientRef);

  const lineItemsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'invoices', id, 'lineItems') : null, [firestore, user, id]);
  const { data: lineItems, isLoading: isLoadingLineItems } = useCollection<LineItem>(lineItemsRef);

  const servicesRef = useMemoFirebase(() => firestore ? collection(firestore, 'services') : null, [firestore]);
  const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesRef);

  const partsRef = useMemoFirebase(() => firestore ? collection(firestore, 'parts') : null, [firestore]);
  const { data: parts, isLoading: isLoadingParts } = useCollection<Part>(partsRef);

  const libraryItems = useMemo(() => [...(services || []), ...(parts || [])], [services, parts]);

  const isLoading = isLoadingInvoice || isLoadingClient || isLoadingLineItems || isLoadingServices || isLoadingParts;

  const findLibraryItem = (description: string) => {
    const plainDescription = stripHtml(description).trim();
    if (!plainDescription) return undefined;
    return libraryItems.find(libItem => {
        const libItemDescription = stripHtml(libItem.description).trim();
        return libItem.name === plainDescription || (libItemDescription && libItemDescription === plainDescription);
    });
  };

  if (isLoading) {
    return <div>Loading invoice...</div>;
  }

  if (!invoice) {
    notFound();
  }

  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Paid: 'default',
    Sent: 'secondary',
    Overdue: 'destructive',
    Draft: 'outline',
  };

  const balanceDue = invoice.total - invoice.amountPaid;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Invoice {invoice.invoiceNumber}
          </h1>
          <Badge variant={statusColors[invoice.status] || 'outline'} className="ml-auto sm:ml-0">{invoice.status}</Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
             <Button variant="outline" size="sm" asChild>
              <Link href={`/invoices/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-2"/>
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2"/>
              Download PDF
            </Button>
            {invoice.status !== 'Paid' && (
              <Button size="sm">
                <CreditCard className="h-4 w-4 mr-2"/>
                Pay Now
              </Button>
            )}
          </div>
        </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">Invoice</CardTitle>
              <div className="text-muted-foreground">
                <div>{invoice.invoiceNumber}</div>
                <div>Issued: {new Date(invoice.invoiceDate).toLocaleDateString()}</div>
                <div>Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{client ? `${client.firstName} ${client.lastName}` : invoice.clientId}</div>
              <div className="text-muted-foreground">
                {client?.address}
              </div>
              <div className="text-muted-foreground">
                {client?.email}
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
              {lineItems?.map((item) => {
                const libraryItem = findLibraryItem(item.description);
                const itemName = libraryItem?.name || stripHtml(item.description).split(' ').slice(0,3).join(' ') || "Line Item";
                return (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    itemName={itemName}
                    itemImage={libraryItem?.imageUrl}
                  />
                );
              })}
            </TableBody>
          </Table>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <Separator />
               <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span>-{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-primary">
                <span>Balance Due</span>
                <span>{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
         <Button variant="outline" size="sm" asChild>
            <Link href={`/invoices/${id}/edit`}>
              Edit
            </Link>
          </Button>
         <Button variant="outline" size="sm">
            Download PDF
        </Button>
        {invoice.status !== 'Paid' && (
          <Button size="sm">
            Pay Now
          </Button>
        )}
      </div>
    </div>
  );
}
