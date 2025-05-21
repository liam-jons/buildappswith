/**
 * Component Type Definitions
 * Version: 1.0.0
 * 
 * Standardized interfaces and types for component composition
 */

import React, { 
  HTMLAttributes, 
  ReactNode, 
  ComponentType, 
  ElementType,
  ComponentProps as ReactComponentProps,
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef
} from 'react';

/**
 * Base props interface for all components
 */
export interface BaseComponentProps {
  /** CSS class name */
  className?: string;
  /** Component ID */
  id?: string;
  /** Additional data attributes */
  [key: `data-${string}`]: string | number | boolean | undefined;
}

/**
 * Props for components that can have children
 */
export interface WithChildrenProps {
  /** Component children */
  children?: ReactNode;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for components that can show loading state
 */
export interface LoadableProps {
  /** Whether the component is in loading state */
  loading?: boolean;
  /** Loading indicator element */
  loadingIndicator?: ReactNode;
}

/**
 * Props for components that can be rendered as different elements
 */
export interface AsElementProps {
  /** Element type or component to render as */
  asChild?: boolean;
}

/**
 * Props for components with variant styling
 */
export interface VariantProps<T extends string> {
  /** Component variant */
  variant?: T;
}

/**
 * Props for components with size variants
 */
export interface SizeProps<T extends string> {
  /** Component size */
  size?: T;
}

/**
 * Polymorphic component props without ref
 */
export type PolymorphicProps<
  C extends ElementType,
  Props = {}
> = Props &
  Omit<ComponentPropsWithoutRef<C>, keyof Props> & {
    as?: C;
  };

/**
 * Polymorphic component props with ref
 */
export type PolymorphicPropsWithRef<
  C extends ElementType,
  Props = {}
> = PolymorphicProps<C, Props> & {
  ref?: ComponentPropsWithoutRef<C>['ref'];
};

/**
 * Extract component props type
 */
export type ExtractComponentProps<T extends ComponentType<any>> = T extends ComponentType<infer P> ? P : never;

/**
 * Make certain props required
 */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make certain props optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Common HTML element props
 */
export type HTMLElementProps<T extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[T];

/**
 * Standard size variants
 */
export type StandardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Standard spacing variants
 */
export type StandardSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Standard color variants
 */
export type StandardColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Common form field props
 */
export interface FormFieldProps {
  /** Field name */
  name?: string;
  /** Field label */
  label?: string;
  /** Field description */
  description?: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * Common layout props
 */
export interface LayoutProps {
  /** Margin */
  margin?: StandardSpacing;
  /** Padding */
  padding?: StandardSpacing;
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Common interactive props
 */
export interface InteractiveProps {
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent) => void;
  /** Key press handler */
  onKeyPress?: (event: React.KeyboardEvent) => void;
}

/**
 * Type helper for forwarded refs
 */
export type ForwardedRef<T> = React.Ref<T>;

/**
 * Component with forwarded ref type
 */
export type ComponentWithRef<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;