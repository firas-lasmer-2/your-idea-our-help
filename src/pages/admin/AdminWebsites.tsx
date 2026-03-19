import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ExternalLink, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminWebsites() {
  const { t } = useTranslation();
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("websites").select("*").order("created_at", { ascending: false });
      setWebsites(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = websites.filter((w) => {
    const matchSearch = w.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "published" ? w.is_published : !w.is_published);
    return matchSearch && matchStatus;
  });

  const exportCsv = () => {
    const headers = ["title", "purpose", "template", "is_published", "created_at"];
    const rows = filtered.map((w) => headers.map((h) => JSON.stringify(w[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "websites_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t("admin.allWebsites")}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filtered.length}/{websites.length}</Badge>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("admin.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
              <SelectItem value="published">{t("admin.published")}</SelectItem>
              <SelectItem value="draft">{t("admin.draft")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.title")}</TableHead>
                <TableHead>{t("admin.type")}</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>{t("admin.status")}</TableHead>
                <TableHead>{t("admin.createdOn")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("common.loading")}</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("admin.noSites")}</TableCell></TableRow>
              ) : filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium text-foreground">{w.title}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{w.purpose}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.template}</TableCell>
                  <TableCell>
                    <Badge variant={w.is_published ? "default" : "secondary"} className="text-xs">
                      {w.is_published ? t("admin.published") : t("admin.draft")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(w.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {w.is_published && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/site/${w.id}`} target="_blank"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
