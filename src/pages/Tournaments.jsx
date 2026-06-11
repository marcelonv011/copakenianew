import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
} from "@/services/tournamentService";
import { useAuth } from "@/lib/AuthContext";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  Users,
  Edit,
  Trash2,
  Loader2,
  Trophy,
} from "lucide-react";
import AdminOnly from "@/components/shared/AdminOnly";
import { motion } from "framer-motion";

const STATUS_MAP = {
  proximo: {
    label: "Próximo",
    class: "bg-secondary/20 text-secondary border-secondary/30",
  },
  activo: {
    label: "Activo",
    class: "bg-primary/20 text-primary border-primary/30",
  },
  finalizado: {
    label: "Finalizado",
    class: "bg-muted text-muted-foreground border-border",
  },
};

export default function Tournaments() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    status: "proximo",
    year: new Date().getFullYear(),
    description: "",
    start_date: "",
    end_date: "",
  });
  const [filter, setFilter] = useState("all");

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing ? updateTournament(editing.id, data) : createTournament(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTournament(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
  });

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      category: "",
      status: "proximo",
      year: new Date().getFullYear(),
      description: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      category: t.category || "",
      status: t.status || "proximo",
      year: t.year || new Date().getFullYear(),
      description: t.description || "",
      start_date: t.start_date || "",
      end_date: t.end_date || "",
    });
    setDialogOpen(true);
  };

  const filtered =
    filter === "all"
      ? tournaments
      : tournaments.filter((t) => t.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">
            <span className="text-foreground">TORNEOS</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Todos los torneos de la Copa Kenia
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="proximo">Próximos</SelectItem>
              <SelectItem value="finalizado">Finalizados</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Dialog
              open={dialogOpen}
              onOpenChange={(v) => {
                setDialogOpen(v);
                if (!v) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" /> Nuevo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {editing ? "Editar Torneo" : "Nuevo Torneo"}
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
                    <Label>Nombre</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Categoría</Label>
                      <Input
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        placeholder="U15, U17..."
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label>Año</Label>
                      <Input
                        type="number"
                        value={form.year}
                        onChange={(e) =>
                          setForm({ ...form, year: Number(e.target.value) })
                        }
                        className="bg-background"
                      />
                    </div>
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
                        <SelectItem value="proximo">Próximo</SelectItem>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="finalizado">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Inicio</Label>
                      <Input
                        type="date"
                        value={form.start_date}
                        onChange={(e) =>
                          setForm({ ...form, start_date: e.target.value })
                        }
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label>Fin</Label>
                      <Input
                        type="date"
                        value={form.end_date}
                        onChange={(e) =>
                          setForm({ ...form, end_date: e.target.value })
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {editing ? "Guardar cambios" : "Crear torneo"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-border">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay torneos disponibles</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/torneos/${t.id}`} className="block">
                <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={STATUS_MAP[t.status || "proximo"]?.class}
                    >
                      {STATUS_MAP[t.status || "proximo"]?.label}
                    </Badge>
                    {t.year && (
                      <span className="font-display text-2xl font-bold text-primary">
                        {t.year}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>
                  {t.category && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Categoría: {t.category}
                    </p>
                  )}
                  {t.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    {t.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {t.start_date}
                      </span>
                    )}
                    {t.team_ids?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {t.team_ids.length}{" "}
                        equipos
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              {isAdmin && (
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleEdit(t)}
                  >
                    <Edit className="w-3 h-3 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                    onClick={() => deleteMutation.mutate(t.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
