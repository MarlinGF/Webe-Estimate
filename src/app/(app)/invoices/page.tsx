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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, doc, deleteDoc } from 'firebase/firestore';
import type { Invoice, Client } from '@/lib/types';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeleteItemAlert } from '@/components/delete-item-alert';
import { useToast } from '@/hooks/use-toast';

export default function InvoicesPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const clientsPath = useMemo(() => user ? `users/${user.uid}/clients` : null, [user]);
  const clientsCollection = useMemoFirebase(() => clientsPath ? collection(firestore, clientsPath) : null, [firestore, clientsPath]);
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsCollection);
  
  const invoicesPath = useMemo(() => user ? `users/${user.uid}/invoices` : null, [user]);
  const invoicesCollection = useMemoFirebase(() => invoicesPath ? query(collection(firestore, invoicesPath)) : null, [firestore, invoicesPath]);
  const { data: invoices, isLoading: isLoadingInvoices } = useCollection<Invoice>(invoicesCollection);
  
  const clientsById = useMemo(() => {
    if (!clients) return {};
    return clients.reduce((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {} as {[key: string]: Client});
  }, [clients]);

  const isLoading = isLoadingClients || isLoadingInvoices;

  const combinedInvoices = useMemo(() => 
    invoices?.map(i => ({...i, client: clientsById[i.clientId]})) || [],
  [invoices, clientsById]);

  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Paid: 'default',
    Sent: 'secondary',
    Overdue: 'destructive',
    Draft: 'outline',
  };
  
  const handleDeleteConfirm = async () => {
    if (deletingItemId && user) {
      const itemRef = doc(firestore, 'users', user.uid, 'invoices', deletingItemId);
      try {
        await deleteDoc(itemRef);
        setDeletingItemId(null);
        toast({ title: "Invoice Deleted", description: "The invoice has been successfully deleted."});
      } catch (error) {
        console.error("Error deleting invoice: ", error);
        toast({
          title: "Error",
          description: "Could not delete invoice. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Manage your invoices and track payments.
            </CardDescription>
          </div>
           <Button asChild size="sm" className="gap-1">
            <Link href="/invoices/create">
              <PlusCircle className="h-4 w-4" />
              Create Invoice
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
                 <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>}
              {!isLoading && combinedInvoices?.map((invoice) => (
                <TableRow key={invoice.id} onClick={() => router.push(`/invoices/${invoice.id}`)} className="cursor-pointer">
                  <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{invoice.client?.firstName} {invoice.client?.lastName}</TableCell>
                  <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[invoice.status] || 'outline'}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => router.push(`/invoices/${invoice.id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeletingItemId(invoice.id)} className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {deletingItemId && (
        <DeleteItemAlert
          onDeleteConfirm={handleDeleteConfirm}
          onOpenChange={(isOpen) => !isOpen && setDeletingItemId(null)}
          itemName="invoice"
        />
      )}
    </>
  );
}
