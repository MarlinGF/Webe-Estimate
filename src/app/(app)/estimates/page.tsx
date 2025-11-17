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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { estimates } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';

export default function EstimatesPage() {
  const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Approved: 'default',
    Sent: 'secondary',
    Rejected: 'destructive',
    Draft: 'outline',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Estimates</CardTitle>
          <CardDescription>
            Create and manage your estimates.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="gap-1">
          <Link href="/estimates/create">
            <PlusCircle className="h-4 w-4" />
            Create Estimate
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimates.map((estimate) => (
              <TableRow key={estimate.id}>
                <TableCell className="font-medium">
                  <Link href={`/estimates/${estimate.id}`} className="text-primary hover:underline">
                    {estimate.estimateNumber}
                  </Link>
                </TableCell>
                <TableCell>{estimate.client.name}</TableCell>
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
  );
}
