import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2, Trophy } from "lucide-react";
import { createMatch, updateMatch, deleteMatch } from "@/services/matchService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const PHASES = [
  { value: "cuartos", label: "Cuartos de Final" },
  { value: "semifinal", label: "Semifinal" },
  { value: "final", label: "Final" },
  { value: "3er_puesto", label: "3er Puesto" },
  { value: "octavos", label: "Octavos de Final" },
  { value: "5to_puesto", label: "5to Puesto" },
  { value: "7mo_puesto", label: "7mo Puesto" },
];

const PHASE_ORDER = [
  "octavos",
  "cuartos",
  "semifinal",
  "3er_puesto",
  "5to_puesto",
  "7mo_puesto",
  "final",
];

function MatchCard({ match, isAdmin, onEdit, onDelete }) {
  const isFinished = match.status === "finalizado";
  const homeWon = isFinished && match.home_score > match.away_score;
  const awayWon = isFinished && match.away_score > match.home_score;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/30 transition-all">
      {/* Phase badge */}
      <div className="bg-muted/40 px-3 py-1.5 flex items-center justify-between">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          {PHASES.find((p) => p.value === match.phase)?.label || match.phase}
        </span>
        <div className="flex items-center gap-1.5">
          {match.date && (
            <span className="text-xs text-muted-foreground">{match.date}</span>
          )}
          {match.time && (
            <span className="text-xs text-muted-foreground">{match.time}</span>
          )}
          {isFinished && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
              FINAL
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-4 space-y-2">
        {/* Home */}
        <div
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${homeWon ? "bg-primary/10" : "bg-background/40"}`}
        >
          {match.home_team_logo ? (
            <img
              src={match.home_team_logo}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {(match.home_team_name || "L")[0]}
            </div>
          )}
          <span
            className={`flex-1 text-sm font-medium truncate ${homeWon ? "text-primary font-bold" : ""}`}
          >
            {match.home_team_name || "Local"}
          </span>
          {isFinished && (
            <span
              className={`font-display text-xl font-bold tabular-nums ${homeWon ? "text-primary" : "text-muted-foreground"}`}
            >
              {match.home_score}
            </span>
          )}
        </div>

        {/* Away */}
        <div
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${awayWon ? "bg-primary/10" : "bg-background/40"}`}
        >
          {match.away_team_logo ? (
            <img
              src={match.away_team_logo}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {(match.away_team_name || "V")[0]}
            </div>
          )}
          <span
            className={`flex-1 text-sm font-medium truncate ${awayWon ? "text-primary font-bold" : ""}`}
          >
            {match.away_team_name || "Visitante"}
          </span>
          {isFinished && (
            <span
              className={`font-display text-xl font-bold tabular-nums ${awayWon ? "text-primary" : "text-muted-foreground"}`}
            >
              {match.away_score}
            </span>
          )}
        </div>

        {!isFinished && (
          <p className="text-xs text-muted-foreground text-center">
            {match.venue || "Sede por confirmar"}
          </p>
        )}
        {isFinished && match.venue && (
          <p className="text-xs text-muted-foreground text-center">
            {match.venue}
          </p>
        )}
      </div>

      {isAdmin && (
        <div className="border-t border-border flex">
          <button
            onClick={() => onEdit(match)}
            className="flex-1 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1"
          >
            <Edit className="w-3 h-3" /> Editar
          </button>
          <div className="w-px bg-border" />
          <button
            onClick={() => onDelete(match.id)}
            className="px-4 py-2 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlayoffsTab({
  tournamentId,
  matches,
  tournamentTeams,
  isAdmin,
}) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    home_team_id: "",
    away_team_id: "",
    phase: "cuartos",
    date: "",
    time: "",
    venue: "",
    status: "programado",
    home_score: "",
    away_score: "",
  });

  const teamsMap = Object.fromEntries(tournamentTeams.map((t) => [t.id, t]));

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const home = teamsMap[data.home_team_id];
      const away = teamsMap[data.away_team_id];
      const payload = {
        ...data,
        tournament_id: tournamentId,
        group_name: "",
        matchday: 0,
        home_team_name: home?.name || data.home_team_name || "",
        away_team_name: away?.name || data.away_team_name || "",
        home_team_logo: home?.logo_url || data.home_team_logo || "",
        away_team_logo: away?.logo_url || data.away_team_logo || "",
        home_score: data.home_score !== "" ? Number(data.home_score) : null,
        away_score: data.away_score !== "" ? Number(data.away_score) : null,
      };
      return editing ? updateMatch(editing.id, payload) : createMatch(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] });
      setDialog(false);
      setEditing(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (mid) => deleteMatch(mid),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] }),
  });

  const resetForm = () =>
    setForm({
      home_team_id: "",
      away_team_id: "",
      phase: "cuartos",
      date: "",
      time: "",
      venue: "",
      status: "programado",
      home_score: "",
      away_score: "",
    });

  const handleEdit = (m) => {
    setEditing(m);
    setForm({
      home_team_id: m.home_team_id || "",
      away_team_id: m.away_team_id || "",
      phase: m.phase || "cuartos",
      date: m.date || "",
      time: m.time || "",
      venue: m.venue || "",
      status: m.status || "programado",
      home_score: m.home_score ?? "",
      away_score: m.away_score ?? "",
    });
    setDialog(true);
  };

  // Group by phase
  const grouped = {};
  PHASE_ORDER.forEach((p) => {
    grouped[p] = [];
  });
  matches.forEach((m) => {
    if (grouped[m.phase]) grouped[m.phase].push(m);
    else grouped[m.phase] = [m];
  });
  const activePhases = PHASE_ORDER.filter((p) => grouped[p]?.length > 0);

  // Find overall winner (winner of final)
  const finalMatches = grouped["final"] || [];
  const winner = finalMatches.find((m) => m.status === "finalizado")
    ? finalMatches[0]?.home_score > finalMatches[0]?.away_score
      ? finalMatches[0]?.home_team_name
      : finalMatches[0]?.away_team_name
    : null;

  return (
    <div>
      {/* Winner banner */}
      {winner && (
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-900/10 p-4 mb-6 flex items-center justify-center gap-3 text-center">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <div>
            <p className="text-xs text-yellow-400/70 uppercase tracking-widest font-bold">
              Campeón
            </p>
            <p className="font-display text-2xl font-bold text-yellow-400">
              {winner}
            </p>
          </div>
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
      )}

      {isAdmin && (
        <div className="mb-6 flex justify-end">
          <Button
            className="bg-primary"
            onClick={() => {
              resetForm();
              setEditing(null);
              setDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo partido playoff
          </Button>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No hay partidos de playoffs aún
          </p>
          {isAdmin && (
            <Button
              className="mt-4 bg-primary"
              onClick={() => {
                resetForm();
                setEditing(null);
                setDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Agregar partido
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {activePhases.map((phase) => (
            <div key={phase}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border" />
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary px-2">
                  {PHASES.find((p) => p.value === phase)?.label || phase}
                </h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[phase].map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={(mid) => deleteMutation.mutate(mid)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog
        open={dialog}
        onOpenChange={(v) => {
          setDialog(v);
          if (!v) {
            setEditing(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar partido" : "Nuevo partido playoff"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Fase</Label>
              <Select
                value={form.phase}
                onValueChange={(v) => setForm({ ...form, phase: v })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Otra fase...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.phase === "custom" && (
              <div>
                <Label>Nombre de la fase</Label>
                <Input
                  value={form.customPhase || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      customPhase: e.target.value,
                      phase: e.target.value,
                    })
                  }
                  className="bg-background"
                  placeholder="Ej: 9no puesto"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Equipo Local</Label>
                <Select
                  value={form.home_team_id}
                  onValueChange={(v) => setForm({ ...form, home_team_id: v })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentTeams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Equipo Visitante</Label>
                <Select
                  value={form.away_team_id}
                  onValueChange={(v) => setForm({ ...form, away_team_id: v })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentTeams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div>
                <Label>Hora</Label>
                <Input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="18:00"
                  className="bg-background"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programado">Programado</SelectItem>
                    <SelectItem value="en_curso">En curso</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Puntos Local</Label>
                <Input
                  type="number"
                  value={form.home_score}
                  onChange={(e) =>
                    setForm({ ...form, home_score: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
              <div>
                <Label>Puntos Visitante</Label>
                <Input
                  type="number"
                  value={form.away_score}
                  onChange={(e) =>
                    setForm({ ...form, away_score: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
            </div>
            <div>
              <Label>Sede</Label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="bg-background"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              {editing ? "Guardar" : "Crear partido"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
