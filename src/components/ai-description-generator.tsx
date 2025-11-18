
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateDescriptionAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const initialState = {
  description: '',
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Generate
    </Button>
  );
}

export function AiDescriptionGenerator({
  onInsert,
}: {
  onInsert: (description: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(
    generateDescriptionAction,
    initialState
  );

  const handleInsert = () => {
    if (state.description) {
      onInsert(state.description);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Generate description with AI">
          <Wand2 className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Smart Description</DialogTitle>
          <DialogDescription>
            Enter a few keywords, and we'll generate a professional line item
            description for you.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Textarea
              id="keywords"
              name="keywords"
              placeholder="e.g., 'landing page', 'responsive design', 'contact form'"
            />
             {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>

          {state.description && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>{state.description}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            {state.description ? (
              <Button type="button" onClick={handleInsert}>
                Use This Description
              </Button>
            ) : (
              <SubmitButton />
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
