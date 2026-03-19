import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Globe, Upload, Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  displayName: string;
  onCreateCv: () => void;
  onImportCv: () => void;
  onCreateProfile: () => void;
}

export default function WelcomeHero({ displayName, onCreateCv, onImportCv, onCreateProfile }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 md:p-10">
        <div className="mx-auto max-w-2xl text-center">
          {/* Greeting */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {t("dashboard.welcomeNewUser", "Bienvenue, {{name}} ! 🎉", { name: displayName })}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground leading-relaxed">
            {t("dashboard.welcomeNewUserDesc", "Construisez votre premier CV professionnel en quelques minutes. Notre IA vous accompagne à chaque étape.")}
          </p>

          {/* Two main paths */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {/* Create from scratch */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateCv}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-primary/20 bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("dashboard.createFromScratch", "Créer un CV de zéro")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("dashboard.createFromScratchDesc", "L'assistant intelligent vous guide étape par étape")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                {t("dashboard.startNow", "Commencer")} <ArrowRight className="h-3 w-3" />
              </span>
            </motion.button>

            {/* Import existing */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onImportCv}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-secondary/80">
                <Upload className="h-7 w-7 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("dashboard.importExisting", "Importer un PDF existant")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("dashboard.importExistingDesc", "L'IA extrait vos infos et améliore votre CV")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary">
                {t("dashboard.importNow", "Importer")} <ArrowRight className="h-3 w-3" />
              </span>
            </motion.button>
          </div>

          {/* Secondary: create public profile */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span>{t("dashboard.orCreateProfile", "Ou commencez par")}</span>
            <button
              onClick={onCreateProfile}
              className="font-semibold text-primary hover:underline"
            >
              {t("dashboard.aPublicProfile", "un profil public")}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
