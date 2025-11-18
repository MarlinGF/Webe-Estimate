'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import type { Tax } from '@/lib/types';

const taxSchema = z.object({
  name: z.string().min(1, 'Tax name is required'),
  rate: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(0, 'Rate must be a positive number')
  ),
});

type TaxFormValues = Omit<Tax, 'id'>;

interface AddTaxDialogProps {
  onAddTax: (tax: TaxFormValues) => void;
  children: React.ReactNode;
}

export function AddTaxDialog({ onAddTax, children }: AddTaxDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: TaxFormValues) => {
    const processedData = { ...data, rate: data.rate / 100 };
    onAddTax(processedData);
    toast({
      title: 'Tax Created',
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
          <DialogTitle>Add New Tax</DialogTitle>
          <DialogDescription>
            Enter the details for the new tax rate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tax Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g. City Sales Tax" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">Rate (%)</Label>
            <Input id="rate" type="number" step="0.001" {...register('rate')} placeholder="e.g. 8.25" />
            {errors.rate && <p className="text-sm text-destructive">{errors.rate.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Tax'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    