"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";

// Zod schema creators for form validation
const createProfileFormSchema = (t: (key: string) => string) =>
  z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email(t("validation.invalidEmail")),
  });

const createPasswordFormSchema = (t: (key: string) => string) =>
  z
    .object({
      old_password: z.string().min(1, t("validation.oldPasswordRequired")),
      new_password: z.string().min(8, t("validation.newPasswordLength")),
      confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t("validation.passwordsDontMatch"),
      path: ["confirm_password"],
    });

const createTwoFactorFormSchema = (t: (key: string) => string) =>
  z.object({
    otp: z.string().length(6, t("validation.otpLength")),
  });

const createDisableTwoFactorFormSchema = (t: (key: string) => string) =>
  z.object({
    password: z.string().min(1, t("validation.passwordRequiredFor2FA")),
  });

export default function SettingsPage() {
  const t = useTranslations("SettingsPage");
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: api.getUserProfile,
  });

  if (isLoading) return <SettingsSkeleton />;
  if (error)
    return (
      <div className="text-destructive">
        {t("loadError", { message: error.message })}
      </div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <ProfileForm user={user} />
      <PasswordForm />
      <TwoFactorAuthForm is2FAEnabled={user?.is_2fa_enabled} />
    </div>
  );
}

function ProfileForm({ user }: { user: any }) {
  const t = useTranslations("SettingsPage");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileFormSchema = createProfileFormSchema(t);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof profileFormSchema>) =>
      api.updateUserProfile(data),
    onSuccess: () => {
      toast({ title: t("profileUpdateSuccess") });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("profileUpdateError"),
        description: error.message,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profileTitle")}</CardTitle>
        <CardDescription>{t("profileDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("firstName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("lastName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("saving") : t("save")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const t = useTranslations("SettingsPage");
  const { toast } = useToast();
  const passwordFormSchema = createPasswordFormSchema(t);

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof passwordFormSchema>) =>
      api.changePassword(data),
    onSuccess: () => {
      toast({ title: t("passwordUpdateSuccess") });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("passwordUpdateError"),
        description: error.message,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("passwordTitle")}</CardTitle>
        <CardDescription>{t("passwordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4">
            <FormField
              control={form.control}
              name="old_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currentPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("newPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmNewPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("saving") : t("savePassword")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function TwoFactorAuthForm({ is2FAEnabled }: { is2FAEnabled: boolean }) {
  const t = useTranslations("SettingsPage");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
  const [secret, setSecret] = React.useState<string | null>(null);

  const twoFactorFormSchema = createTwoFactorFormSchema(t);
  const disableTwoFactorFormSchema = createDisableTwoFactorFormSchema(t);

  // Mutation to get the 2FA secret and QR code
  const enableMutation = useMutation({
    mutationFn: api.get2FASecret,
    onSuccess: (data: {
      qr_code?: string;
      qr_code_url?: string;
      secret_key: string;
    }) => {
      if (data.qr_code) {
        const qrCodeDataUri = `data:image/svg+xml;base64,${btoa(data.qr_code)}`;
        setQrCodeUrl(qrCodeDataUri);
      } else if (data.qr_code_url) {
        setQrCodeUrl(data.qr_code_url);
      }
      setSecret(data.secret_key);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("twoFactorEnableErrorTitle"),
        description: error.message,
      });
    },
  });

  // Mutation to verify the OTP and activate 2FA
  const verifyMutation = useMutation({
    mutationFn: (otp: string) => api.verify2FA(otp),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onSuccess: () => {
      toast({
        title: t("twoFactorEnableSuccessTitle"),
        description: t("twoFactorEnableSuccessDescription"),
      });
      setQrCodeUrl(null);
      setSecret(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("twoFactorVerifyErrorTitle"),
        description: error.message,
      });
    },
  });

  const disableMutation = useMutation({
    mutationFn: (password: string) => api.disable2FA(password),
    onSuccess: () => {
      toast({ title: t("twoFactorDisableSuccessTitle") });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("twoFactorDisableErrorTitle"),
        description: error.message,
      });
    },
  });

  const verifyForm = useForm<z.infer<typeof twoFactorFormSchema>>({
    resolver: zodResolver(twoFactorFormSchema),
  });

  const disableForm = useForm<z.infer<typeof disableTwoFactorFormSchema>>({
    resolver: zodResolver(disableTwoFactorFormSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("twoFactorTitle")}</CardTitle>
        <CardDescription>{t("twoFactorDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {is2FAEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p>{t("twoFactorEnabled")}</p>
            </div>
            <Form {...disableForm}>
              <form
                onSubmit={disableForm.handleSubmit((data) =>
                  disableMutation.mutate(data.password)
                )}
                className="space-y-4">
                <FormField
                  control={disableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("currentPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          placeholder={t("disable2faPasswordPlaceholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={disableMutation.isPending}>
                  {disableMutation.isPending ? t("disabling") : t("disable2FA")}
                </Button>
              </form>
            </Form>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-4">
            <p>{t("scanQrCode")}</p>
            <div className="p-4 border rounded-md inline-block">
              <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("secretKey")}:{" "}
              <code className="bg-muted px-1 py-0.5 rounded">{secret}</code>
            </p>
            <Form {...verifyForm}>
              <form
                onSubmit={verifyForm.handleSubmit((data) =>
                  verifyMutation.mutate(data.otp)
                )}
                className="space-y-4">
                <FormField
                  control={verifyForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("verificationCode")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("otpPlaceholder")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setQrCodeUrl(null)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={verifyMutation.isPending}>
                    {verifyMutation.isPending
                      ? t("verifying")
                      : t("verifyAndActivate")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{t("twoFactorDisabled")}</p>
            </div>
            <Button
              onClick={() => enableMutation.mutate()}
              disabled={enableMutation.isPending}>
              {enableMutation.isPending ? t("enabling") : t("enable2FA")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" />
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
