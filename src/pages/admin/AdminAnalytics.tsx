import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Globe, TrendingUp, Sparkles, MessageSquareHeart } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { getFunnelConversionRate, getPlanLabel } from "@/lib/growth";
import { useTranslation } from "react-i18next";

const COLORS = ["hsl(174, 62%, 40%)", "hsl(24, 90%, 55%)", "hsl(220, 25%, 50%)", "hsl(340, 75%, 55%)"];

interface AdminStats {
  total_users: number;
  total_resumes: number;
  total_websites: number;
  published_websites: number;
}

interface GrowthStats {
  window_days: number;
  funnel: {
    signup_completed: number;
    resume_started: number;
    resume_completed: number;
    website_published: number;
    ats_scored: number;
    upgrade_clicked: number;
  };
  plan_distribution: { plan_key: string; users: number }[];
  onboarding_distribution: { onboarding_status: string; users: number }[];
  recent_feedback: {
    id: string;
    category: string;
    score: number;
    message: string | null;
    page_path: string | null;
    status: string;
    created_at: string;
  }[];
}

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [growth, setGrowth] = useState<GrowthStats | null>(null);
  const [templateData, setTemplateData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [adminStatsRes, growthRes, resumesRes, profilesRes] = await Promise.all([
        supabase.rpc("get_admin_stats"),
        supabase.rpc("get_admin_growth_stats", { days_back: 30 }),
        supabase.from("resumes").select("template"),
        supabase.from("profiles").select("created_at"),
      ]);

      if (adminStatsRes.data) setStats(adminStatsRes.data as unknown as AdminStats);
      if (growthRes.data) setGrowth(growthRes.data as unknown as GrowthStats);

      if (resumesRes.data) {
        const counts: Record<string, number> = {};
        resumesRes.data.forEach((resume) => {
          counts[resume.template] = (counts[resume.template] || 0) + 1;
        });
        setTemplateData(Object.entries(counts).map(([name, value]) => ({ name, value })));
      }

      if (profilesRes.data) {
        const monthly: Record<string, number> = {};
        profilesRes.data.forEach((profile) => {
          const month = new Date(profile.created_at).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
          monthly[month] = (monthly[month] || 0) + 1;
        });
        setMonthlyData(Object.entries(monthly).slice(-6).map(([name, value]) => ({ name, value })));
      }

      setLoading(false);
    };

    load();
  }, []);

  const funnelChartData = useMemo(() => {
    if (!growth) return [];
    return [
      { name: t("admin.funnelSignup"), value: growth.funnel.signup_completed },
      { name: t("admin.funnelResumeStarted"), value: growth.funnel.resume_started },
      { name: t("admin.funnelResumeCompleted"), value: growth.funnel.resume_completed },
      { name: t("admin.funnelSitePublished"), value: growth.funnel.website_published },
      { name: "ATS", value: growth.funnel.ats_scored },
      { name: "Upgrade", value: growth.funnel.upgrade_clicked },
    ];
  }, [growth, t]);

  const resumeCompletionRate = getFunnelConversionRate(
    growth?.funnel.signup_completed || 0,
    growth?.funnel.resume_completed || 0,
  );
  const publishRate = getFunnelConversionRate(
    growth?.funnel.signup_completed || 0,
    growth?.funnel.website_published || 0,
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">{t("admin.analytics")}</h1>

        {loading ? (
          <p className="text-muted-foreground">{t("common.loading")}</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <StatCard title={t("admin.users")} value={stats?.total_users || 0} icon={Users} />
              <StatCard title={t("admin.resumesCreated")} value={stats?.total_resumes || 0} icon={FileText} />
              <StatCard title={t("admin.websites")} value={stats?.total_websites || 0} icon={Globe} />
              <StatCard title={t("admin.publishedSites")} value={stats?.published_websites || 0} icon={TrendingUp} />
              <StatCard title={t("admin.cvCompletionRate")} value={`${resumeCompletionRate}%`} icon={Sparkles} />
              <StatCard title={t("admin.sitePublishRate")} value={`${publishRate}%`} icon={TrendingUp} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("admin.activationFunnel", { days: growth?.window_days || 30 })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {funnelChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={funnelChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(174, 62%, 40%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-12 text-center text-sm text-muted-foreground">{t("admin.noProductData")}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("admin.planMix")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {growth?.plan_distribution?.length ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={growth.plan_distribution.map((row) => ({
                            name: getPlanLabel(row.plan_key),
                            value: row.users,
                          }))}
                          cx="50%" cy="50%" outerRadius={88} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {growth.plan_distribution.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-12 text-center text-sm text-muted-foreground">{t("admin.noPlanData")}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("admin.onboardingStatuses")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(growth?.onboarding_distribution || []).map((row) => (
                    <div key={row.onboarding_status} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <span className="text-foreground">{row.onboarding_status}</span>
                      <Badge variant="secondary">{row.users}</Badge>
                    </div>
                  ))}
                  {(!growth?.onboarding_distribution || growth.onboarding_distribution.length === 0) && (
                    <p className="text-sm text-muted-foreground">{t("admin.noOnboardingData")}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("admin.monthlySignups")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(24, 90%, 55%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-12 text-center text-sm text-muted-foreground">{t("admin.noData")}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("admin.templatesUsed")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {templateData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={templateData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {templateData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-12 text-center text-sm text-muted-foreground">{t("admin.noData")}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquareHeart className="h-4 w-4 text-primary" />
                  {t("admin.recentFeedback")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(growth?.recent_feedback || []).map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{entry.category}</Badge>
                        <span className="text-sm text-foreground">{t("admin.score")} {entry.score}/5</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.message && <p className="mt-2 text-sm text-muted-foreground">{entry.message}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {entry.page_path || t("admin.unknownPage")} • {t("admin.status")}: {entry.status}
                    </p>
                  </div>
                ))}
                {(!growth?.recent_feedback || growth.recent_feedback.length === 0) && (
                  <p className="text-sm text-muted-foreground">{t("admin.noFeedback")}</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
