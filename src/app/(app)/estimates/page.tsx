'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import type { Estimate, Client } from '@/lib/types';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DeleteItemAlert } from '@/components/delete-item-alert';
import { useToast } from '@/hooks/use-toast';

export default function EstimatesPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const estimatesCollectionRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'estimates') : null, [firestore, user]);
  const { data: estimates, isLoading: isLoadingEstimates } = useCollection<Estimate>(estimatesCollectionRef);

  const clientsCollectionRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'clients') : null, [firestore, user]);
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsCollectionRef);

  const clientsById = useMemo(() => {
    if (!clients) return {};
    return clients.reduce((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {} as {[key: string]: Client});
  }, [clients]);

  const isLoading = isLoadingEstimates || isLoadingClients;
  
  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Approved: 'default',
    Sent: 'secondary',
    Rejected: 'destructive',
    Draft: 'outline',
  };

  const getClientName = (clientId: string) => {
    const client = clientsById[clientId];
    return client ? `${client.firstName} ${client.lastName}` : clientId;
  }

  const handleDeleteConfirm = async () => {
    if (deletingItemId && user) {
      const itemRef = doc(firestore, 'users', user.uid, 'estimates', deletingItemId);
      try {
        await deleteDoc(itemRef);
        setDeletingItemId(null);
        toast({ title: "Estimate Deleted", description: "The estimate has been successfully deleted."});
      } catch (error) {
        console.error("Error deleting estimate: ", error);
        toast({
          title: "Error",
          description: "Could not delete estimate. Please try again.",
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
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>}
              {!isLoading && estimates?.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">
                    <Link href={`/estimates/${estimate.id}`} className="text-primary hover:underline">
                      {estimate.estimateNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{getClientName(estimate.clientId)}</TableCell>
                  <TableCell>{new Date(estimate.estimateDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[estimate.status] || 'outline'}>{estimate.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(estimate.total)}
                  </TableCell>
                  <TableCell>
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
                        <DropdownMenuItem onSelect={() => router.push(`/estimates/${estimate.id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeletingItemId(estimate.id)} className="text-destructive">
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
          itemName="estimate"
        />
      )}
    </>
  );
}
