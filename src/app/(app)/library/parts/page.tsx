'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, ImageIcon, MoreHorizontal } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Part } from '@/lib/types';
import { AddPartDialog } from '@/components/add-part-dialog';
import { EditPartDialog } from '@/components/edit-part-dialog';
import { DeleteItemAlert } from '@/components/delete-item-alert';

export default function PartsPage() {
  const { firestore } = useFirebase();
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  
  const partsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'parts') : null, [firestore]);
  const { data: parts, isLoading } = useCollection<Part>(partsCollection);

  const handleAddPart = (newPart: Omit<Part, 'id'>) => {
    if (!partsCollection) return;
    addDocumentNonBlocking(partsCollection, newPart);
  };

  const handleUpdatePart = (updatedPart: Part) => {
    if (!firestore) return;
    const partRef = doc(firestore, 'parts', updatedPart.id);
    const { id, ...partData } = updatedPart;
    updateDocumentNonBlocking(partRef, partData);
    setEditingPart(null);
  };
  
  const handleDeleteConfirm = () => {
    if (deletingItemId && firestore) {
      const itemRef = doc(firestore, 'parts', deletingItemId);
      deleteDocumentNonBlocking(itemRef);
      setDeletingItemId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Parts</CardTitle>
            <CardDescription>
              Manage your parts and materials for cost tracking.
            </CardDescription>
          </div>
          <AddPartDialog onAddPart={handleAddPart}>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Part
            </Button>
          </AddPartDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>}
              {!isLoading && parts?.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>
                    {part.imageUrl ? (
                      <Image
                        src={part.imageUrl}
                        alt={part.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>{formatCurrency(part.cost)}</TableCell>
                  <TableCell>{formatCurrency(part.price)}</TableCell>
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
                        <DropdownMenuItem onSelect={() => setEditingPart(part)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeletingItemId(part.id)} className="text-destructive">
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
      
      {editingPart && (
        <EditPartDialog
          part={editingPart}
          onUpdatePart={handleUpdatePart}
          onOpenChange={(isOpen) => !isOpen && setEditingPart(null)}
        />
      )}

      {deletingItemId && (
        <DeleteItemAlert
          onDeleteConfirm={handleDeleteConfirm}
          onOpenChange={(isOpen) => !isOpen && setDeletingItemId(null)}
          itemName="part"
        />
      )}
    </>
  );
}
