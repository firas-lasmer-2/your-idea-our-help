import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FileText, Menu, X } from "lucide-react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

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
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a>
          <a href="#ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">IA</a>
          <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Modèles</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Avis</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/login">Se connecter</Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/signup">Commencer</Link>
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
                <a href="#features" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">Fonctionnalités</a>
                <a href="#ai" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">IA</a>
                <a href="#templates" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">Modèles</a>
                <a href="#testimonials" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">Avis</a>
                <a href="#pricing" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">Tarifs</a>
                <hr className="border-border" />
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/signup">Commencer gratuitement</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
