import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function UpcomingMatches({ matches }) {
  if (!matches || matches.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-2">
            PRÓXIMOS <span className="text-primary">PARTIDOS</span>
          </h2>
          <p className="text-muted-foreground text-center mb-8">Próximamente se anunciarán los partidos</p>
          <div className="text-center py-12 rounded-xl border border-dashed border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay partidos programados aún</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-2">
          PRÓXIMOS <span className="text-primary">PARTIDOS</span>
        </h2>
        <p className="text-muted-foreground text-center mb-8">No te pierdas ningún encuentro</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 6).map((match) => (
            <div
              key={match.id}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-primary font-medium uppercase tracking-wider">
                  {match.phase || "Fase de Grupos"}
                </span>
                {match.date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(match.date), "d MMM", { locale: es })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  {match.home_team_logo && (
                    <img src={match.home_team_logo} alt="" className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" />
                  )}
                  <p className="text-sm font-medium truncate">{match.home_team_name || "Local"}</p>
                </div>
                <div className="px-4">
                  <span className="text-xs text-muted-foreground font-display tracking-wider">VS</span>
                </div>
                <div className="flex-1 text-center">
                  {match.away_team_logo && (
                    <img src={match.away_team_logo} alt="" className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" />
                  )}
                  <p className="text-sm font-medium truncate">{match.away_team_name || "Visitante"}</p>
                </div>
              </div>
              {(match.time || match.venue) && (
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  {match.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {match.time}
                    </span>
                  )}
                  {match.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {match.venue}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}