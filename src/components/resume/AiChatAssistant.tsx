import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Loader2, Sparkles, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/types/resume";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  data: ResumeData;
  currentStep: number;
  template: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-chat`;

const AiChatAssistant = ({ data, currentStep, template }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const QUICK_PROMPTS = [
    { label: t("aiChat.improveSummary", "Améliorer mon résumé"), prompt: t("aiChat.improveSummaryPrompt", "Comment puis-je améliorer mon résumé professionnel ?") },
    { label: t("aiChat.atsTips", "Conseils ATS"), prompt: t("aiChat.atsTipsPrompt", "Quels sont les meilleurs conseils pour passer les filtres ATS avec mon profil ?") },
    { label: t("aiChat.bulletPoints", "Bullet points"), prompt: t("aiChat.bulletPointsPrompt", "Comment rédiger des bullet points percutants pour mes expériences ?") },
    { label: t("aiChat.adaptCountry", "Adapter au pays"), prompt: t("aiChat.adaptCountryPrompt", "Comment adapter mon CV au pays cible ?") },
  ];

  const stepLabels: Record<number, string> = {
    1: t("steps.personalInfo"),
    2: t("steps.experience"),
    3: t("steps.education"),
    4: t("steps.skills"),
    5: t("steps.design"),
    9: t("steps.preview"),
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = useCallback(() => ({
    fullName: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim(),
    jobTitle: data.jobTitle || data.jobTarget,
    targetCountry: data.targetCountry,
    jobField: data.jobField,
    experienceLevel: data.experienceLevel,
    currentStep: stepLabels[currentStep] || `${t("aiChat.step", "Étape")} ${currentStep}`,
    experienceCount: data.experience.length,
    educationCount: data.education.length,
    skills: data.skillCategories
      .filter((c) => c.skills.length > 0)
      .map((c) => `${c.name}: ${c.skills.join(", ")}`)
      .join("; ") || t("aiChat.none", "Aucune"),
    summary: data.summary || "",
    template,
  }), [data, currentStep, template, t]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          resumeContext: buildContext(),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        const errMsg = errData?.error || (resp.status === 429 ? t("aiChat.tooManyRequests", "Trop de requêtes, réessayez.") : resp.status === 402 ? t("aiChat.creditsExhausted", "Crédits IA épuisés.") : t("aiChat.aiServiceError", "Erreur du service IA."));
        updateAssistant(`⚠️ ${errMsg}`);
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        updateAssistant(`⚠️ ${t("aiChat.connectionError", "Erreur de connexion.")}`);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch {
      updateAssistant(`⚠️ ${t("aiChat.connectionError", "Erreur de connexion. Vérifiez votre connexion internet.")}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button onClick={() => setOpen(true)} className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow" size="icon">
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border bg-card shadow-2xl"
            style={{ height: "min(560px, calc(100vh - 6rem))" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("aiChat.title", "Assistant CV")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("aiChat.subtitle", "Aide contextuelle IA")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <Minimize2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setOpen(false); setMessages([]); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-primary/5 p-3">
                    <p className="text-xs font-medium text-foreground">👋 {t("aiChat.greeting", "Comment puis-je vous aider ?")}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t("aiChat.greetingDesc", "Je connais votre CV en cours. Posez-moi des questions sur la rédaction, les compétences, l'ATS, ou demandez-moi d'écrire du contenu.")}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_PROMPTS.map((qp) => (
                      <button
                        key={qp.label}
                        onClick={() => sendMessage(qp.prompt)}
                        className="rounded-lg border bg-background px-2.5 py-2 text-left text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user" ? "ms-auto bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-foreground [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("aiChat.thinking", "Réflexion...")}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("aiChat.placeholder", "Posez une question...")}
                  className="min-h-[40px] max-h-[100px] resize-none text-sm"
                  rows={1}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChatAssistant;
