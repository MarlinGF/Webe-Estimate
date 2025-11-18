'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { LineItem, Service, Part } from '@/lib/types';
import { ImageIcon } from 'lucide-react';

interface LineItemRowProps {
  item: LineItem;
  itemImage: string | undefined;
  itemName: string;
}

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

export function LineItemRow({ item, itemImage, itemName }: LineItemRowProps) {
  const [expanded, setExpanded] = useState(false);

  const plainTextDescription = item.description ? stripHtml(item.description) : '';
  const isLong = plainTextDescription.length > 150;
  const preview = isLong ? `${plainTextDescription.slice(0, 150)}...` : plainTextDescription;

  return (
    <TableRow>
      <TableCell className="w-[60%]">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
            {itemImage ? (
              <Image
                src={itemImage}
                alt={itemName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{itemName}</span>
            <div className="text-sm text-muted-foreground">
              {expanded ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              ) : (
                <span>{preview}</span>
              )}
              {isLong && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs ml-1"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>{formatCurrency(item.price)}</TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.quantity * item.price)}
      </TableCell>
    </TableRow>
  );
}
