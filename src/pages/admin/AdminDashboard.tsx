import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/admin/StatCard";
import { Users, FileText, Globe, MessageSquare, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>

        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard title="Utilisateurs" value={stats.total_users} icon={Users} />
              <StatCard title="CV créés" value={stats.total_resumes} icon={FileText} />
              <StatCard title="Sites web" value={stats.total_websites} icon={Globe} />
              <StatCard title="Sites publiés" value={stats.published_websites} icon={Eye} />
              <StatCard title="Messages" value={stats.total_contacts} icon={MessageSquare} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-base">Derniers utilisateurs</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(stats.recent_users || []).map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{u.full_name || "Sans nom"}</span>
                      <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  ))}
                  {(!stats.recent_users || stats.recent_users.length === 0) && (
                    <p className="text-sm text-muted-foreground">Aucun utilisateur</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Derniers CV</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(stats.recent_resumes || []).map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate max-w-[150px]">{r.title}</span>
                      <Badge variant={r.is_complete ? "default" : "secondary"} className="text-xs">
                        {r.is_complete ? "Terminé" : "En cours"}
                      </Badge>
                    </div>
                  ))}
                  {(!stats.recent_resumes || stats.recent_resumes.length === 0) && (
                    <p className="text-sm text-muted-foreground">Aucun CV</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Derniers sites</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(stats.recent_websites || []).map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate max-w-[150px]">{w.title}</span>
                      <Badge variant={w.is_published ? "default" : "secondary"} className="text-xs">
                        {w.is_published ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                  ))}
                  {(!stats.recent_websites || stats.recent_websites.length === 0) && (
                    <p className="text-sm text-muted-foreground">Aucun site</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <p className="text-destructive">Erreur de chargement</p>
        )}
      </div>
    </AdminLayout>
  );
}
