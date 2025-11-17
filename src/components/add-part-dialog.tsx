'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import type { Part } from '@/lib/types';

const partSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  description: z.string().optional(),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be a positive number')
  ),
  cost: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Cost must be a positive number')
  ),
});

type PartFormValues = Omit<Part, 'id'>;

interface AddPartDialogProps {
  onAddPart: (part: PartFormValues) => void;
  children: React.ReactNode;
}

export function AddPartDialog({ onAddPart, children }: AddPartDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartFormValues>({
    resolver: zodResolver(partSchema),
  });

  const onSubmit = (data: PartFormValues) => {
    onAddPart(data);
    toast({
      title: 'Part Created',
      description: `${data.name} has been successfully added to your library.`,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
          <DialogDescription>
            Enter the details for the new part.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Part Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="cost">Cost</Label>
                <Input id="cost" type="number" step="0.01" {...register('cost')} />
                {errors.cost && <p className="text-sm text-destructive">{errors.cost.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Part'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
