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
import { Badge } from '@/components/ui/badge';
import { estimates, invoices } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, FileText, Receipt, Users } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const openEstimates = estimates.filter(
    (est) => est.status === 'Sent' || est.status === 'Draft'
  ).length;
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === 'Overdue'
  ).length;
  const clientsCount = new Set(
    [...estimates, ...invoices].map((doc) => doc.client.id)
  ).size;

  const recentActivity = [...estimates, ...invoices]
    .sort(
      (a, b) =>
        new Date(
          'invoiceDate' in b ? b.invoiceDate : b.estimateDate
        ).getTime() -
        new Date('invoiceDate' in a ? a.invoiceDate : a.estimateDate).getTime()
    )
    .slice(0, 5);
  
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
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From all paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Estimates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{openEstimates}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting client approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Require follow-up
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{clientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all documents
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            An overview of the latest estimates and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((doc) => (
                <TableRow key={'invoiceNumber' in doc ? doc.invoiceNumber : doc.estimateNumber}>
                  <TableCell>
                    <div className="font-medium">{doc.client.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {doc.client.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {'invoiceNumber' in doc ? 'Invoice' : 'Estimate'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[doc.status] || 'outline'}>{doc.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {'invoiceDate' in doc ? doc.invoiceDate : doc.estimateDate}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(doc.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
