"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

// Base UI tabs styled as the reference's grey pills (arrow-key navigation
// comes from Base UI). Panels unmount when hidden; the form keeps its state
// in React, so nothing is lost.

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      className={cn("-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5", className)}
      {...props}
    />
  )
}

export function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-xl px-4 text-sm font-medium whitespace-nowrap text-text-muted transition-colors outline-none hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring data-active:bg-frame data-active:text-white",
        className
      )}
      {...props}
    />
  )
}

export function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel className={cn("outline-none", className)} {...props} />
}
