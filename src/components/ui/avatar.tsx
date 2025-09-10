import * as React from "react"
import { memo } from "react"
import Image from "next/image"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

const AvatarComponent = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
AvatarComponent.displayName = AvatarPrimitive.Root.displayName

interface AvatarImageProps {
  src?: string
  alt?: string
  className?: string
}

const AvatarImageComponent = React.forwardRef<
  HTMLDivElement,
  AvatarImageProps
>(({ className, src, alt, ...props }, ref) => {
  if (!src) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("aspect-square h-full w-full overflow-hidden", className)}
      {...props}
    >
      <Image
        src={src}
        alt={alt || "Avatar"}
        width={40}
        height={40}
        className="aspect-square h-full w-full object-cover"
        priority={false}
        quality={85}
        sizes="40px"
      />
    </div>
  )
})
AvatarImageComponent.displayName = "AvatarImage"

const AvatarFallbackComponent = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
      className
    )}
    {...props}
  />
))
AvatarFallbackComponent.displayName = AvatarPrimitive.Fallback.displayName

// Memoize avatar components
const Avatar = memo(AvatarComponent)
const AvatarImage = memo(AvatarImageComponent)
const AvatarFallback = memo(AvatarFallbackComponent)

export { Avatar, AvatarImage, AvatarFallback }