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

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errors: Record<string, { title: string; description: string }> = {
    CredentialsSignin: {
      title: "Sign-in Failed",
      description:
        "The username or password you entered is incorrect. Please double-check your credentials and try again.",
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You do not have permission to access this page.",
    },
    Configuration: {
      title: "Server Configuration Error",
      description:
        "There is an issue with the server configuration. Please contact an administrator.",
    },
    Default: {
      title: "Something went wrong",
      description: "An unexpected error occurred during authentication.",
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
            <Link href="/login">Go back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
