import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search } from "lucide-react";

export default function AdminWebsites() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("websites").select("*").order("created_at", { ascending: false });
      setWebsites(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = websites.filter((w) => w.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Tous les sites web</h1>
          <Badge variant="secondary">{websites.length} total</Badge>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
              ) : filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium text-foreground">{w.title}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{w.purpose}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.template}</TableCell>
                  <TableCell>
                    <Badge variant={w.is_published ? "default" : "secondary"} className="text-xs">
                      {w.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(w.created_at).toLocaleDateString("fr-FR")}
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
