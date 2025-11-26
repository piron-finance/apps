"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKYCComplete: () => void;
}

export function KYCModal({ isOpen, onClose, onKYCComplete }: KYCModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/20 mx-4">
        <DialogHeader>
          <DialogTitle className="text-white text-lg sm:text-xl">
            KYC Verification
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 sm:py-6 text-center text-slate-400">
          <p className="text-sm sm:text-base">
            KYC verification will be handled by your backend API.
          </p>
          <p className="text-xs sm:text-sm mt-2">Coming soon...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
