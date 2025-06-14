"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md mx-4 text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("description")}</p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary>{t("details")}</summary>
              <pre className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                <code>{error.stack}</code>
              </pre>
            </details>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => reset()} className="w-full">
            {t("tryAgain")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
