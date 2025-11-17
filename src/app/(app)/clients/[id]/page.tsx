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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { clients, estimates, invoices } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = clients.find((c) => c.id === params.id);
  if (!client) {
    notFound();
  }

  const clientEstimates = estimates.filter((e) => e.client.id === client.id);
  const clientInvoices = invoices.filter((i) => i.client.id === client.id);

  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Paid: 'default',
    Sent: 'secondary',
    Overdue: 'destructive',
    Approved: 'default',
    Draft: 'outline',
    Rejected: 'destructive',
  };

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{client.name}</CardTitle>
          <CardDescription>
            {client.email} &middot; {client.phone}
          </CardDescription>
          <CardDescription>{client.address}</CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue="estimates">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="estimates">
          <Card>
            <CardHeader>
              <CardTitle>Estimates</CardTitle>
              <CardDescription>
                All estimates associated with {client.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientEstimates.map((estimate) => (
                    <TableRow key={estimate.id}>
                      <TableCell className="font-medium">
                        <Link href={`/estimates/${estimate.id}`} className="hover:underline text-primary">
                          {estimate.estimateNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{estimate.estimateDate}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[estimate.status] || 'outline'}>{estimate.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(estimate.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                All invoices associated with {client.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link href={`/invoices/${invoice.id}`} className="hover:underline text-primary">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.invoiceDate}</TableCell>
                      <TableCell>
                         <Badge variant={statusColors[invoice.status] || 'outline'}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
