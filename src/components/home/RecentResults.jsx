import React from "react";
import { Trophy } from "lucide-react";

export default function RecentResults({ matches }) {
  if (!matches || matches.length === 0) return null;

  return (
    <section className="py-16 bg-card/30">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-2">
          ÚLTIMOS <span className="text-secondary">RESULTADOS</span>
        </h2>
        <p className="text-muted-foreground text-center mb-8">Resultados de los partidos recientes</p>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 6).map((match) => {
            const homeWon = (match.home_score || 0) > (match.away_score || 0);
            const awayWon = (match.away_score || 0) > (match.home_score || 0);
            return (
              <div
                key={match.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">
                    {match.phase || "Fase de Grupos"}
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    FINAL
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`flex items-center gap-2 ${homeWon ? "text-foreground" : "text-muted-foreground"}`}>
                      {match.home_team_logo && (
                        <img src={match.home_team_logo} alt="" className="w-8 h-8 rounded-full object-cover" />
                      )}
                      <span className="text-sm font-medium truncate">{match.home_team_name}</span>
                      {homeWon && <Trophy className="w-3 h-3 text-primary flex-shrink-0" />}
                    </div>
                  </div>
                  <div className="px-3 font-display text-xl font-bold">
                    <span className={homeWon ? "text-foreground" : "text-muted-foreground"}>
                      {match.home_score}
                    </span>
                    <span className="text-muted-foreground mx-1">-</span>
                    <span className={awayWon ? "text-foreground" : "text-muted-foreground"}>
                      {match.away_score}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`flex items-center gap-2 ${awayWon ? "text-foreground" : "text-muted-foreground"}`}>
                    {match.away_team_logo && (
                      <img src={match.away_team_logo} alt="" className="w-8 h-8 rounded-full object-cover" />
                    )}
                    <span className="text-sm font-medium truncate">{match.away_team_name}</span>
                    {awayWon && <Trophy className="w-3 h-3 text-primary flex-shrink-0" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}