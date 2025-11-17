'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { useCollection, useFirebase, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function ClientsPage() {
  const { firestore, user } = useFirebase();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  
  const clientsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'clients') : null, [firestore, user]);
  const { data: clients, isLoading } = useCollection<Omit<Client, 'id'>>(clientsCollection);

  const handleAddClient = (newClient: Omit<Client, 'id' | 'userId'>) => {
    if (!clientsCollection || !user) return;
    addDocumentNonBlocking(clientsCollection, { ...newClient, userId: user.uid });
  };

  const handleUpdateClient = (updatedClient: Client) => {
    if (!user) return;
    const clientRef = doc(firestore, 'users', user.uid, 'clients', updatedClient.id);
    const { id, ...clientData } = updatedClient;
    updateDocumentNonBlocking(clientRef, clientData);
    setEditingClient(null);
  };

  const handleDeleteClient = () => {
    if (deletingClientId && user) {
      const clientRef = doc(firestore, 'users', user.uid, 'clients', deletingClientId);
      deleteDocumentNonBlocking(clientRef);
      setDeletingClientId(null);
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
                <TableHead>Address</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>}
              {!isLoading && clients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/clients/${client.id}`}
                      className="hover:underline text-primary"
                    >
                      {client.firstName} {client.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>
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
