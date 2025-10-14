"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Upload,
  FileText,
  Camera,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type KYCStage =
  | "welcome"
  | "basic-details"
  | "identity-doc"
  | "stage1-complete"
  | "proof-address"
  | "stage2-complete"
  | "submitting"
  | "error";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKYCComplete?: () => void;
}

export function KYCModal({ isOpen, onClose, onKYCComplete }: KYCModalProps) {
  const { user } = useUser();
  const { address: walletAddress } = useAccount();
  const initiateKyc = useMutation(api.kyc.initiateKyc);

  const [stage, setStage] = useState<KYCStage>("welcome");
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    phoneNumber: "",
    dateOfBirth: "",
    nationality: "",
    country: "",
    city: "",
    address: "",
    zipCode: "",
    idType: "PASSPORT" as "PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE",
    idNumber: "",
    idExpiryDate: "",
  });
  const [idDocument, setIdDocument] = useState<File | null>(null);

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleBasicDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStage("identity-doc");
  };

  const handleStage2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage("submitting");
    setError("");

    try {
      if (!walletAddress) {
        throw new Error("Please connect your wallet first");
      }

      await initiateKyc({
        clerkId: user?.id,
        walletAddress,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        zipCode: formData.zipCode,
        idType: formData.idType as
          | "PASSPORT"
          | "NATIONAL_ID"
          | "DRIVERS_LICENSE"
          | undefined,
        idNumber: formData.idNumber,
        idExpiryDate: formData.idExpiryDate,
      });
      setStage("stage2-complete");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Address verification failed. Please try again."
      );
      setStage("error");
    }
  };

  // const handleStage2Complete = () => {
  //   setStage("stage2-complete");
  //   if (onKYCComplete) {
  //     onKYCComplete();
  //   }
  // };

  const renderWelcome = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
        <Shield className="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome to Piron Finance! 👋
        </h2>
        <p className="text-slate-400 leading-relaxed">
          To keep everyone safe and comply with regulations, we need to verify
          your identity. Don&apos;t worry - it&apos;s quick and secure!
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div className="flex-grow">
            <span className="text-slate-300 font-medium">
              Stage 1: Basic details + ID verification
            </span>
            <div className="text-xs text-green-400">
              ✓ Unlocks investment up to $10,000
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>
          <div className="flex-grow">
            <span className="text-slate-400">
              Stage 2: Proof of address (optional)
            </span>
            <div className="text-xs text-slate-500">
              Unlocks investment up to $50,000
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Complete Stage 1 to start investing. Stage 2 unlocks higher limits.
      </p>

      <Button
        onClick={() => setStage("basic-details")}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        Let&apos;s get started
      </Button>
    </div>
  );

  const renderBasicDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Tell us about yourself
        </h2>
        <p className="text-slate-400">
          We&apos;ll use this information to verify your identity
        </p>
      </div>

      <form onSubmit={handleBasicDetailsSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-slate-300">
              First Name
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={handleInputChange("firstName")}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-slate-300">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={handleInputChange("lastName")}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-slate-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber" className="text-slate-300">
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange("phoneNumber")}
            placeholder="+1 (555) 123-4567"
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="dateOfBirth" className="text-slate-300">
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange("dateOfBirth")}
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationality" className="text-slate-300">
              Nationality
            </Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={handleInputChange("nationality")}
              placeholder="e.g. American"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="country" className="text-slate-300">
              Country
            </Label>
            <Input
              id="country"
              value={formData.country}
              onChange={handleInputChange("country")}
              placeholder="e.g. United States"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Continue to Identity Verification
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );

  const renderIdentityDoc = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Identity Verification
        </h2>
        <p className="text-slate-400">
          Upload a government-issued ID to complete Stage 1
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-slate-300">ID Type</Label>
          <select
            value={formData.idType}
            onChange={handleInputChange("idType")}
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="PASSPORT">Passport</option>
            <option value="NATIONAL_ID">National ID Card</option>
            <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
          </select>
        </div>

        <div>
          <Label htmlFor="idNumber" className="text-slate-300">
            ID Number
          </Label>
          <Input
            id="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange("idNumber")}
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="idExpiryDate" className="text-slate-300">
            Expiry Date
          </Label>
          <Input
            id="idExpiryDate"
            type="date"
            value={formData.idExpiryDate}
            onChange={handleInputChange("idExpiryDate")}
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>

        <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">Upload ID Document</p>
          <p className="text-slate-500 text-sm">
            Drag &amp; drop or click to upload (PNG, JPG up to 10MB)
          </p>
          {idDocument ? (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">✓ {idDocument.name}</p>
            </div>
          ) : (
            <div className="mt-4">
              <input
                type="file"
                id="idDocument"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setIdDocument(file);
                }}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("idDocument")?.click()}
                type="button"
              >
                <Camera className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={async () => {
            setStage("submitting");
            setError("");

            try {
              if (!walletAddress) {
                throw new Error("Please connect your wallet first");
              }

              if (!idDocument) {
                throw new Error("Please upload your ID document");
              }

              await initiateKyc({
                clerkId: user?.id,
                walletAddress,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                dateOfBirth: formData.dateOfBirth,
                nationality: formData.nationality,
                country: formData.country,
                idType: formData.idType as
                  | "PASSPORT"
                  | "NATIONAL_ID"
                  | "DRIVERS_LICENSE"
                  | undefined,
                idNumber: formData.idNumber,
                idExpiryDate: formData.idExpiryDate,
              });
              setStage("stage1-complete");
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Verification failed. Please try again."
              );
              setStage("error");
            }
          }}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Complete Stage 1 Verification
        </Button>
      </div>
    </div>
  );

  const renderStage1Complete = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Great! You&apos;re verified! 🎉
        </h2>
        <p className="text-slate-400">
          You can now invest in pools up to $10,000. Want to increase your
          limits?
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
        <h3 className="font-bold text-white mb-2">🚀 Unlock Higher Limits</h3>
        <p className="text-slate-300 text-sm mb-3">
          Complete Stage 2 verification to invest up to $50,000 per pool
        </p>
        <Button
          onClick={() => setStage("proof-address")}
          variant="outline"
          className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
        >
          Continue to Stage 2
        </Button>
      </div>

      <Button
        onClick={() => {
          if (onKYCComplete) onKYCComplete();
          onClose();
        }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        Start Investing Now
      </Button>
    </div>
  );

  const renderProofAddress = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Proof of Address</h2>
        <p className="text-slate-400">
          Upload a recent utility bill or bank statement
        </p>
      </div>

      <form onSubmit={handleStage2Submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="text-slate-300">
              City
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={handleInputChange("city")}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="zipCode" className="text-slate-300">
              ZIP Code
            </Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange("zipCode")}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address" className="text-slate-300">
            Full Address
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={handleInputChange("address")}
            placeholder="123 Main Street, Apt 4B"
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>

        <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">
            Upload Proof of Address
          </p>
          <p className="text-slate-500 text-sm">
            Bank statement, utility bill, or lease agreement (last 3 months)
          </p>
          <Button variant="outline" className="mt-4">
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Complete Stage 2 Verification
        </Button>
      </form>
    </div>
  );

  const renderStage2Complete = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Fully Verified! 🚀
        </h2>
        <p className="text-slate-400">
          You now have access to all investment opportunities with limits up to
          $50,000
        </p>
      </div>

      <Button
        onClick={() => {
          if (onKYCComplete) onKYCComplete();
          onClose();
        }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        Start Investing
      </Button>
    </div>
  );

  const renderSubmitting = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Processing...</h2>
        <p className="text-slate-400">
          Please wait while we verify your information
        </p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-6">
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
      <div>
        <h2 className="text-xl font-bold text-white mb-2">
          Verification Failed
        </h2>
        <p className="text-slate-400">{error}</p>
      </div>
      <Button onClick={() => setStage("basic-details")} variant="outline">
        Try Again
      </Button>
    </div>
  );

  const renderCurrentStage = () => {
    switch (stage) {
      case "welcome":
        return renderWelcome();
      case "basic-details":
        return renderBasicDetails();
      case "identity-doc":
        return renderIdentityDoc();
      case "stage1-complete":
        return renderStage1Complete();
      case "proof-address":
        return renderProofAddress();
      case "stage2-complete":
        return renderStage2Complete();
      case "submitting":
        return renderSubmitting();
      case "error":
        return renderError();
      default:
        return renderWelcome();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-950 border-slate-800">
        <DialogHeader>
          <DialogTitle className="sr-only">KYC Verification</DialogTitle>
        </DialogHeader>
        {renderCurrentStage()}
      </DialogContent>
    </Dialog>
  );
}
