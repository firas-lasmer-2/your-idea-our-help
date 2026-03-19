import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function FooterFull() {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Merci ! Vous recevrez nos actualités.");
      setEmail("");
    }
  };

  return (
    <footer className="border-t bg-card py-16">
      <div className="container">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Resume</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              La plateforme #1 en Tunisie pour créer des CV professionnels et des profils publics orientés recrutement avec l'aide de l'IA.
            </p>
            <form onSubmit={handleNewsletter} className="mt-6 flex gap-2 max-w-xs">
              <Input
                placeholder="Votre email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
              />
              <Button type="submit" size="sm">OK</Button>
            </form>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Produit</h4>
            <ul className="space-y-3">
              {["Créer un CV", "Créer un profil public", "Score ATS", "Templates"].map((item) => (
                <li key={item}>
                  <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Ressources</h4>
            <ul className="space-y-3">
              {["Guide CV", "Blog", "FAQ", "Tarifs"].map((item) => (
                <li key={item}>
                  <a href={item === "FAQ" ? "#faq" : item === "Tarifs" ? "#pricing" : "#"} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Entreprise</h4>
            <ul className="space-y-3">
              {["À propos", "Contact", "Confidentialité", "Conditions"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 Resume. Fait avec ❤️ en Tunisie.</p>
          <div className="flex gap-4">
            {["Facebook", "Instagram", "LinkedIn"].map((s) => (
              <a key={s} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
