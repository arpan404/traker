"use client";

import { Loader2, type LucideProps } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const loaderVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      default: "h-4 w-4",
      sm: "h-3 w-3",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-muted-foreground",
      primary: "text-primary",
      white: "text-white",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

export interface LoaderProps
  extends
    Omit<LucideProps, "ref" | "size">,
    VariantProps<typeof loaderVariants> {
  centered?: boolean;
}

export function Loader({
  className,
  size,
  variant,
  centered = false,
  ...props
}: LoaderProps) {
  if (centered) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center p-4",
          className,
        )}
      >
        <Loader2 className={cn(loaderVariants({ size, variant }))} {...props} />
      </div>
    );
  }

  return (
    <Loader2
      className={cn(loaderVariants({ size, variant }), className)}
      {...props}
    />
  );
}
