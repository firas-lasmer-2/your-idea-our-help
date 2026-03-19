import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const toggle = () => {
    i18n.changeLanguage(isAr ? "fr" : "ar");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={`gap-1.5 text-xs font-medium ${className || ""}`}
      title={isAr ? "Passer en français" : "التبديل إلى العربية"}
    >
      <Languages className="h-4 w-4" />
      {isAr ? "FR" : "عربي"}
    </Button>
  );
}
