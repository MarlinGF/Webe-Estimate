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
import { Button } from '@/components/ui/button';
import { invoices } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = invoices.find((i) => i.id === params.id);

  if (!invoice) {
    notFound();
  }

  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Paid: 'default',
    Sent: 'secondary',
    Overdue: 'destructive',
    Draft: 'outline',
  };

  const balanceDue = invoice.total - invoice.amountPaid;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Invoice {invoice.invoiceNumber}
          </h1>
          <Badge variant={statusColors[invoice.status] || 'outline'} className="ml-auto sm:ml-0">{invoice.status}</Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2"/>
              Download PDF
            </Button>
            {invoice.status !== 'Paid' && (
              <Button size="sm">
                <CreditCard className="h-4 w-4 mr-2"/>
                Pay Now
              </Button>
            )}
          </div>
        </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">Invoice</CardTitle>
              <div className="text-muted-foreground">
                <div>{invoice.invoiceNumber}</div>
                <div>Issued: {invoice.invoiceDate}</div>
                <div>Due: {invoice.dueDate}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{invoice.client.name}</div>
              <div className="text-muted-foreground">
                {invoice.client.address}
              </div>
              <div className="text-muted-foreground">
                {invoice.client.email}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.quantity * item.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <Separator />
               <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span>-{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-primary">
                <span>Balance Due</span>
                <span>{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
         <Button variant="outline" size="sm">
            Download PDF
        </Button>
        {invoice.status !== 'Paid' && (
          <Button size="sm">
            Pay Now
          </Button>
        )}
      </div>
    </div>
  );
}
