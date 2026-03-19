import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Fun illustration */}
        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
          <span className="text-6xl">🔍</span>
        </div>

        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          Page introuvable
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Oups ! La page que vous cherchez n'existe pas ou a été déplacée. 
          Pas de panique, on vous ramène au bon endroit.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" /> Retour à l'accueil
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/dashboard">
              <FileText className="h-4 w-4" /> Mon tableau de bord
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
