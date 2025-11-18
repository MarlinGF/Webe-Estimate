'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { formatCurrency, stripHtml } from '@/lib/utils';
import { PlusCircle, ImageIcon, MoreHorizontal } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Part } from '@/lib/types';
import { AddPartDialog } from '@/components/add-part-dialog';
import { EditPartDialog } from '@/components/edit-part-dialog';
import { DeleteItemAlert } from '@/components/delete-item-alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function PartRow({ part, onEdit, onDelete }: { part: Part; onEdit: (part: Part) => void; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const plainTextDescription = stripHtml(part.description);
  const isLong = plainTextDescription.length > 140;
  const preview = isLong ? `${plainTextDescription.slice(0, 140)}...` : plainTextDescription;

  return (
    <TableRow key={part.id} onClick={() => {}} className="cursor-pointer">
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
      <TableCell className="font-medium align-top">
        <div className="font-medium">{part.name}</div>
         {plainTextDescription && (
           <div className="text-sm text-muted-foreground max-w-md">
            {expanded ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: part.description! }}
              />
            ) : (
              <span>{preview}</span>
            )}
            {isLong && (
              <Button
                variant="link"
                className="h-auto p-0 text-xs ml-1"
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded)
                }}
              >
                {expanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="align-top">{formatCurrency(part.cost)}</TableCell>
      <TableCell className="align-top">{formatCurrency(part.price)}</TableCell>
      <TableCell onClick={(e) => e.stopPropagation()} className="align-top">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onEdit(part)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(part.id)} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}


export default function PartsPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  
  const partsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'parts') : null, [firestore]);
  const { data: parts, isLoading } = useCollection<Part>(partsCollectionRef);

  const handleAddPart = async (newPart: Omit<Part, 'id'>) => {
    if (!partsCollectionRef) return;
    try {
      await addDoc(partsCollectionRef, newPart);
    } catch (error) {
      console.error("Error adding part: ", error);
      toast({
        title: "Error",
        description: "Could not add part. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePart = async (updatedPart: Part) => {
    if (!firestore) return;
    const partRef = doc(firestore, 'parts', updatedPart.id);
    const { id, ...partData } = updatedPart;
    try {
      await updateDoc(partRef, partData);
      setEditingPart(null);
    } catch (error) {
      console.error("Error updating part: ", error);
      toast({
        title: "Error",
        description: "Could not update part. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (deletingItemId && firestore) {
      const itemRef = doc(firestore, 'parts', deletingItemId);
      try {
        await deleteDoc(itemRef);
        setDeletingItemId(null);
      } catch (error) {
        console.error("Error deleting part: ", error);
        toast({
          title: "Error",
          description: "Could not delete part. Please try again.",
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
            <CardTitle>Parts</CardTitle>
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
                 <PartRow 
                    key={part.id} 
                    part={part} 
                    onEdit={() => setEditingPart(part)}
                    onDelete={() => setDeletingItemId(part.id)}
                />
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
