"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AlertCircle } from "lucide-react";

interface Stat {
  title: string;
  value: string;
  change: string;
  icon: string;
  description?: string;
}

interface Activity {
  type: string;
  title: string;
  user: string;
  timestamp: string;
}

interface DashboardData {
  stats: Stat[];
  user_signups_over_time: { date: string; count: number }[];
  content_creation_stats: { name: string; value: number }[];
  activity_feed: Activity[];
}

export default function DashboardPage() {
  const { status } = useSession();
  const t = useTranslations("DashboardPage");
  const router = useRouter();

  const mockData: DashboardData = useMemo(
    () => ({
      stats: [
        {
          title: t("mock.stats.newUsers.title"),
          value: "1,234",
          change: "+56",
          icon: "users",
          description: t("mock.stats.newUsers.description"),
        },
        {
          title: t("mock.stats.sales.title"),
          value: "$54,321",
          change: "-432",
          icon: "dollar-sign",
          description: t("mock.stats.sales.description"),
        },
        {
          title: t("mock.stats.pendingTasks.title"),
          value: "23",
          change: "+5",
          icon: "clock",
          description: t("mock.stats.pendingTasks.description"),
        },
        {
          title: t("mock.stats.totalProjects.title"),
          value: "78",
          change: "+2",
          icon: "briefcase",
          description: t("mock.stats.totalProjects.description"),
        },
      ],
      user_signups_over_time: [
        { date: t("mock.months.jan"), count: 65 },
        { date: t("mock.months.feb"), count: 59 },
        { date: t("mock.months.mar"), count: 80 },
        { date: t("mock.months.apr"), count: 81 },
        { date: t("mock.months.may"), count: 56 },
        { date: t("mock.months.jun"), count: 55 },
        { date: t("mock.months.jul"), count: 40 },
      ],
      content_creation_stats: [
        { name: t("mock.content.projects"), value: 400 },
        { name: t("mock.content.tasks"), value: 300 },
        { name: t("mock.content.users"), value: 200 },
        { name: t("mock.content.categories"), value: 278 },
        { name: t("mock.content.tags"), value: 189 },
      ],
      activity_feed: [
        {
          type: "new_post",
          title: t("mock.feed.newPost"),
          user: "admin",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          type: "new_comment",
          title: t("mock.feed.newComment"),
          user: "JaneDoe",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          type: "new_user",
          title: t("mock.feed.newUser"),
          user: "system",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
      ],
    }),
    [t]
  );

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<DashboardData>({
    queryKey: ["dashboardStats"],
    queryFn: api.getDashboardStats,
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const data = dashboardData || mockData;

  if (isLoading || status === "loading") {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-bold text-destructive">
            {t("loadErrorTitle")}
          </h2>
        </div>
        <p className="text-destructive mb-4">{error.message}</p>
        <p className="text-sm text-muted-foreground">
          {t("loadErrorDescription")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {data.stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 grid gap-4">
          <AreaChartCard data={data.user_signups_over_time} />
          <BarChartCard data={data.content_creation_stats} />
        </div>
        <div className="xl:col-span-2">
          <ActivityFeedCard data={data.activity_feed} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, description }: Stat) {
  const isPositive = change.startsWith("+");
  const isNegative = change.startsWith("-");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <DynamicIcon name={icon} className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={cn(
            "text-xs text-muted-foreground",
            isPositive && "text-green-500",
            isNegative && "text-red-500"
          )}>
          <span className="font-semibold">{change}</span> {description}
        </p>
      </CardContent>
    </Card>
  );
}

function AreaChartCard({ data }: { data: any[] }) {
  const t = useTranslations("DashboardPage");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("userSignupsCardTitle")}</CardTitle>
        <CardDescription>{t("userSignupsCardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} />
            <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-background)",
                border: "1px solid var(--color-border)",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-primary)"
              fillOpacity={1}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function BarChartCard({ data }: { data: any[] }) {
  const t = useTranslations("DashboardPage");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contentOverviewCardTitle")}</CardTitle>
        <CardDescription>{t("contentOverviewCardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-background)",
                border: "1px solid var(--color-border)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar
              dataKey="value"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ActivityFeedCard({ data }: { data: Activity[] }) {
  const t = useTranslations("Time");
  const tDashboard = useTranslations("DashboardPage");

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return t("years", { count: Math.floor(interval) });
    interval = seconds / 2592000;
    if (interval > 1) return t("months", { count: Math.floor(interval) });
    interval = seconds / 86400;
    if (interval > 1) return t("days", { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t("hours", { count: Math.floor(interval) });
    interval = seconds / 60;
    if (interval > 1) return t("minutes", { count: Math.floor(interval) });
    return t("seconds", { count: Math.floor(seconds) });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_post":
        return "file-plus";
      case "new_comment":
        return "message-square";
      case "new_user":
        return "user-plus";
      default:
        return "bell";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{tDashboard("activityFeedCardTitle")}</CardTitle>
        <CardDescription>
          {tDashboard("activityFeedCardDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <DynamicIcon
                name={getIcon(activity.type)}
                className="h-5 w-5 text-muted-foreground mt-1"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {tDashboard("activityByUser", { user: activity.user })}{" "}
                  &middot; {timeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/2 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 grid gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
