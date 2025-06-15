"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Book,
  Code,
  Cog,
  Layers,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  const t = useTranslations("HomePage");
  const { data: session } = useSession();

  const features = [
    {
      icon: <Layers className="h-6 w-6 text-primary" />,
      title: t("features.modern.title"),
      description: t("features.modern.description"),
    },
    {
      icon: <Cog className="h-6 w-6 text-primary" />,
      title: t("features.customizable.title"),
      description: t("features.customizable.description"),
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: t("features.ai.title"),
      description: t("features.ai.description"),
    },
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      title: t("features.developer.title"),
      description: t("features.developer.description"),
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background to-secondary/10 pt-16 pb-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center">
              <motion.h1
                className="hero-title text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                {t("hero.title")}
              </motion.h1>
              <motion.p
                className="hero-subtitle text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}>
                {t("hero.description")}
              </motion.p>
              <motion.div
                className="hero-cta flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}>
                {session ? (
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      {t("hero.dashboardButton")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link href="/login">
                      {t("hero.loginButton")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">{t("hero.learnMoreButton")}</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{t("features.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col p-6 bg-card border rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="py-16 bg-secondary/10">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                {t("gettingStarted.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("gettingStarted.subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="p-6 bg-card rounded-lg border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  {t("gettingStarted.step1.title")}
                </h3>
                <p className="text-muted-foreground text-center">
                  {t("gettingStarted.step1.description")}
                </p>
              </motion.div>

              <motion.div
                className="p-6 bg-card rounded-lg border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  {t("gettingStarted.step2.title")}
                </h3>
                <p className="text-muted-foreground text-center">
                  {t("gettingStarted.step2.description")}
                </p>
              </motion.div>

              <motion.div
                className="p-6 bg-card rounded-lg border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  {t("gettingStarted.step3.title")}
                </h3>
                <p className="text-muted-foreground text-center">
                  {t("gettingStarted.step3.description")}
                </p>
              </motion.div>
            </div>

            <div className="mt-10 text-center">
              <Button asChild size="lg">
                <Link href="/blog">
                  <Book className="mr-2 h-4 w-4" />
                  {t("gettingStarted.docsButton")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
