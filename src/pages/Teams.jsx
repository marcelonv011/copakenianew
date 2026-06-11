import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/services/teamService";
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
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react";
import ImageUpload from "@/components/shared/ImageUploadCloudinary";
import { motion } from "framer-motion";

export default function Teams() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    logo_url: "",
    category: "",
    club_name: "",
    city: "",
    country: "",
  });
  const [search, setSearch] = useState("");

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing ? updateTeam(editing.id, data) : createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTeam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      logo_url: "",
      category: "",
      club_name: "",
      city: "",
      country: "",
    });
  };

  const handleEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      logo_url: t.logo_url || "",
      category: t.category || "",
      club_name: t.club_name || "",
      city: t.city || "",
      country: t.country || "",
    });
    setDialogOpen(true);
  };

  const filtered = teams.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.club_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">EQUIPOS</h1>
          <p className="text-muted-foreground mt-1">
            Equipos participantes de la Copa Kenia
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 bg-card border-border"
          />
          {isAdmin && (
            <Button
              className="bg-primary"
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No se encontraron equipos</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-6 text-center group hover:border-primary/30 transition-all"
            >
              {t.logo_url ? (
                <img
                  src={t.logo_url}
                  alt={t.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover mb-4 border-2 border-border group-hover:border-primary/40 transition-colors"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center font-display text-2xl font-bold text-primary">
                  {t.name[0]}
                </div>
              )}
              <h3 className="font-display text-lg font-bold">{t.name}</h3>
              {t.category && (
                <p className="text-xs text-primary mt-1">{t.category}</p>
              )}
              {t.club_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t.club_name}
                </p>
              )}
              {(t.city || t.country) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {[t.city, t.country].filter(Boolean).join(", ")}
                </p>
              )}
              {isAdmin && (
                <div className="flex gap-2 mt-4 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleEdit(t)}
                  >
                    <Edit className="w-3 h-3 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 text-xs"
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar Equipo" : "Nuevo Equipo"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <ImageUpload
              value={form.logo_url}
              onChange={(url) => setForm({ ...form, logo_url: url })}
            />
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  className="bg-background"
                />
              </div>
              <div>
                <Label>Club</Label>
                <Input
                  value={form.club_name}
                  onChange={(e) =>
                    setForm({ ...form, club_name: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ciudad</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div>
                <Label>País</Label>
                <Input
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editing ? "Guardar" : "Crear equipo"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
