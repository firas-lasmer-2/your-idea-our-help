import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (resumeData: any) => void;
}

const ResumeImportDialog = ({ open, onOpenChange, onImportSuccess }: Props) => {
  const { t } = useTranslation();
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError(t("import.pdfOnly", "Seuls les fichiers PDF sont acceptés."));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("import.maxSize", "Le fichier ne doit pas dépasser 5 Mo."));
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    setError("");

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const { data, error: fnError } = await supabase.functions.invoke("resume-import", {
        body: { pdfBase64: base64, filename: selectedFile.name },
      });

      if (fnError || data?.error) {
        setError(data?.error || t("import.retryError", "Erreur lors de l'import. Réessayez."));
        setImporting(false);
        return;
      }

      if (data?.resumeData) {
        onImportSuccess(data.resumeData);
        toast({ title: t("import.success", "CV importé !"), description: t("import.successDesc", "Les informations ont été extraites avec succès.") });
        onOpenChange(false);
        setSelectedFile(null);
      } else {
        setError(t("import.extractError", "Impossible d'extraire les données du CV."));
      }
    } catch {
      setError(t("import.connectionError", "Erreur de connexion. Vérifiez votre connexion internet."));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("import.title", "Importer un CV existant")}</DialogTitle>
          <DialogDescription>
            {t("import.description", "Importez un CV au format PDF. L'IA extraira automatiquement vos informations.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/40 hover:bg-primary/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {selectedFile ? selectedFile.name : t("import.selectPdf", "Cliquez pour sélectionner un PDF")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t("import.pdfMax", "PDF uniquement, 5 Mo maximum")}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            className="w-full gap-2"
            onClick={handleImport}
            disabled={!selectedFile || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("import.extracting", "Extraction en cours...")}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                {t("import.importButton", "Importer et extraire")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeImportDialog;
