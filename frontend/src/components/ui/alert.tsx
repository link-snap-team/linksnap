import * as React from "react";

import { cn } from "../../lib/utils";

function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm text-zinc-600 dark:text-zinc-300", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
