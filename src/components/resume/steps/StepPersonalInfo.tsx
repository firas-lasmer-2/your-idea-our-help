import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResumeData, TUNISIAN_CITIES } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Github, User, Upload, Loader2, Briefcase, Shield, CreditCard, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCountryStandard, type TargetCountry } from "@/lib/country-standards";
import { useTranslation } from "react-i18next";
import { useResumeAi } from "@/hooks/use-resume-ai";

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
}

const StepPersonalInfo = ({ data, updateData }: Props) => {
  const [importing, setImporting] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { generateSummary } = useResumeAi();
  const experienceOptions = [
    { value: "none", label: t("resume.noExperience") },
    { value: "1-3", label: t("resume.exp1to3") },
    { value: "3-10", label: t("resume.exp3to10") },
    { value: "10+", label: t("resume.exp10plus") },
  ];

  const countryStd = data.targetCountry ? getCountryStandard(data.targetCountry as TargetCountry) : null;
  const hidePhoto = countryStd?.mustExclude.includes("photo");
  const hideLinkedIn = data.simplifiedMode && data.jobField && ["construction", "transport"].includes(data.jobField);
  const hideGithub = data.simplifiedMode || (data.jobField && !["tech"].includes(data.jobField));

  const update = (field: string, value: string) => {
    updateData({
      personalInfo: { ...data.personalInfo, [field]: value },
    });
  };

  const handleImportPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: t("common.error"), description: t("resume.pdfOnly", "Veuillez sélectionner un fichier PDF."), variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("common.error"), description: t("resume.fileTooLarge", "Le fichier est trop volumineux (max 5 Mo)."), variant: "destructive" });
      return;
    }

    setImporting(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: result, error } = await supabase.functions.invoke("resume-import", {
        body: { pdfBase64: base64, filename: file.name },
      });

      if (error || result?.error) {
        toast({ title: t("common.error"), description: result?.error || t("resume.importError", "Erreur d'importation."), variant: "destructive" });
      } else if (result?.resumeData) {
        const imported = result.resumeData;
        updateData({
          personalInfo: { ...data.personalInfo, ...imported.personalInfo },
          education: imported.education?.length > 0 ? imported.education : data.education,
          experience: imported.experience?.length > 0 ? imported.experience : data.experience,
          summary: imported.summary || data.summary,
          languages: imported.languages?.length > 0 ? imported.languages : data.languages,
          interests: imported.interests?.length > 0 ? imported.interests : data.interests,
        });
        toast({ title: t("resume.importSuccess"), description: t("resume.importSuccessDesc") });
      }
    } catch {
      toast({ title: t("common.error"), description: t("resume.importFailed", "Impossible d'importer le CV."), variant: "destructive" });
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    const summary = await generateSummary(data);
    if (summary) {
      updateData({ summary });
    }
    setGeneratingSummary(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {data.simplifiedMode ? t("resume.coordinates") : t("resume.personalInfo")}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {data.simplifiedMode ? t("resume.coordDesc") : t("resume.personalDesc")}
          </p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleImportPDF} />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {importing ? t("resume.importing") : t("resume.importPdf")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="jobTitle">{t("resume.targetJob")}</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="jobTitle"
              placeholder={t("resume.targetJobPlaceholder")}
              className="pl-10"
              value={data.jobTitle}
              onChange={(e) => updateData({ jobTitle: e.target.value, jobTarget: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("resume.targetJobHint")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="experienceLevel">{t("resume.experienceLevel")}</Label>
          <Select
            value={data.experienceLevel || undefined}
            onValueChange={(value) => updateData({ experienceLevel: value })}
          >
            <SelectTrigger id="experienceLevel">
              <SelectValue placeholder={t("resume.selectLevel")} />
            </SelectTrigger>
            <SelectContent>
              {experienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("resume.firstName")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="firstName" placeholder="Ahmed" className="pl-10" value={data.personalInfo.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("resume.lastName")}</Label>
          <Input id="lastName" placeholder="Ben Ali" value={data.personalInfo.lastName} onChange={(e) => update("lastName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("resume.emailLabel")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="ahmed@email.com" className="pl-10" value={data.personalInfo.email} onChange={(e) => update("email", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("resume.phone")}</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="phone" placeholder="+216 XX XXX XXX" className="pl-10" value={data.personalInfo.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("resume.city")}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Select value={data.personalInfo.city} onValueChange={(v) => update("city", v)}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder={t("resume.selectCity")} />
              </SelectTrigger>
              <SelectContent>
                {TUNISIAN_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {!hideLinkedIn && (
          <div className="space-y-2">
            <Label htmlFor="linkedin">{t("resume.linkedin")}</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="linkedin" placeholder="linkedin.com/in/ahmed" className="pl-10" value={data.personalInfo.linkedIn} onChange={(e) => update("linkedIn", e.target.value)} />
            </div>
          </div>
        )}
        {!hideGithub && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="github">{t("resume.github")}</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="github" placeholder="github.com/ahmed" className="pl-10" value={data.personalInfo.github} onChange={(e) => update("github", e.target.value)} />
            </div>
          </div>
        )}

        {/* Tunisian-specific fields */}
        {(!data.targetCountry || data.targetCountry === "tunisia") && (
          <>
            <div className="space-y-2">
              <Label htmlFor="militaryService">{t("resume.militaryService")}</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Select value={data.personalInfo.militaryService || ""} onValueChange={(v) => update("militaryService", v)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder={t("resume.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="effectue">{t("resume.completed")}</SelectItem>
                    <SelectItem value="exempte">{t("resume.exempt")}</SelectItem>
                    <SelectItem value="en_cours">{t("resume.inProgress")}</SelectItem>
                    <SelectItem value="non_applicable">{t("resume.notApplicable")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cin">{t("resume.cin")}</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="cin" placeholder="08XXXXXX" className="pl-10" value={data.personalInfo.cin || ""} onChange={(e) => update("cin", e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">{t("resume.cinHint")}</p>
            </div>
          </>
        )}
      </div>

      {/* Professional summary - moved here from StepPreview */}
      <div className="space-y-3 rounded-lg border p-5">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">{t("preview.summary")}</Label>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={generatingSummary}
            onClick={handleGenerateSummary}
          >
            {generatingSummary ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            )}
            {generatingSummary ? t("preview.generatingAi") : t("preview.generateWithAi")}
          </Button>
        </div>
        <Textarea
          placeholder={t("preview.summaryPlaceholder")}
          value={data.summary}
          onChange={(e) => updateData({ summary: e.target.value })}
          rows={3}
          className="resize-none"
        />
        {!data.summary && (
          <p className="text-xs text-muted-foreground">
            💡 {t("preview.summaryHint")}
          </p>
        )}
      </div>

      {/* Country-specific warning */}
      {countryStd && countryStd.mustExclude.length > 0 && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Standard {countryStd.label} :</strong> Ne mentionnez pas {countryStd.mustExclude.map(e => {
              const labels: Record<string, string> = { photo: "de photo", age: "votre âge", maritalStatus: "votre situation familiale", nationality: "votre nationalité" };
              return labels[e] || e;
            }).join(", ")} sur votre CV.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepPersonalInfo;
