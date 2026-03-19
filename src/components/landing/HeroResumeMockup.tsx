import { motion } from "framer-motion";

const HeroResumeMockup = () => {
  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      {/* Resume card */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateY: -5 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative rounded-xl border bg-card shadow-2xl shadow-primary/10 p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-lg font-bold text-primary">
            SA
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-4 w-32 rounded bg-foreground/80" />
            <div className="h-2.5 w-44 rounded bg-muted-foreground/30" />
            <div className="h-2.5 w-36 rounded bg-muted-foreground/20" />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded bg-muted-foreground/15" />
          <div className="h-2.5 w-11/12 rounded bg-muted-foreground/15" />
          <div className="h-2.5 w-9/12 rounded bg-muted-foreground/10" />
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-primary/40" />
          <div className="pl-2 border-l-2 border-primary/30 space-y-1">
            <div className="h-2.5 w-40 rounded bg-foreground/50" />
            <div className="h-2 w-28 rounded bg-accent/40" />
            <div className="h-2 w-full rounded bg-muted-foreground/12" />
            <div className="h-2 w-10/12 rounded bg-muted-foreground/12" />
          </div>
          <div className="pl-2 border-l-2 border-primary/20 space-y-1">
            <div className="h-2.5 w-36 rounded bg-foreground/50" />
            <div className="h-2 w-24 rounded bg-accent/40" />
            <div className="h-2 w-full rounded bg-muted-foreground/12" />
            <div className="h-2 w-8/12 rounded bg-muted-foreground/12" />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-primary/40" />
          <div className="flex flex-wrap gap-1.5">
            {["React", "Node.js", "Python", "SQL", "Git", "Docker"].map((s) => (
              <span
                key={s}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="space-y-1.5">
          <div className="h-3 w-20 rounded bg-primary/40" />
          <div className="h-2.5 w-36 rounded bg-foreground/50" />
          <div className="h-2 w-44 rounded bg-muted-foreground/15" />
        </div>
      </motion.div>

      {/* Floating ATS Score Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
        className="absolute -top-3 -right-3 z-10"
      >
        <div className="rounded-xl border bg-card/95 backdrop-blur-md shadow-lg px-4 py-3 flex items-center gap-2.5">
          <div className="relative h-10 w-10">
            <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-muted" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                strokeWidth="3"
                strokeDasharray="97.4"
                strokeDashoffset="7.8"
                strokeLinecap="round"
                className="stroke-primary"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">92</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">Score ATS</p>
            <p className="text-[10px] text-muted-foreground">Excellent</p>
          </div>
        </div>
      </motion.div>

      {/* Floating AI Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
        className="absolute -bottom-2 -left-4 z-10"
      >
        <div className="rounded-xl border bg-card/95 backdrop-blur-md shadow-lg px-3 py-2.5 flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <span className="text-sm">✨</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">IA Active</p>
            <p className="text-[10px] text-muted-foreground">Contenu optimisé</p>
          </div>
        </div>
      </motion.div>

      {/* Floating Compatible ATS badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="absolute top-1/2 -right-6 z-10"
      >
        <div className="rounded-lg bg-primary px-3 py-1.5 shadow-lg">
          <p className="text-[10px] font-semibold text-primary-foreground">✓ Compatible ATS</p>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroResumeMockup;
