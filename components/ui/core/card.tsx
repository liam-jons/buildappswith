import * as React from "react"

import { cn } from "@/lib/utils"
import { 
  BaseComponentProps, 
  WithChildrenProps,
  ComponentWithRef 
} from "@/lib/types"

/**
 * Card component props
 */
export interface CardProps extends 
  BaseComponentProps,
  WithChildrenProps,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Card shadow intensity */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Card padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow = 'sm', padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground",
        {
          'shadow-none': shadow === 'none',
          'shadow-sm': shadow === 'sm',
          'shadow-md': shadow === 'md',
          'shadow-lg': shadow === 'lg',
          'p-0': padding === 'none',
          'p-2': padding === 'sm',
          'p-4': padding === 'md',
          'p-6': padding === 'lg',
        },
        !padding && 'shadow-sm', // Default shadow when no custom shadow
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

/**
 * Card header component props
 */
export interface CardHeaderProps extends 
  BaseComponentProps,
  WithChildrenProps,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

/**
 * Card title component props
 */
export interface CardTitleProps extends 
  BaseComponentProps,
  WithChildrenProps,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, 'className'> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

/**
 * Card description component props
 */
export interface CardDescriptionProps extends 
  BaseComponentProps,
  WithChildrenProps,
  Omit<React.HTMLAttributes<HTMLParagraphElement>, 'className'> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

/**
 * Card content component props
 */
export interface CardContentProps extends 
  BaseComponentProps,
  WithChildrenProps,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

/**
 * Card footer component props
 */
export interface CardFooterProps extends 
  BaseComponentProps,
  WithChildrenProps,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
