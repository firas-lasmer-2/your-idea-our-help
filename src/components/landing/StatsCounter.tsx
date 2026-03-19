import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface CounterProps {
  end: number;
  suffix?: string;
  label: string;
}

const AnimatedCounter = ({ end, suffix = "", label }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = Date.now();
          const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-bold text-foreground md:text-4xl">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

const StatsCounter = () => {
  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
      <AnimatedCounter end={5200} suffix="+" label="CV créés" />
      <AnimatedCounter end={92} suffix="%" label="Score ATS moyen" />
      <AnimatedCounter end={850} suffix="+" label="Sites web générés" />
      <AnimatedCounter end={4} suffix=".8★" label="Note utilisateurs" />
    </div>
  );
};

export default StatsCounter;
