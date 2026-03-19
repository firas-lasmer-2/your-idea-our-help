import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/admin/StatCard";
import { Users, FileText, Globe, MessageSquare, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface AdminStats {
  total_users: number;
  total_resumes: number;
  total_websites: number;
  published_websites: number;
  total_contacts: number;
  recent_users: any[] | null;
  recent_resumes: any[] | null;
  recent_websites: any[] | null;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.rpc("get_admin_stats");
      if (!error && data) setStats(data as unknown as AdminStats);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">{t("admin.dashboard")}</h1>

        {loading ? (
          <p className="text-muted-foreground">{t("common.loading")}</p>
        ) : stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard title={t("admin.users")} value={stats.total_users} icon={Users} />
              <StatCard title={t("admin.resumesCreated")} value={stats.total_resumes} icon={FileText} />
              <StatCard title={t("admin.websites")} value={stats.total_websites} icon={Globe} />
              <StatCard title={t("admin.publishedSites")} value={stats.published_websites} icon={Eye} />
              <StatCard title={t("admin.contacts")} value={stats.total_contacts} icon={MessageSquare} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-base">{t("admin.recentUsers")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(stats.recent_users || []).map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{u.full_name || t("admin.noName")}</span>
                      <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {(!stats.recent_users || stats.recent_users.length === 0) && (
                    <p className="text-sm text-muted-foreground">{t("admin.noUsers")}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">{t("admin.recentResumes")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(stats.recent_resumes || []).map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate max-w-[150px]">{r.title}</span>
                      <Badge variant={r.is_complete ? "default" : "secondary"} className="text-xs">
                        {r.is_complete ? t("admin.completed") : t("admin.inProgress")}
                      </Badge>
                    </div>
                  ))}
                  {(!stats.recent_resumes || stats.recent_resumes.length === 0) && (
                    <p className="text-sm text-muted-foreground">{t("admin.noResumes")}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">{t("admin.recentSites")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(stats.recent_websites || []).map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate max-w-[150px]">{w.title}</span>
                      <Badge variant={w.is_published ? "default" : "secondary"} className="text-xs">
                        {w.is_published ? t("admin.published") : t("admin.draft")}
                      </Badge>
                    </div>
                  ))}
                  {(!stats.recent_websites || stats.recent_websites.length === 0) && (
                    <p className="text-sm text-muted-foreground">{t("admin.noSites")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <p className="text-destructive">{t("admin.loadError")}</p>
        )}
      </div>
    </AdminLayout>
  );
}
