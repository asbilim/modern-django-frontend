"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OtpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  isLoading: boolean;
}

export function OtpDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: OtpDialogProps) {
  const t = useTranslations("OtpDialog");
  const [otp, setOtp] = useState("");

  const handleSubmit = () => {
    if (otp) {
      onSubmit(otp);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t("placeholder")}
            maxLength={6}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !otp}>
            {isLoading ? t("verifying") : t("verify")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
