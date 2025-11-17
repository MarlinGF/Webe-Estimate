'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
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
import { ImageIcon, Loader2, PlusCircle, Sparkles } from 'lucide-react';
import type { Service } from '@/lib/types';
import { generateImageAction } from '@/lib/actions';


const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be a positive number')
  ),
  imageUrl: z.string().optional(),
});

type ServiceFormValues = Omit<Service, 'id'>;

interface AddServiceDialogProps {
  onAddService: (service: ServiceFormValues) => void;
  children: React.ReactNode;
}

export function AddServiceDialog({ onAddService, children }: AddServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  const name = watch('name');
  const imageUrl = watch('imageUrl');

  const handleGenerateImage = async () => {
    if (!name) {
       toast({
        title: 'Name is required',
        description: 'Please enter a name for the service before generating an image.',
        variant: 'destructive',
      });
      return;
    }
    setIsGeneratingImage(true);
    const formData = new FormData();
    formData.append('name', name);
    const result = await generateImageAction(null, formData);
    setIsGeneratingImage(false);

    if (result.error) {
      toast({
        title: 'Image Generation Failed',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.imageUrl) {
      setValue('imageUrl', result.imageUrl);
      toast({
        title: 'Image Generated',
        description: 'A new image has been generated for your service.',
      });
    }
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: ServiceFormValues) => {
    onAddService(data);
    toast({
      title: 'Service Created',
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
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>
            Enter the details for the new service.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Service Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" step="0.01" {...register('price')} />
            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
          </div>
          <div className="grid gap-2">
             <Label>Image</Label>
             <div className="flex items-center gap-4">
               <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={name} width={96} height={96} className="object-cover w-full h-full" />
                  ) : isGeneratingImage ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
               </div>
               <Button type="button" variant="outline" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGeneratingImage ? 'Generating...' : 'Generate with AI'}
               </Button>
             </div>
             <Input type="hidden" {...register('imageUrl')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isGeneratingImage}>
              {isSubmitting ? 'Saving...' : 'Save Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
