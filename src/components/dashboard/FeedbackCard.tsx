import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquareHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackProductEvent } from "@/lib/product-events";

interface Props {
  userId: string;
}

export default function FeedbackCard({ userId }: Props) {
  const [score, setScore] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!score) {
      toast({ title: "Choisissez une note", description: "Donnez une note rapide avant l'envoi.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await (supabase as any).from("feedback_entries").insert({
      user_id: userId,
      category: "dashboard",
      score,
      message: message.trim() || null,
      page_path: "/dashboard",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer votre retour.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
    setMessage("");
    await trackProductEvent("feedback_submitted", {
      userId,
      data: { category: "dashboard", score },
    });
    toast({ title: "Merci", description: "Votre retour nous aide a prioriser les prochaines ameliorations." });
  };

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquareHeart className="h-4 w-4 text-primary" />
          Retour produit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Comment jugez-vous votre experience actuelle ?</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                type="button"
                variant={score === value ? "default" : "outline"}
                size="sm"
                className="h-9 w-9 px-0"
                onClick={() => setScore(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Qu'est-ce qui vous bloque ou vous manque ?</p>
          <Textarea
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ex: je veux finir mon CV plus vite, comprendre mon score ATS, ou publier mon site plus facilement."
          />
        </div>

        <Button onClick={handleSubmit} disabled={submitting || submitted} className="w-full">
          {submitted ? "Retour envoye" : submitting ? "Envoi..." : "Envoyer mon retour"}
        </Button>
      </CardContent>
    </Card>
  );
}
