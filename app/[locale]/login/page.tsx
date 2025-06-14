"use client";

import { useTranslations } from "next-intl";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { dashboardConfig } from "@/lib/config";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import { OtpDialog } from "@/components/otp-dialog";

export default function LoginPage() {
  const t = useTranslations("LoginPage");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [authData, setAuthData] = useState({ username: "", password: "" });
  const { update } = useSession();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    setAuthData({ username, password });

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (!result || result.error) {
        toast({
          variant: "destructive",
          title: t("toastErrorTitle"),
          description: t("toastErrorDescription"),
        });
        setIsLoading(false);
        return;
      }

      const newSession = await update();

      if (newSession?.is_2fa_enabled) {
        setShowOtpDialog(true);
        setIsLoading(false);
      } else {
        toast({
          title: t("toastSuccessTitle"),
          description: t("toastSuccessDescription"),
        });
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: authData.username,
        password: authData.password,
        otp,
      });

      if (result && !result.error) {
        setShowOtpDialog(false);
        toast({
          title: t("toastSuccessTitle"),
          description: t("toastSuccessDescription"),
        });
        window.location.href = "/";
      } else {
        toast({
          variant: "destructive",
          title: t("toastOtpInvalidTitle"),
          description: t("toastOtpInvalidDescription"),
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("OTP submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="form-container">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">{dashboardConfig.name}</h1>
            <p className="text-muted-foreground mt-2">
              {dashboardConfig.description}
            </p>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">{t("title")}</h2>
          <form className="" onSubmit={handleSubmit}>
            <FormInput
              id="username"
              name="username"
              label={t("usernameLabel")}
              required
              type="text"
            />
            <FormInput
              id="password"
              name="password"
              label={t("passwordLabel")}
              required
              type="password"
            />
            <div className="mt-6">
              <FormButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}>
                {t("signInButton")}
              </FormButton>
            </div>
          </form>
        </div>
      </div>
      <OtpDialog
        isOpen={showOtpDialog}
        onClose={() => setShowOtpDialog(false)}
        onSubmit={handleOtpSubmit}
        isLoading={isLoading}
      />
    </>
  );
}
