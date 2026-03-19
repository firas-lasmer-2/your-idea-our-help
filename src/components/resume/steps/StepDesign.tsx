import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FolderOpen, Award, Globe, Heart, Palette, Settings, LayoutGrid } from "lucide-react";
import { ResumeData, ResumeCustomization, Project, Certification } from "@/types/resume";
import StepTemplate from "./StepTemplate";
import StepCustomization from "./StepCustomization";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
  template: string;
  setTemplate: (t: string) => void;
  customization: ResumeCustomization;
  updateCustomization: (updates: Partial<ResumeCustomization>) => void;
}

const LANGUAGE_LEVELS = ["Natif", "Courant", "Intermédiaire", "Débutant", "A1", "A2", "B1", "B2", "C1", "C2"];

const StepDesign = ({ data, updateData, template, setTemplate, customization, updateCustomization }: Props) => {
  const { t } = useTranslation();
  const sections = data.additionalSections || [];

  const toggle = (value: string) => {
    updateData({
      additionalSections: sections.includes(value)
        ? sections.filter((s) => s !== value)
        : [...sections, value],
    });
  };

  // Language helpers
  const addLanguage = () => {
    updateData({ languages: [...data.languages, { name: "", level: "" }] });
  };
  const updateLanguage = (index: number, field: "name" | "level", value: string) => {
    const updated = data.languages.map((l, i) => i === index ? { ...l, [field]: value } : l);
    updateData({ languages: updated });
  };
  const removeLanguage = (index: number) => {
    updateData({ languages: data.languages.filter((_, i) => i !== index) });
  };

  // Interest helpers
  const [interestInput, setInterestInput] = useState("");
  const addInterest = () => {
    if (!interestInput.trim()) return;
    updateData({ interests: [...data.interests, interestInput.trim()] });
    setInterestInput("");
  };
  const removeInterest = (index: number) => {
    updateData({ interests: data.interests.filter((_, i) => i !== index) });
  };

  // Project helpers
  const addProject = () => {
    const newProject: Project = { id: crypto.randomUUID(), name: "", description: "", url: "", technologies: [] };
    updateData({ projects: [...data.projects, newProject] });
  };
  const updateProject = (id: string, updates: Partial<Project>) => {
    updateData({ projects: data.projects.map((p) => p.id === id ? { ...p, ...updates } : p) });
  };
  const removeProject = (id: string) => {
    updateData({ projects: data.projects.filter((p) => p.id !== id) });
  };

  // Certification helpers
  const addCertification = () => {
    const newCert: Certification = { id: crypto.randomUUID(), name: "", issuer: "", date: "", url: "" };
    updateData({ certifications: [...data.certifications, newCert] });
  };
  const updateCertification = (id: string, updates: Partial<Certification>) => {
    updateData({ certifications: data.certifications.map((c) => c.id === id ? { ...c, ...updates } : c) });
  };
  const removeCertification = (id: string) => {
    updateData({ certifications: data.certifications.filter((c) => c.id !== id) });
  };

  const sectionDefs = [
    { value: "projects", label: t("design.projects", "Projets"), description: t("design.projectsDesc", "Projets personnels ou académiques"), icon: FolderOpen },
    { value: "certifications", label: t("design.certifications", "Certifications"), description: t("design.certificationsDesc", "Certifications et formations"), icon: Award },
    { value: "languages", label: t("design.languages", "Langues"), description: t("design.languagesDesc", "Langues parlées et niveaux"), icon: Globe },
    { value: "interests", label: t("design.interests", "Centres d'intérêt"), description: t("design.interestsDesc", "Loisirs et activités"), icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("design.title", "Design & Sections")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("design.subtitle", "Choisissez votre modèle, personnalisez le style, et activez les sections supplémentaires.")}
        </p>
      </div>

      <Tabs defaultValue="template">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("design.templateTab", "Modèle")}</span>
            <span className="sm:hidden">{t("design.templateTabShort", "Modèle")}</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("design.styleTab", "Style")}</span>
            <span className="sm:hidden">{t("design.styleTabShort", "Style")}</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("design.sectionsTab", "Sections")}</span>
            <span className="sm:hidden">{t("design.sectionsTabShort", "Sections")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-4">
          <StepTemplate data={data} template={template} setTemplate={setTemplate} />
        </TabsContent>

        <TabsContent value="style" className="mt-4">
          <StepCustomization customization={customization} updateCustomization={updateCustomization} />
        </TabsContent>

        <TabsContent value="sections" className="mt-4">
          <div className="space-y-4">
            {sectionDefs.map((section) => {
              const active = sections.includes(section.value);
              return (
                <div key={section.value}>
                  <Card className={`border transition-colors ${active ? "border-primary/30 bg-primary/5" : ""}`}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary/10" : "bg-muted"}`}>
                        <section.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-semibold cursor-pointer">{section.label}</Label>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                      <Switch checked={active} onCheckedChange={() => toggle(section.value)} />
                    </CardContent>
                  </Card>

                  {/* Inline editors when toggled on */}
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 ml-4 border-l-2 border-primary/20 pl-4 pb-2">
                          {section.value === "languages" && (
                            <div className="space-y-2">
                              {data.languages.map((lang, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                  <Input
                                    placeholder={t("design.languageName", "Langue")}
                                    value={lang.name}
                                    onChange={(e) => updateLanguage(i, "name", e.target.value)}
                                    className="flex-1"
                                  />
                                  <Select value={lang.level} onValueChange={(v) => updateLanguage(i, "level", v)}>
                                    <SelectTrigger className="w-36">
                                      <SelectValue placeholder={t("design.level", "Niveau")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {LANGUAGE_LEVELS.map((level) => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeLanguage(i)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={addLanguage}>
                                <Plus className="h-3 w-3" /> {t("design.addLanguage", "Ajouter une langue")}
                              </Button>
                            </div>
                          )}

                          {section.value === "interests" && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {data.interests.map((interest, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                                  >
                                    {interest}
                                    <button onClick={() => removeInterest(i)} className="ml-1 text-muted-foreground hover:text-destructive">
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder={t("design.interestPlaceholder", "Programmation, Lecture, Sport...")}
                                  value={interestInput}
                                  onChange={(e) => setInterestInput(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
                                  className="flex-1"
                                />
                                <Button variant="outline" size="sm" onClick={addInterest} disabled={!interestInput.trim()}>
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {section.value === "projects" && (
                            <div className="space-y-3">
                              {data.projects.map((project) => (
                                <Card key={project.id} className="border">
                                  <CardContent className="space-y-3 p-4">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-muted-foreground">{t("design.project", "Projet")}</span>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeProject(project.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div className="space-y-1">
                                        <Label className="text-xs">{t("design.projectName", "Nom du projet")}</Label>
                                        <Input placeholder="E-commerce App" value={project.name} onChange={(e) => updateProject(project.id, { name: e.target.value })} />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">{t("design.projectUrl", "URL")}</Label>
                                        <Input placeholder="https://..." value={project.url} onChange={(e) => updateProject(project.id, { url: e.target.value })} />
                                      </div>
                                      <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs">{t("design.projectDesc", "Description")}</Label>
                                        <Input placeholder={t("design.projectDescPlaceholder", "Décrivez brièvement le projet...")} value={project.description} onChange={(e) => updateProject(project.id, { description: e.target.value })} />
                                      </div>
                                      <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs">{t("design.projectTech", "Technologies")}</Label>
                                        <Input
                                          placeholder="React, Node.js, PostgreSQL"
                                          value={project.technologies.join(", ")}
                                          onChange={(e) => updateProject(project.id, { technologies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={addProject}>
                                <Plus className="h-3 w-3" /> {t("design.addProject", "Ajouter un projet")}
                              </Button>
                            </div>
                          )}

                          {section.value === "certifications" && (
                            <div className="space-y-3">
                              {data.certifications.map((cert) => (
                                <Card key={cert.id} className="border">
                                  <CardContent className="space-y-3 p-4">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-muted-foreground">{t("design.certification", "Certification")}</span>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeCertification(cert.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div className="space-y-1">
                                        <Label className="text-xs">{t("design.certName", "Nom")}</Label>
                                        <Input placeholder="AWS Solutions Architect" value={cert.name} onChange={(e) => updateCertification(cert.id, { name: e.target.value })} />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">{t("design.certIssuer", "Émetteur")}</Label>
                                        <Input placeholder="Amazon" value={cert.issuer} onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })} />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">{t("design.certDate", "Date")}</Label>
                                        <Input placeholder="2024" value={cert.date} onChange={(e) => updateCertification(cert.id, { date: e.target.value })} />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">{t("design.certUrl", "URL")}</Label>
                                        <Input placeholder="https://..." value={cert.url} onChange={(e) => updateCertification(cert.id, { url: e.target.value })} />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={addCertification}>
                                <Plus className="h-3 w-3" /> {t("design.addCertification", "Ajouter une certification")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StepDesign;
