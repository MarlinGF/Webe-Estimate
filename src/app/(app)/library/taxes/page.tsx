'use client';

import { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Tax } from '@/lib/types';
import { AddTaxDialog } from '@/components/add-tax-dialog';
import { EditTaxDialog } from '@/components/edit-tax-dialog';
import { DeleteItemAlert } from '@/components/delete-item-alert';
import { useToast } from '@/hooks/use-toast';

export default function TaxesPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  
  const taxesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'taxes') : null, [firestore]);
  const { data: taxes, isLoading } = useCollection<Tax>(taxesCollectionRef);

  const handleAddTax = async (newTax: Omit<Tax, 'id'>) => {
    if (!taxesCollectionRef) return;
    try {
      await addDoc(taxesCollectionRef, newTax);
    } catch (error) {
      console.error("Error adding tax: ", error);
      toast({
        title: "Error",
        description: "Could not add tax. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTax = async (updatedTax: Tax) => {
    if (!firestore) return;
    const taxRef = doc(firestore, 'taxes', updatedTax.id);
    const { id, ...taxData } = updatedTax;
    try {
      await updateDoc(taxRef, taxData);
      setEditingTax(null);
    } catch (error) {
      console.error("Error updating tax: ", error);
      toast({
        title: "Error",
        description: "Could not update tax. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (deletingItemId && firestore) {
      const itemRef = doc(firestore, 'taxes', deletingItemId);
      try {
        await deleteDoc(itemRef);
        setDeletingItemId(null);
      } catch (error) {
        console.error("Error deleting tax: ", error);
        toast({
          title: "Error",
          description: "Could not delete tax. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(3)}%`;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Taxes</CardTitle>
          </div>
          <AddTaxDialog onAddTax={handleAddTax}>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Tax
            </Button>
          </AddTaxDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
              {!isLoading && taxes?.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell className="font-medium">{tax.name}</TableCell>
                  <TableCell>{formatRate(tax.rate)}</TableCell>
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
                        <DropdownMenuItem onSelect={() => setEditingTax(tax)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeletingItemId(tax.id)} className="text-destructive">
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
      
      {editingTax && (
        <EditTaxDialog
          tax={editingTax}
          onUpdateTax={handleUpdateTax}
          onOpenChange={(isOpen) => !isOpen && setEditingTax(null)}
        />
      )}

      {deletingItemId && (
        <DeleteItemAlert
          onDeleteConfirm={handleDeleteConfirm}
          onOpenChange={(isOpen) => !isOpen && setDeletingItemId(null)}
          itemName="tax"
        />
      )}
    </>
  );
}
