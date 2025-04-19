"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }
>(({ className, children, value, onValueChange, defaultValue, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value || defaultValue);
  
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);
  
  // Wrap handleValueChange in useCallback to prevent it from being recreated on every render
  const handleValueChange = React.useCallback((newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  }, [onValueChange]);
  
  // Create a context to pass the radio group state to its items
  const groupContext = React.useMemo(
    () => ({
      value: selectedValue,
      onValueChange: handleValueChange,
    }),
    [selectedValue, handleValueChange]
  );
  
  return (
    <RadioGroupContext.Provider value={groupContext}>
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

type RadioGroupContextType = {
  value?: string;
  onValueChange: (value: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextType | undefined>(undefined);

const useRadioGroupContext = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
};

const RadioGroupItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    disabled?: boolean;
  }
>(({ className, children, value, disabled = false, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = useRadioGroupContext();
  const checked = selectedValue === value;
  
  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <div
        ref={ref}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked && "border-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && onValueChange(value)}
        tabIndex={disabled ? -1 : 0}
        role="radio"
        aria-checked={checked}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onValueChange(value);
          }
        }}
      >
        {checked && (
          <div className="flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-current" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
