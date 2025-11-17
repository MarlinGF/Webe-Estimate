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
import { estimates } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Download, FilePlus2 } from 'lucide-react';

export default function EstimateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const estimate = estimates.find((e) => e.id === params.id);

  if (!estimate) {
    notFound();
  }

  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Approved: 'default',
    Sent: 'secondary',
    Rejected: 'destructive',
    Draft: 'outline',
  };

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/estimates">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Estimate {estimate.estimateNumber}
          </h1>
          <Badge variant={statusColors[estimate.status] || 'outline'} className="ml-auto sm:ml-0">{estimate.status}</Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2"/>
              Download
            </Button>
            <Button size="sm">
              <FilePlus2 className="h-4 w-4 mr-2"/>
              Convert to Invoice
            </Button>
          </div>
        </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">Estimate</CardTitle>
              <div className="text-muted-foreground">
                <div>{estimate.estimateNumber}</div>
                <div>Issued: {estimate.estimateDate}</div>
                <div>Expires: {estimate.expiryDate}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{estimate.client.name}</div>
              <div className="text-muted-foreground">
                {estimate.client.address}
              </div>
              <div className="text-muted-foreground">
                {estimate.client.email}
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
              {estimate.lineItems.map((item) => (
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
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(estimate.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(estimate.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(estimate.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
        <Button variant="outline" size="sm">
          Download
        </Button>
        <Button size="sm">
          Convert to Invoice
        </Button>
      </div>
    </div>
  );
}
