import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResumeData, TUNISIAN_CITIES } from "@/types/resume";
import { Mail, Phone, MapPin, Linkedin, Github, User, Upload, Loader2, Briefcase, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCountryStandard, type TargetCountry } from "@/lib/country-standards";

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
}

const StepPersonalInfo = ({ data, updateData }: Props) => {
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const experienceOptions = [
    { value: "none", label: "Pas d'expérience" },
    { value: "1-3", label: "1 à 3 ans" },
    { value: "3-10", label: "3 à 10 ans" },
    { value: "10+", label: "Plus de 10 ans" },
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
      toast({ title: "Erreur", description: "Veuillez sélectionner un fichier PDF.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erreur", description: "Le fichier est trop volumineux (max 5 Mo).", variant: "destructive" });
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
        toast({ title: "Erreur", description: result?.error || "Erreur d'importation.", variant: "destructive" });
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
        toast({ title: "CV importé !", description: "Vos informations ont été pré-remplies." });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible d'importer le CV.", variant: "destructive" });
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {data.simplifiedMode ? "Vos coordonnées" : "Informations personnelles"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {data.simplifiedMode
              ? "Remplissez vos coordonnées pour que les employeurs puissent vous contacter."
              : "Ces informations apparaîtront en haut de votre CV."}
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
            {importing ? "Importation..." : "Importer un CV (PDF)"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="jobTitle">Poste ciblé *</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="jobTitle"
              placeholder="Développeur web, Comptable, Infirmier..."
              className="pl-10"
              value={data.jobTitle}
              onChange={(e) => updateData({ jobTitle: e.target.value, jobTarget: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Définissez le rôle que vous visez pour guider l'IA et débloquer l'export final.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Niveau d'expérience</Label>
          <Select
            value={data.experienceLevel || undefined}
            onValueChange={(value) => updateData({ experienceLevel: value })}
          >
            <SelectTrigger id="experienceLevel">
              <SelectValue placeholder="Sélectionner un niveau" />
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
          <Label htmlFor="firstName">Prénom *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="firstName" placeholder="Ahmed" className="pl-10" value={data.personalInfo.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input id="lastName" placeholder="Ben Ali" value={data.personalInfo.lastName} onChange={(e) => update("lastName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="ahmed@email.com" className="pl-10" value={data.personalInfo.email} onChange={(e) => update("email", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="phone" placeholder="+216 XX XXX XXX" className="pl-10" value={data.personalInfo.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Select value={data.personalInfo.city} onValueChange={(v) => update("city", v)}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Sélectionner une ville" />
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
            <Label htmlFor="linkedin">LinkedIn</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="linkedin" placeholder="linkedin.com/in/ahmed" className="pl-10" value={data.personalInfo.linkedIn} onChange={(e) => update("linkedIn", e.target.value)} />
            </div>
          </div>
        )}
        {!hideGithub && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="github">GitHub</Label>
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
              <Label htmlFor="militaryService">Service militaire</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Select value={data.personalInfo.militaryService || ""} onValueChange={(v) => update("militaryService", v)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Sélectionner le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="effectue">Effectué</SelectItem>
                    <SelectItem value="exempte">Exempté</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="non_applicable">Non applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cin">CIN (optionnel)</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="cin" placeholder="08XXXXXX" className="pl-10" value={data.personalInfo.cin || ""} onChange={(e) => update("cin", e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">
                Certains employeurs tunisiens demandent le numéro CIN.
              </p>
            </div>
          </>
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
