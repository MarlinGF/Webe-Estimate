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
import type { Service } from '@/lib/types';
import { AddServiceDialog } from '@/components/add-service-dialog';
import { EditServiceDialog } from '@/components/edit-service-dialog';
import { DeleteItemAlert } from '@/components/delete-item-alert';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function ServiceRow({ service, onEdit, onDelete }: { service: Service; onEdit: (service: Service) => void; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const plainTextDescription = stripHtml(service.description);
  const isLong = plainTextDescription.length > 140;
  const preview = isLong ? `${plainTextDescription.slice(0, 140)}...` : plainTextDescription;

  return (
    <TableRow key={service.id} onClick={() => {}} className="cursor-pointer">
      <TableCell>
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
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
        <div className="font-medium">{service.name}</div>
        {plainTextDescription && (
           <div className="text-sm text-muted-foreground max-w-md">
            {expanded ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: service.description! }}
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
      <TableCell className="align-top">{formatCurrency(service.price)}</TableCell>
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
            <DropdownMenuItem onSelect={() => onEdit(service)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(service.id)} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}


export default function ServicesPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const servicesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'services'): null, [firestore]);
  const { data: services, isLoading } = useCollection<Service>(servicesCollectionRef);

  const handleAddService = async (newService: Omit<Service, 'id'>) => {
    if(!servicesCollectionRef) return;
    try {
      await addDoc(servicesCollectionRef, newService);
    } catch (error) {
      console.error("Error adding service: ", error);
      toast({
        title: "Error",
        description: "Could not add service. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateService = async (updatedService: Service) => {
    if (!firestore) return;
    const serviceRef = doc(firestore, 'services', updatedService.id);
    const { id, ...serviceData } = updatedService;
    try {
      await updateDoc(serviceRef, serviceData);
      setEditingService(null);
    } catch (error) {
      console.error("Error updating service: ", error);
      toast({
        title: "Error",
        description: "Could not update service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingItemId && firestore) {
      const itemRef = doc(firestore, 'services', deletingItemId);
      try {
        await deleteDoc(itemRef);
        setDeletingItemId(null);
      } catch (error) {
        console.error("Error deleting service: ", error);
        toast({
          title: "Error",
          description: "Could not delete service. Please try again.",
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
          <CardTitle>Services</CardTitle>
        </div>
        <AddServiceDialog onAddService={handleAddService}>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Service
          </Button>
        </AddServiceDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>}
            {!isLoading && services?.map((service) => (
              <ServiceRow 
                key={service.id} 
                service={service} 
                onEdit={() => setEditingService(service)}
                onDelete={() => setDeletingItemId(service.id)}
                />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {editingService && (
      <EditServiceDialog
        service={editingService}
        onUpdateService={handleUpdateService}
        onOpenChange={(isOpen) => !isOpen && setEditingService(null)}
      />
    )}

    {deletingItemId && (
      <DeleteItemAlert
        onDeleteConfirm={handleDeleteConfirm}
        onOpenChange={(isOpen) => !isOpen && setDeletingItemId(null)}
        itemName="service"
      />
    )}
    </>
  );
}
