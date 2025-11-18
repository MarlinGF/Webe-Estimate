'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { MoreHorizontal } from 'lucide-react';
import { AddClientDialog } from '@/components/add-client-dialog';
import { EditClientDialog } from '@/components/edit-client-dialog';
import { DeleteClientAlert } from '@/components/delete-client-alert';
import type { Client } from '@/lib/types';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  
  const clientsCollectionRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'clients') : null, [firestore, user]);
  const { data: clients, isLoading } = useCollection<Client>(clientsCollectionRef);

  const handleAddClient = async (newClient: Omit<Client, 'id' | 'userId'>) => {
    if (!clientsCollectionRef || !user) return;
    try {
      await addDoc(clientsCollectionRef, { ...newClient, userId: user.uid });
    } catch (error) {
      console.error("Error adding client: ", error);
      toast({
        title: "Error",
        description: "Could not add client. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    if (!user) return;
    const clientRef = doc(firestore, 'users', user.uid, 'clients', updatedClient.id);
    const { id, ...clientData } = updatedClient;
    try {
      await updateDoc(clientRef, clientData);
      setEditingClient(null);
    } catch (error) {
       console.error("Error updating client: ", error);
       toast({
        title: "Error",
        description: "Could not update client. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async () => {
    if (deletingClientId && user) {
      const clientRef = doc(firestore, 'users', user.uid, 'clients', deletingClientId);
      try {
        await deleteDoc(clientRef);
        setDeletingClientId(null);
      } catch (error) {
        console.error("Error deleting client: ", error);
        toast({
          title: "Error",
          description: "Could not delete client. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
  };

  const openDeleteAlert = (clientId: string) => {
    setDeletingClientId(clientId);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              Manage your clients and view their history.
            </CardDescription>
          </div>
          <AddClientDialog onAddClient={handleAddClient} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>}
              {!isLoading && clients?.map((client) => (
                <TableRow 
                  key={client.id} 
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">
                      {client.firstName} {client.lastName}
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                        <DropdownMenuItem onSelect={() => openEditDialog(client)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openDeleteAlert(client.id)} className="text-destructive">
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

      {editingClient && (
        <EditClientDialog
          client={editingClient}
          onUpdateClient={handleUpdateClient}
          onOpenChange={(isOpen) => !isOpen && setEditingClient(null)}
        />
      )}

      {deletingClientId && (
        <DeleteClientAlert
          onDeleteConfirm={handleDeleteClient}
          onOpenChange={(isOpen) => !isOpen && setDeletingClientId(null)}
        />
      )}
    </>
  );
}
