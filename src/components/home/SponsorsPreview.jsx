import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function SponsorsPreview({ sponsors }) {
  if (!sponsors || sponsors.length === 0) return null;

  const principal = sponsors.filter(s => s.tier === "principal");
  const others = sponsors.filter(s => s.tier !== "principal");

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-2">
          NUESTROS <span className="text-primary">SPONSORS</span>
        </h2>
        <p className="text-muted-foreground text-center mb-10">Gracias a quienes hacen posible la Copa Kenia</p>

        {/* Principal sponsors */}
        {principal.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {principal.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-primary/30 bg-card p-6 flex items-center justify-center glow-orange w-40 h-32"
              >
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="max-h-20 max-w-full object-contain" />
                ) : (
                  <span className="font-display text-lg font-bold text-primary">{s.name}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Others */}
        {others.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {others.slice(0, 8).map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-card/60 p-4 flex items-center justify-center w-28 h-20"
              >
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground font-medium">{s.name}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/sponsors">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              Ver todos los sponsors
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}