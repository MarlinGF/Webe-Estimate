'use client';

import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Upload, X } from 'lucide-react';
import type { Service } from '@/lib/types';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be a positive number')
  ),
  imageUrl: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface EditServiceDialogProps {
  service: Service;
  onUpdateService: (service: Service) => void;
  onOpenChange: (open: boolean) => void;
}

export function EditServiceDialog({ service, onUpdateService, onOpenChange }: EditServiceDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service,
  });

  const name = watch('name');
  const imageUrl = watch('imageUrl');

  useEffect(() => {
    reset(service);
  }, [service, reset]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       if (file.size > 1024 * 1024) { // 1MB limit
        toast({
          title: 'Image too large',
          description: 'Please select an image smaller than 1MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('imageUrl', reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setValue('imageUrl', '', { shouldDirty: true });
  };

  const onSubmit = (data: ServiceFormValues) => {
    onUpdateService({ ...service, ...data });
    toast({
      title: 'Service Updated',
      description: `${data.name} has been successfully updated.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update the details for this service.
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
            <Controller
                name="description"
                control={control}
                defaultValue={service.description}
                render={({ field }) => (
                    <RichTextEditor
                  value={field.value ?? ''}
                    onChange={field.onChange}
                    />
                )}
            />
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
                    <Image src={imageUrl} alt={name || 'Service image'} width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
               </div>
                <div className='flex flex-col gap-2'>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                  </Button>
                  {imageUrl && (
                    <Button type="button" variant="destructive" size="sm" onClick={handleRemoveImage}>
                        <X className="mr-2 h-4 w-4" />
                        Remove
                    </Button>
                  )}
               </div>
               <Input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageUpload}
                />
             </div>
             <input type="hidden" {...register('imageUrl')} />
          </div>
          <DialogFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
