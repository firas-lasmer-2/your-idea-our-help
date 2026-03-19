const companies = [
  "Tunisie Telecom", "BIAT", "Sofrecom", "Vermeg", "Telnet", "Actia", "STB", "Ooredoo",
  "Topnet", "STEG", "Poulina", "Amen Bank", "Attijari", "Orange Tunisie", "Monoprix",
];

export default function TrustedByMarquee() {
  return (
    <section className="border-t border-b bg-secondary/30 py-12 overflow-hidden">
      <div className="container mb-6">
        <p className="text-center text-sm text-muted-foreground">
          Nos utilisateurs travaillent dans ces entreprises
        </p>
      </div>
      <div className="flex animate-marquee-left">
        {[...companies, ...companies, ...companies].map((c, i) => (
          <div
            key={`${c}-${i}`}
            className="mx-8 shrink-0 text-lg font-semibold text-muted-foreground/40 hover:text-foreground transition-colors whitespace-nowrap"
          >
            {c}
          </div>
        ))}
      </div>
    </section>
  );
}
