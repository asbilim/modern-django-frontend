"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import { dashboardConfig } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const t = useTranslations("SettingsPage");
  const { toast } = useToast();

  const [siteName, setSiteName] = useState(dashboardConfig.name);
  const [logoUrl, setLogoUrl] = useState(dashboardConfig.logoUrl);
  const [navbarStyle, setNavbarStyle] = useState("modern");
  const [otpEnabled, setOtpEnabled] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("siteName");
    if (storedName) setSiteName(storedName);
    const storedLogo = localStorage.getItem("logoUrl");
    if (storedLogo) setLogoUrl(storedLogo);
    const style = localStorage.getItem("navbarStyle");
    if (style) setNavbarStyle(style);
    const otp = localStorage.getItem("otpEnabled");
    if (otp === "true") setOtpEnabled(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("siteName", siteName);
    localStorage.setItem("logoUrl", logoUrl);
    localStorage.setItem("navbarStyle", navbarStyle);
    localStorage.setItem("otpEnabled", String(otpEnabled));
    toast({ title: t("title"), description: t("save") });
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <h2 className="font-semibold mb-2">{t("general")}</h2>
          <FormInput
            label={t("siteName")}
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
          <FormInput
            label={t("logo")}
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          <div className="mt-2">
            <label className="form-label" htmlFor="navbarStyle">
              {t("navbarStyle")}
            </label>
            <select
              id="navbarStyle"
              className="form-input"
              value={navbarStyle}
              onChange={(e) => setNavbarStyle(e.target.value)}
            >
              <option value="minimalistic">minimalistic</option>
              <option value="modern">modern</option>
              <option value="simple">simple</option>
            </select>
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">{t("otp")}</h2>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={otpEnabled}
              onChange={(e) => setOtpEnabled(e.target.checked)}
            />
            <span>{t("otp")}</span>
          </label>
        </div>
        <div>
          <h2 className="font-semibold mb-2">{t("password")}</h2>
          <FormInput label="Current Password" type="password" required />
          <FormInput label="New Password" type="password" required />
        </div>
        <FormButton type="submit">{t("save")}</FormButton>
      </form>
    </div>
  );
}
