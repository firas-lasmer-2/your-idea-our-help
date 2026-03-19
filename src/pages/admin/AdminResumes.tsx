import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminResumes() {
  const { t } = useTranslation();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("resumes").select("*").order("created_at", { ascending: false });
      setResumes(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = resumes.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "complete" ? r.is_complete : !r.is_complete);
    return matchSearch && matchStatus;
  });

  const exportCsv = () => {
    const headers = ["title", "template", "current_step", "is_complete", "created_at"];
    const rows = filtered.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resumes_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t("admin.allResumes")}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filtered.length}/{resumes.length}</Badge>
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
              <SelectItem value="complete">{t("admin.completed")}</SelectItem>
              <SelectItem value="incomplete">{t("admin.inProgress")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.title")}</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>{t("admin.step")}</TableHead>
                <TableHead>{t("admin.status")}</TableHead>
                <TableHead>{t("admin.createdOn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("common.loading")}</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("admin.noResumes")}</TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.title}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{r.template}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.current_step}/9</TableCell>
                  <TableCell>
                    <Badge variant={r.is_complete ? "default" : "secondary"} className="text-xs">
                      {r.is_complete ? t("admin.completed") : t("admin.inProgress")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
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
