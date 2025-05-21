import * as React from "react"

import { cn } from "@/lib/utils"
import { 
  BaseComponentProps, 
  DisableableProps, 
  FormFieldProps,
  StandardSize 
} from "@/lib/types"

/**
 * Input size types
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input variant types
 */
export type InputVariant = 'default' | 'filled' | 'flushed';

/**
 * Input component props
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label */
  label?: string;
  /** Field description */
  description?: string;
  /** Error message */
  error?: string;
  /** Input size */
  size?: InputSize;
  /** Input variant style */
  variant?: InputVariant;
  /** Whether the input is invalid */
  invalid?: boolean;
  /** Whether the input is readonly */
  readonly?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    size = 'md', 
    variant = 'default', 
    invalid,
    readonly,
    ...props 
  }, ref) => {
    return (
      <input
        type={type}
        readOnly={readonly}
        className={cn(
          "flex w-full rounded-md border bg-transparent text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          // Size variants
          {
            'h-8 px-2 py-1 text-xs': size === 'sm',
            'h-9 px-3 py-1': size === 'md',
            'h-10 px-4 py-2': size === 'lg',
          },
          // Variant styles
          {
            'border-input': variant === 'default',
            'border-input bg-muted': variant === 'filled',
            'border-0 border-b-2 border-input rounded-none bg-transparent': variant === 'flushed',
          },
          // State styles
          {
            'border-destructive focus-visible:ring-destructive': invalid,
            'bg-muted cursor-not-allowed': readonly,
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
