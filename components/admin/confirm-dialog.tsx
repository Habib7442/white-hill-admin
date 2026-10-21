"use client"

import { LoaderCircle } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { dangerSolid, pill } from "./styles"

/** Destructive confirmation used for every delete. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Delete",
  pending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  children?: React.ReactNode
  confirmLabel?: string
  pending?: boolean
  /** Leave out to show an explanation with only a Close button. */
  onConfirm?: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialogContent className="rounded-2xl p-6 sm:max-w-md">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-lg font-semibold text-text">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-text-muted">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={pill} onClick={() => onOpenChange(false)} disabled={pending}>
            {onConfirm ? "Cancel" : "Close"}
          </button>
          {onConfirm ? (
            <button type="button" className={dangerSolid} onClick={onConfirm} disabled={pending}>
              {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              {confirmLabel}
            </button>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
