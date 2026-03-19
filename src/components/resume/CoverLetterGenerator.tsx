import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Download, Copy, Check } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  data: ResumeData;
}

const CoverLetterGenerator = ({ data }: Props) => {
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("cover-letter", {
        body: { resumeData: data, jobDescription },
      });
      if (error || result?.error) {
        toast({ title: "Erreur", description: result?.error || "Erreur de génération.", variant: "destructive" });
      } else if (result?.result) {
        setCoverLetter(result.result);
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de contacter le service.", variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!letterRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const name = `${data.personalInfo.firstName}_${data.personalInfo.lastName}`.trim() || "Lettre";
      await html2pdf()
        .set({
          margin: [15, 15, 15, 15],
          filename: `Lettre_${name}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(letterRef.current)
        .save();
    } catch (e) {
      console.error("PDF error:", e);
    }
    setDownloading(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border p-5">
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Description du poste (optionnel)</Label>
          <Textarea
            placeholder="Collez la description du poste pour une lettre personnalisée..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Génération..." : "Générer la lettre de motivation"}
          </Button>
        </div>
      </Card>

      {coverLetter && (
        <Card className="border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Votre lettre de motivation</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copié" : "Copier"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPDF} disabled={downloading}>
                {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                PDF
              </Button>
            </div>
          </div>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={12}
            className="resize-none text-sm font-serif leading-relaxed"
          />
          {/* Hidden rendered version for PDF */}
          <div style={{ position: "absolute", left: "-9999px" }}>
            <div ref={letterRef} style={{ width: "600px", padding: "40px", fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.8, color: "#1f2937", whiteSpace: "pre-wrap" }}>
              {coverLetter}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CoverLetterGenerator;
