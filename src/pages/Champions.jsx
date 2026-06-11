import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChampions,
  createChampion,
  updateChampion,
  deleteChampion,
} from "@/services/championService";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2, Trophy, Crown } from "lucide-react";
import ImageUpload from "@/components/shared/ImageUploadCloudinary";
import { motion } from "framer-motion";

export default function Champions() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    year: "",
    category: "",
    team_name: "",
    team_logo_url: "",
    photo_url: "",
    runner_up: "",
    final_score: "",
  });

  const { data: champions, isLoading } = useQuery({
    queryKey: ["champions"],
    queryFn: getChampions,
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing ? updateChampion(editing.id, data) : createChampion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["champions"] });
      setDialogOpen(false);
      setEditing(null);
      setForm({
        year: "",
        category: "",
        team_name: "",
        team_logo_url: "",
        photo_url: "",
        runner_up: "",
        final_score: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteChampion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["champions"] }),
  });

  const handleEdit = (c) => {
    setEditing(c);
    setForm({
      year: c.year || "",
      category: c.category || "",
      team_name: c.team_name || "",
      team_logo_url: c.team_logo_url || "",
      photo_url: c.photo_url || "",
      runner_up: c.runner_up || "",
      final_score: c.final_score || "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">
            <span className="text-foreground">CAMPEONES</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Historial de campeones de la Copa Kenia
          </p>
        </div>
        {isAdmin && (
          <Button
            className="bg-primary"
            onClick={() => {
              setEditing(null);
              setForm({
                year: "",
                category: "",
                team_name: "",
                team_logo_url: "",
                photo_url: "",
                runner_up: "",
                final_score: "",
              });
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Agregar campeón
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : champions.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-border">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay campeones registrados</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {champions.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/40 transition-all"
            >
              {c.photo_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={c.photo_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-3xl font-bold text-primary">
                    {c.year}
                  </span>
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                {c.category && (
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-2">
                    {c.category}
                  </p>
                )}
                <div className="flex items-center gap-3 mb-3">
                  {c.team_logo_url ? (
                    <img
                      src={c.team_logo_url}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      {c.team_name}
                    </h3>
                    <p className="text-xs text-primary font-medium">
                      🏆 CAMPEÓN
                    </p>
                  </div>
                </div>
                {c.runner_up && (
                  <p className="text-sm text-muted-foreground">
                    Subcampeón: {c.runner_up}
                  </p>
                )}
                {c.final_score && (
                  <p className="text-sm text-muted-foreground">
                    Final: {c.final_score}
                  </p>
                )}
                {isAdmin && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleEdit(c)}
                    >
                      <Edit className="w-3 h-3 mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 text-xs"
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar Campeón" : "Agregar Campeón"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Año / Edición</Label>
                <Input
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
            </div>
            <div>
              <Label>Equipo Campeón</Label>
              <Input
                value={form.team_name}
                onChange={(e) =>
                  setForm({ ...form, team_name: e.target.value })
                }
                required
                className="bg-background"
              />
            </div>
            <div>
              <Label>Logo del Equipo</Label>
              <ImageUpload
                value={form.team_logo_url}
                onChange={(url) => setForm({ ...form, team_logo_url: url })}
              />
            </div>
            <div>
              <Label>Foto (opcional)</Label>
              <ImageUpload
                value={form.photo_url}
                onChange={(url) => setForm({ ...form, photo_url: url })}
              />
            </div>
            <div>
              <Label>Subcampeón (opcional)</Label>
              <Input
                value={form.runner_up}
                onChange={(e) =>
                  setForm({ ...form, runner_up: e.target.value })
                }
                className="bg-background"
              />
            </div>
            <div>
              <Label>Resultado final (opcional)</Label>
              <Input
                value={form.final_score}
                onChange={(e) =>
                  setForm({ ...form, final_score: e.target.value })
                }
                placeholder="85 - 72"
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
              {editing ? "Guardar" : "Agregar campeón"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
