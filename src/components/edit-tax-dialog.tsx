'use client';

import { useEffect } from 'react';
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

type TaxFormValues = z.infer<typeof taxSchema>;

interface EditTaxDialogProps {
  tax: Tax;
  onUpdateTax: (tax: Tax) => void;
  onOpenChange: (open: boolean) => void;
}

export function EditTaxDialog({ tax, onUpdateTax, onOpenChange }: EditTaxDialogProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
        ...tax,
        rate: tax.rate * 100,
    },
  });

  useEffect(() => {
    reset({
        ...tax,
        rate: tax.rate * 100,
    });
  }, [tax, reset]);

  const onSubmit = (data: TaxFormValues) => {
    const processedData = { ...tax, ...data, rate: data.rate / 100 };
    onUpdateTax(processedData);
    toast({
      title: 'Tax Updated',
      description: `${data.name} has been successfully updated.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tax</DialogTitle>
          <DialogDescription>
            Update the tax details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tax Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">Rate (%)</Label>
            <Input id="rate" type="number" step="0.001" {...register('rate')} />
            {errors.rate && <p className="text-sm text-destructive">{errors.rate.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    