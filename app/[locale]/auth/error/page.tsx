"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const t = useTranslations("AuthErrorPage");

  const errors: Record<string, { title: string; description: string }> = {
    CredentialsSignin: {
      title: t("credentialsSigninTitle"),
      description: t("credentialsSigninDescription"),
    },
    AccessDenied: {
      title: t("accessDeniedTitle"),
      description: t("accessDeniedDescription"),
    },
    Configuration: {
      title: t("configurationTitle"),
      description: t("configurationDescription"),
    },
    Default: {
      title: t("defaultTitle"),
      description: t("defaultDescription"),
    },
  };

  const { title, description } = errors[error as string] ?? errors.Default;

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">{t("backToLogin")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
