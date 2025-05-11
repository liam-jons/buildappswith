'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/core/alert';
import { XCircle } from 'lucide-react';

interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <Alert variant="destructive" className={className}>
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}