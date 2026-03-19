import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function PricingToggle() {
  const [yearly, setYearly] = useState(false);
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricing.free"),
      monthlyPrice: 0,
      yearlyPrice: 0,
      period: t("pricing.forever"),
      features: [t("pricing.features.1cv"), t("pricing.features.3downloads"), t("pricing.features.1profile"), t("pricing.features.atsScore"), t("pricing.features.limitedAi")],
      cta: t("pricing.start"),
      popular: false,
    },
    {
      name: t("pricing.student"),
      monthlyPrice: 5,
      yearlyPrice: 3,
      period: t("pricing.perMonth"),
      features: [t("pricing.features.unlimitedCv"), t("pricing.features.unlimitedDownloads"), t("pricing.features.3profiles"), t("pricing.features.fullAi"), t("pricing.features.jobMatching"), t("pricing.features.customSubdomain")],
      cta: t("pricing.freeTrial"),
      popular: true,
    },
    {
      name: t("pricing.pro"),
      monthlyPrice: 15,
      yearlyPrice: 10,
      period: t("pricing.perMonth"),
      features: [t("pricing.features.allStudent"), t("pricing.features.customDomain"), t("pricing.features.noBadge"), t("pricing.features.prioritySupport"), t("pricing.features.analytics")],
      cta: t("pricing.start"),
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="border-t bg-secondary/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t("pricing.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("pricing.subtitle")}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Label htmlFor="billing" className={`text-sm ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>{t("pricing.monthly")}</Label>
            <Switch id="billing" checked={yearly} onCheckedChange={setYearly} />
            <Label htmlFor="billing" className={`text-sm ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
              {t("pricing.yearly")}
              <Badge variant="secondary" className="ms-2 text-xs text-primary">-33%</Badge>
            </Label>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={`relative h-full border ${plan.popular ? "border-primary shadow-lg ring-1 ring-primary/20" : ""}`}>
                  {plan.popular && (
                    <>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                        {t("pricing.popular")}
                      </div>
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    </>
                  )}
                  <CardContent className="relative p-6">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    {yearly && plan.monthlyPrice > 0 && (
                      <p className="mt-1 text-xs text-primary">
                        {t("pricing.save", { amount: (plan.monthlyPrice - plan.yearlyPrice) * 12 })}
                      </p>
                    )}
                    {plan.popular && plan.monthlyPrice > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                        <Sparkles className="h-3 w-3" />
                        {t("pricing.freeTrial")}
                      </div>
                    )}
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-8 w-full" variant={plan.popular ? "default" : "outline"} asChild>
                      <Link to="/signup">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
