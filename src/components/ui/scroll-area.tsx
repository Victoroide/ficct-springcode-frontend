import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    const getScrollbarClass = () => {
      switch (orientation) {
        case "horizontal":
          return "overflow-x-auto overflow-y-hidden"
        case "both":
          return "overflow-auto"
        default:
          return "overflow-y-auto overflow-x-hidden"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          getScrollbarClass(),
          "scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
