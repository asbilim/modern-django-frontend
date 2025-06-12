"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { dashboardConfig } from "@/lib/config";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";

export default function LoginPage() {
  const t = useTranslations("LoginPage");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await signIn("credentials", {
        redirect: false,
        username: formData.get("username"),
        password: formData.get("password"),
      });

      console.log("Sign-in result from client:", result);

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Please check your credentials and try again.",
        });
      } else {
        toast({
          variant: "success",
          title: "Success",
          description: "You have been successfully logged in.",
        });
        // Redirect to the dashboard on successful login.
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
