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
import { clients as initialClients } from '@/lib/data';
import { AddClientDialog } from '@/components/add-client-dialog';
import { EditClientDialog } from '@/components/edit-client-dialog';
import { DeleteClientAlert } from '@/components/delete-client-alert';
import type { Client } from '@/lib/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const handleAddClient = (newClient: Omit<Client, 'id'>) => {
    setClients((prevClients) => [
      ...prevClients,
      { ...newClient, id: `cli-${Date.now()}` },
    ]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
    setEditingClient(null);
  };

  const handleDeleteClient = () => {
    if (deletingClientId) {
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== deletingClientId)
      );
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
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/clients/${client.id}`}
                      className="hover:underline text-primary"
                    >
                      {client.name}
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
