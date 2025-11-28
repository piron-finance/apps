"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComingSoonModal({ open, onOpenChange }: ComingSoonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border border-gray-900 text-white max-w-md mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center mb-3 sm:mb-4 pr-6">
            Coming Soon
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4 text-gray-400" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6 text-center px-2 sm:px-0">
          <p className="text-gray-300 text-base sm:text-lg">
            We're building the global money market protocol.
          </p>
          <p className="text-sm sm:text-base text-gray-400">
            The Piron app will be launching soon. Get ready to earn transparent
            yield on Treasury bills, Commercial Paper, and money market
            instruments, onchain.
          </p>
          <div className="pt-2 sm:pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base"
            >
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
