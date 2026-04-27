import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-sans tracking-luxe uppercase ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:bg-ink/85",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-ink/30 bg-transparent text-ink hover:bg-ink hover:text-paper hover:border-ink",
        secondary: "bg-rose text-paper hover:bg-rose-deep",
        ghost: "hover:bg-ink/5 text-ink",
        link: "text-ink underline-offset-4 hover:underline",
        champagne: "bg-champagne text-ink hover:bg-champagne-deep",
        ghostLine: "border-b border-ink/40 rounded-none px-0 hover:border-ink text-ink",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 px-5 text-[10px]",
        lg: "h-14 px-12 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
