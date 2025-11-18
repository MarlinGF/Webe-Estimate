
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
import { formatCurrency } from '@/lib/utils';
import { AiDescriptionGenerator } from '@/components/ai-description-generator';
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AddFromLibraryDialog } from '@/components/add-from-library-dialog';
import type { Item, Client, Service, Part, Tax, Estimate, LineItem } from '@/lib/types';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, updateDoc, getDocs } from 'firebase/firestore';


type FormValues = {
  clientId: string;
  taxId: string | 'none';
  estimateNumber: string;
  estimateDate: string;
  expiryDate: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  lineItems: { description: string; quantity: number; price: number }[];
};

export default function EditEstimatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const estimateRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid, 'estimates', id) : null, [firestore, user, id]);
  const { data: estimate, isLoading: isLoadingEstimate } = useDoc<Estimate>(estimateRef);

  const lineItemsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'estimates', id, 'lineItems') : null, [firestore, user, id]);
  const { data: lineItemsData, isLoading: isLoadingLineItems } = useCollection<LineItem>(lineItemsRef);

  const clientsCollectionRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'clients') : null, [firestore, user]);
  const { data: clientList, isLoading: isLoadingClients } = useCollection<Client>(clientsCollectionRef);

  const servicesCollectionRef = useMemoFirebase(() => collection(firestore, 'services'), [firestore]);
  const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesCollectionRef);

  const partsCollectionRef = useMemoFirebase(() => collection(firestore, 'parts'), [firestore]);
  const { data: parts, isLoading: isLoadingParts } = useCollection<Part>(partsCollectionRef);

  const taxesCollectionRef = useMemoFirebase(() => collection(firestore, 'taxes'), [firestore]);
  const { data: taxes, isLoading: isLoadingTaxes } = useCollection<Tax>(taxesCollectionRef);


  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'lineItems',
  });

  useEffect(() => {
    if (estimate) {
        const initialFormValues: any = { ...estimate };
        if (taxes && estimate.taxId) {
            initialFormValues.taxId = estimate.taxId;
        } else if (taxes && estimate.tax > 0 && estimate.subtotal > 0) {
            const taxRate = estimate.tax / estimate.subtotal;
            const matchingTax = taxes.find(t => Math.abs(t.rate - taxRate) < 0.0001);
            initialFormValues.taxId = matchingTax?.id || 'none';
        } else {
            initialFormValues.taxId = 'none';
        }
        reset(initialFormValues);
    }
    if (lineItemsData) {
        replace(lineItemsData.map(({id, ...rest}) => rest));
    }
}, [estimate, lineItemsData, reset, replace, taxes]);

  const watchLineItems = watch('lineItems');
  const watchTaxId = watch('taxId');
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedTaxRate, setSelectedTaxRate] = useState(0);

  useEffect(() => {
    const selectedTax = taxes?.find(t => t.id === watchTaxId);
    setSelectedTaxRate(selectedTax?.rate || 0);
  }, [watchTaxId, taxes]);

  useEffect(() => {
    if (!watchLineItems) return;
    const newSubtotal = watchLineItems.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );
    const newTax = newSubtotal * selectedTaxRate;
    setSubtotal(newSubtotal);
    setTaxAmount(newTax);
    setTotal(newSubtotal + newTax);
  }, [watchLineItems, selectedTaxRate]);

  const handleAddItemsFromLibrary = (items: Item[]) => {
    items.forEach(item => {
        append({ description: item.name, quantity: 1, price: item.price });
    });
  };

 const onSubmit = async (data: FormValues) => {
    if (!user || !firestore || !estimateRef || !lineItemsRef) return;
    
    const { lineItems, ...coreData } = data;
    
    const estimateCoreData = {
      ...coreData,
      userId: user.uid,
      subtotal,
      tax: taxAmount,
      total,
      taxId: data.taxId === 'none' ? null : data.taxId,
    };
    
    try {
        const batch = writeBatch(firestore);

        // 1. Update the main estimate document
        batch.update(estimateRef, estimateCoreData);
        
        // 2. Delete all existing line items for this estimate
        const oldLineItemsSnapshot = await getDocs(lineItemsRef);
        oldLineItemsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 3. Add the new line items
        lineItems.forEach(item => {
            const newItemRef = doc(collection(estimateRef, 'lineItems'));
            batch.set(newItemRef, item);
        });
        
        // 4. Commit the batch
        await batch.commit();

        toast({
            title: "Estimate Updated",
            description: `Estimate ${data.estimateNumber} has been successfully updated.`,
        });
        router.push('/estimates');

    } catch (e) {
        console.error("Error updating estimate:", e);
        toast({
            title: "Error",
            description: "There was a problem updating the estimate.",
            variant: "destructive"
        });
    }
  };

  const isLoading = isLoadingEstimate || isLoadingLineItems || isLoadingClients || isLoadingServices || isLoadingParts || isLoadingTaxes;

  if (isLoading) {
    return <div>Loading estimate...</div>;
  }

  if (!estimate) {
    return notFound();
  }

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
          Edit Estimate {estimate.estimateNumber}
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/estimates">Cancel</Link>
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
              <CardDescription>
                Update the details for your estimate.
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingClients}>
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
              <div className="grid md:grid-cols-3 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="taxId">Tax</Label>
                   <Controller
                    name="taxId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingTaxes}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingTaxes ? "Loading taxes..." : "Select a tax"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No tax</SelectItem>
                          {taxes?.map((tax) => (
                            <SelectItem key={tax.id} value={tax.id}>
                              {tax.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
               <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                   <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Sent">Sent</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
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
                          (watchLineItems?.[index]?.quantity || 0) *
                            (watchLineItems?.[index]?.price || 0)
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
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
                type="button"
                onClick={() =>
                  append({ description: '', quantity: 1, price: 0 })
                }
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Line Item
              </Button>
              <AddFromLibraryDialog
                services={services || []}
                parts={parts || []}
                onAddItems={handleAddItemsFromLibrary}
                isLoading={isLoadingServices || isLoadingParts}
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
                <span>Tax ({(selectedTaxRate * 100).toFixed(2)}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
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
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
    </form>
  );
}

    