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
import { notFound, useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Download, FilePlus2, Pencil, Loader2 } from 'lucide-react';
import { useDoc, useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, writeBatch, addDoc, updateDoc } from 'firebase/firestore';
import type { Client, Estimate, LineItem, Service, Part } from '@/lib/types';
import { LineItemRow } from '@/components/line-item-row';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function EstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const { firestore, user } = useFirebase();

  const [isConverting, setIsConverting] = useState(false);

  const estimateRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid, 'estimates', id) : null, [firestore, user, id]);
  const { data: estimate, isLoading: isLoadingEstimate } = useDoc<Estimate>(estimateRef);

  const clientRef = useMemoFirebase(() => (user && estimate) ? doc(firestore, 'users', user.uid, 'clients', estimate.clientId) : null, [firestore, user, estimate]);
  const { data: client, isLoading: isLoadingClient } = useDoc<Client>(clientRef);
  
  const lineItemsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'estimates', id, 'lineItems') : null, [firestore, user, id]);
  const { data: lineItems, isLoading: isLoadingLineItems } = useCollection<LineItem>(lineItemsRef);

  const servicesRef = useMemoFirebase(() => firestore ? collection(firestore, 'services') : null, [firestore]);
  const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesRef);

  const partsRef = useMemoFirebase(() => firestore ? collection(firestore, 'parts') : null, [firestore]);
  const { data: parts, isLoading: isLoadingParts } = useCollection<Part>(partsRef);

  const libraryItems = useMemo(() => [...(services || []), ...(parts || [])], [services, parts]);

  const isLoading = isLoadingEstimate || isLoadingLineItems || isLoadingClient || isLoadingServices || isLoadingParts;

  const findLibraryItem = (description: string) => {
    const plainDescription = stripHtml(description).trim();
    if (!plainDescription) return undefined;
    return libraryItems.find(libItem => {
        const libItemDescription = stripHtml(libItem.description).trim();
        return libItem.name === plainDescription || (libItemDescription && libItemDescription === plainDescription);
    });
  };

  const handleConvertToInvoice = async () => {
    if (!user || !firestore || !estimate || !lineItems) return;

    if (estimate.convertedInvoiceId) {
      router.push(`/invoices/${estimate.convertedInvoiceId}`);
      return;
    }

    setIsConverting(true);

    try {
      const batch = writeBatch(firestore);

      // 1. Create new Invoice from Estimate data
      const invoicesCollectionRef = collection(firestore, 'users', user.uid, 'invoices');
      const newInvoiceRef = doc(invoicesCollectionRef);
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      batch.set(newInvoiceRef, {
        clientId: estimate.clientId,
        estimateId: estimate.id,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        status: 'Draft',
        subtotal: estimate.subtotal,
        tax: estimate.tax,
        total: estimate.total,
        taxId: estimate.taxId,
        amountPaid: 0,
        userId: user.uid,
        webeContext: estimate.webeContext,
      });

      // 2. Copy line items to the new invoice's subcollection
      const invoiceLineItemsCollectionRef = collection(newInvoiceRef, 'lineItems');
      lineItems.forEach(item => {
        const { id, ...itemData } = item;
        const newItemRef = doc(invoiceLineItemsCollectionRef);
        batch.set(newItemRef, itemData);
      });
      
      // 3. Update the original estimate
      if (estimateRef) {
          batch.update(estimateRef, {
            convertedInvoiceId: newInvoiceRef.id,
            status: 'Converted',
          });
      }

      // 4. Commit the batch
      await batch.commit();

      toast({
        title: 'Invoice Created',
        description: 'The estimate has been successfully converted to an invoice.',
      });

      // 5. Navigate to the new invoice
      router.push(`/invoices/${newInvoiceRef.id}`);

    } catch (error) {
      console.error("Error converting estimate to invoice:", error);
      toast({
        title: 'Conversion Failed',
        description: 'There was an error converting the estimate to an invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };


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
    Converted: 'default',
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
            <Button size="sm" onClick={handleConvertToInvoice} disabled={isConverting}>
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                  Converting...
                </>
              ) : (
                <>
                  <FilePlus2 className="h-4 w-4 mr-2"/>
                  {estimate.convertedInvoiceId ? 'View Invoice' : 'Convert to Invoice'}
                </>
              )}
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
        <Button size="sm" onClick={handleConvertToInvoice} disabled={isConverting}>
            {isConverting ? (
                <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                Converting...
                </>
            ) : (
                <>
                <FilePlus2 className="h-4 w-4 mr-2"/>
                 {estimate.convertedInvoiceId ? 'View Invoice' : 'Convert to Invoice'}
                </>
            )}
        </Button>
      </div>
    </div>
  );
}
