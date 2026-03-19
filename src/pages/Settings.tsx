import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, ArrowLeft, User, Lock, Loader2, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const auth = supabase.auth as any;

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    auth.getSession().then(async ({ data: { session } }: any) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);

      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);

    const { error } = await (supabase as any)
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setProfileSaving(false);

    if (error) {
      toast({ title: t("common.error"), description: t("settings.updateError", "Impossible de mettre à jour le profil."), variant: "destructive" });
    } else {
      toast({ title: t("settings.profileUpdated", "Profil mis à jour ✅"), description: t("settings.changesSaved", "Vos modifications ont été enregistrées.") });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: t("settings.passwordTooShort", "Mot de passe trop court"), description: t("settings.minChars", "Le mot de passe doit contenir au moins 6 caractères."), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t("common.error"), description: t("settings.passwordMismatch", "Les mots de passe ne correspondent pas."), variant: "destructive" });
      return;
    }

    setPasswordSaving(true);
    const { error } = await auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("settings.passwordChanged", "Mot de passe modifié ✅"), description: t("settings.passwordSaved", "Votre nouveau mot de passe a été enregistré.") });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const isGoogleUser = user?.app_metadata?.provider === "google";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Resume</span>
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("settings.title", "Paramètres du compte")}</h1>
          <p className="mt-1 text-muted-foreground">{t("settings.subtitle", "Gérez votre profil et vos préférences.")}</p>
        </div>

        <Card className="border">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> {t("settings.profile", "Profil")}
                </CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("settings.fullName", "Nom complet")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("settings.fullNamePlaceholder", "Votre nom complet")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.email", "Email")}</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">{t("settings.emailCantChange", "L'adresse email ne peut pas être modifiée.")}</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={profileSaving} className="gap-2">
              {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {t("settings.save", "Enregistrer")}
            </Button>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> {t("settings.password", "Mot de passe")}
            </CardTitle>
            <CardDescription>
              {isGoogleUser
                ? t("settings.googlePassword", "Vous êtes connecté avec Google. Vous pouvez définir un mot de passe pour aussi vous connecter par email.")
                : t("settings.changePasswordDesc", "Modifiez votre mot de passe de connexion.")
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.newPassword", "Nouveau mot de passe")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("settings.atLeast6", "Au moins 6 caractères")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("settings.confirmPassword", "Confirmer le mot de passe")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("settings.repeatPassword", "Répétez le mot de passe")}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {t("settings.passwordMismatch")}
                </p>
              )}
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={passwordSaving || !newPassword || newPassword !== confirmPassword}
              variant="outline"
              className="gap-2"
            >
              {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {t("settings.changePassword", "Changer le mot de passe")}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">{t("settings.dangerZone", "Zone de danger")}</CardTitle>
            <CardDescription>{t("settings.dangerDesc", "Actions irréversibles sur votre compte.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                toast({
                  title: t("settings.comingSoon", "Fonctionnalité à venir"),
                  description: t("settings.deleteComingSoon", "La suppression de compte sera disponible prochainement."),
                });
              }}
            >
              {t("settings.deleteAccount", "Supprimer mon compte")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
