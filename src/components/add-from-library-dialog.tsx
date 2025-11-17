'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import type { Item } from '@/lib/types';
import { Library, PlusCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface AddFromLibraryDialogProps {
  services: Item[];
  parts: Item[];
  onAddItems: (items: Item[]) => void;
  isLoading?: boolean;
}

export function AddFromLibraryDialog({
  services,
  parts,
  onAddItems,
  isLoading
}: AddFromLibraryDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const handleSelect = (item: Item, isSelected: boolean | 'indeterminate') => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, item]);
    } else {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const handleAddClick = () => {
    onAddItems(selectedItems);
    setSelectedItems([]);
    setOpen(false);
  };

  const isItemSelected = (itemId: string) => {
    return selectedItems.some((i) => i.id === itemId);
  };

  const renderItemTable = (items: Item[]) => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={isItemSelected(item.id)}
                  onCheckedChange={(checked) => handleSelect(item, checked)}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1" type="button">
          <Library className="h-3.5 w-3.5" />
          Add from Library
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Items from Library</DialogTitle>
          <DialogDescription>
            Select services and parts to add to the estimate.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="services">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
          </TabsList>
          <TabsContent value="services">
            <div className="max-h-[400px] overflow-y-auto">
              {renderItemTable(services)}
            </div>
          </TabsContent>
          <TabsContent value="parts">
             <div className="max-h-[400px] overflow-y-auto">
              {renderItemTable(parts)}
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddClick} disabled={selectedItems.length === 0}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
