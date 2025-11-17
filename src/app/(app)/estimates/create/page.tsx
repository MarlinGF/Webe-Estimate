'use client';

import { useState, useEffect } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { services, parts } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { AiDescriptionGenerator } from '@/components/ai-description-generator';
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AddFromLibraryDialog } from '@/components/add-from-library-dialog';
import type { Item, Client } from '@/lib/types';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


type FormValues = {
  clientId: string;
  estimateNumber: string;
  estimateDate: string;
  expiryDate: string;
  lineItems: { description: string; quantity: number; price: number }[];
};

export default function CreateEstimatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const clientsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'clients') : null, [firestore, user]);
  const { data: clientList, isLoading: isLoadingClients } = useCollection<Omit<Client, 'id'>>(clientsCollection);


  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      estimateNumber: `EST-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 1000)
      ).padStart(3, '0')}`,
      estimateDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split('T')[0],
      lineItems: [{ description: '', quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const watchLineItems = watch('lineItems');
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const taxRate = 0.08; // 8%

  useEffect(() => {
    const newSubtotal = watchLineItems.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );
    const newTax = newSubtotal * taxRate;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newSubtotal + newTax);
  }, [watchLineItems]);

  const handleAddItemsFromLibrary = (items: Item[]) => {
    // Check if the first default line item is empty, if so, remove it.
    if (fields.length === 1 && !watchLineItems[0].description && watchLineItems[0].price === 0) {
      remove(0);
    }
    items.forEach(item => {
        append({ description: item.name, quantity: 1, price: item.price });
    });
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);
    toast({
        title: "Estimate Created",
        description: `Estimate ${data.estimateNumber} has been saved as a draft.`,
    });
    router.push('/estimates');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/estimates">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Create Estimate
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/estimates">Cancel</Link>
          </Button>
          <Button size="sm" type="submit">Save Estimate</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
              <CardDescription>
                Fill in the details for your new estimate.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientId">Client</Label>
                  <Controller
                    name="clientId"
                    control={control}
                    rules={{ required: 'Client is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClients}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select a client"} />
                        </SelectTrigger>
                        <SelectContent>
                          {clientList?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.firstName} {client.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                   {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estimateNumber">Estimate Number</Label>
                  <Input id="estimateNumber" {...register('estimateNumber')} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="estimateDate">Estimate Date</Label>
                  <Input
                    id="estimateDate"
                    type="date"
                    {...register('estimateDate')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>                  <Input
                    id="expiryDate"
                    type="date"
                    {...register('expiryDate')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Textarea
                            {...register(`lineItems.${index}.description`)}
                            placeholder="Item description"
                            className="text-sm"
                          />
                          <AiDescriptionGenerator
                            onInsert={(desc) =>
                              setValue(`lineItems.${index}.description`, desc)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          {...register(`lineItems.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          defaultValue={1}
                          className="w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`lineItems.${index}.price`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          (watchLineItems[index]?.quantity || 0) *
                            (watchLineItems[index]?.price || 0)
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-start border-t p-4 gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1"
                onClick={() =>
                  append({ description: '', quantity: 1, price: 0 })
                }
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Line Item
              </Button>
              <AddFromLibraryDialog
                services={services}
                parts={parts}
                onAddItems={handleAddItemsFromLibrary}
              />
            </CardFooter>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link href="/estimates">Cancel</Link>
          </Button>
          <Button size="sm" type="submit">Save Estimate</Button>
        </div>
    </form>
  );
}
