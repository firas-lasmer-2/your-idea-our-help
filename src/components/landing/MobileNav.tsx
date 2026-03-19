import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FileText, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Resume</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.features")}</a>
          <a href="#ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.ai")}</a>
          <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.templates")}</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.testimonials")}</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.pricing")}</a>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/login">{t("nav.login")}</Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/signup">{t("nav.start")}</Link>
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background">
              <div className="mt-8 flex flex-col gap-4">
                <a href="#features" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">{t("nav.features")}</a>
                <a href="#ai" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">{t("nav.ai")}</a>
                <a href="#templates" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">{t("nav.templates")}</a>
                <a href="#testimonials" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">{t("nav.testimonials")}</a>
                <a href="#pricing" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">{t("nav.pricing")}</a>
                <hr className="border-border" />
                <LanguageSwitcher />
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/signup">{t("nav.startFree")}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
