'use client';

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
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, ImageIcon } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Part } from '@/lib/types';
import { AddPartDialog } from '@/components/add-part-dialog';

export default function PartsPage() {
  const { firestore } = useFirebase();
  
  const partsCollection = useMemoFirebase(() => collection(firestore, 'parts'), [firestore]);
  const { data: parts, isLoading } = useCollection<Part>(partsCollection);

  const handleAddPart = (newPart: Omit<Part, 'id'>) => {
    if (!partsCollection) return;
    addDocumentNonBlocking(partsCollection, newPart);
  };

  return (
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
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>}
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
                <TableCell className="text-right">
                  {formatCurrency(part.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
