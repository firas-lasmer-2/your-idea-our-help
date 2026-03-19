import { motion } from "framer-motion";

const companies = [
  "Vermeg", "Sofrecom", "Telnet", "Linedata", "Wevioo", "Talan", "Sopra HR", "Focus Corp",
];

const SocialProof = () => {
  return (
    <div className="space-y-6">
      {/* Avatar stack + counter */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex -space-x-2">
          {["SA", "MK", "YT", "AG", "NB"].map((initials, i) => (
            <div
              key={initials}
              className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary"
              style={{ zIndex: 5 - i }}
            >
              {initials}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">5,200+</span> utilisateurs nous font confiance
        </p>
      </div>

      {/* Company logos */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Nos utilisateurs travaillent chez
        </p>
      </div>
      <div className="flex items-center justify-center gap-8 flex-wrap opacity-60">
        {companies.map((name) => (
          <span key={name} className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SocialProof;
