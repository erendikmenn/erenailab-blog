import * as React from "react"
import { memo } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-700",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
        outline: "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:active:bg-gray-600",
        ghost: "text-gray-900 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        link: "text-primary-600 underline-offset-4 hover:underline dark:text-primary-400 dark:hover:text-primary-300",
        accent: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 dark:bg-accent-600 dark:hover:bg-accent-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ButtonComponent.displayName = "Button"

// Memoize to prevent re-renders when props haven't changed
const Button = memo(ButtonComponent)

export { Button, buttonVariants }