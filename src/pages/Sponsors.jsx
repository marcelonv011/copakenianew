import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from "@/services/sponsorService";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
  Globe,
  Star,
} from "lucide-react";
import ImageUpload from "@/components/shared/ImageUploadCloudinary";
import { motion } from "framer-motion";

const TIER_CONFIG = {
  principal: {
    label: "Principal",
    color: "bg-primary/20 text-primary border-primary/30",
    size: "lg",
  },
  oro: {
    label: "Oro",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    size: "md",
  },
  plata: {
    label: "Plata",
    color: "bg-slate-300/20 text-slate-300 border-slate-300/30",
    size: "md",
  },
  bronce: {
    label: "Bronce",
    color: "bg-amber-700/20 text-amber-600 border-amber-700/30",
    size: "sm",
  },
  colaborador: {
    label: "Colaborador",
    color: "bg-muted text-muted-foreground border-border",
    size: "sm",
  },
};

export default function Sponsors() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    logo_url: "",
    tier: "colaborador",
    instagram_url: "",
    whatsapp_url: "",
    website_url: "",
    description: "",
    active: true,
  });

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: getSponsors,
    initialData: [],
  });

  const activeSponsors = sponsors.filter((s) => s.active !== false);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing ? updateSponsor(editing.id, data) : createSponsor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSponsor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors"] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }) => updateSponsor(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors"] }),
  });

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      logo_url: "",
      tier: "colaborador",
      instagram_url: "",
      whatsapp_url: "",
      website_url: "",
      description: "",
      active: true,
    });
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      logo_url: s.logo_url || "",
      tier: s.tier || "colaborador",
      instagram_url: s.instagram_url || "",
      whatsapp_url: s.whatsapp_url || "",
      website_url: s.website_url || "",
      description: s.description || "",
      active: s.active !== false,
    });
    setDialogOpen(true);
  };

  const tierOrder = ["principal", "oro", "plata", "bronce", "colaborador"];
  const groupedSponsors = tierOrder
    .map((tier) => ({
      tier,
      config: TIER_CONFIG[tier],
      items: (isAdmin ? sponsors : activeSponsors).filter(
        (s) => (s.tier || "colaborador") === tier,
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold">
            NUESTROS <span className="text-primary">SPONSORS</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Gracias a quienes hacen posible la Copa Kenia
          </p>
        </div>
        {isAdmin && (
          <Button
            className="bg-primary"
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Sponsor
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : groupedSponsors.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-border">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay sponsors</p>
        </div>
      ) : (
        <div className="space-y-16">
          {groupedSponsors.map(({ tier, config, items }) => (
            <div key={tier}>
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="outline" className={config.color}>
                  {config.label}
                </Badge>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div
                className={`grid gap-6 ${
                  tier === "principal"
                    ? "sm:grid-cols-1 md:grid-cols-2"
                    : tier === "oro"
                      ? "sm:grid-cols-2 md:grid-cols-3"
                      : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {items.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-xl border bg-card overflow-hidden transition-all ${
                      tier === "principal"
                        ? "border-primary/40 glow-orange"
                        : "border-border hover:border-primary/20"
                    } ${s.active === false ? "opacity-50" : ""}`}
                  >
                    <div
                      className={`flex items-center justify-center ${tier === "principal" ? "p-10" : tier === "oro" ? "p-8" : "p-6"}`}
                    >
                      {s.logo_url ? (
                        <img
                          src={s.logo_url}
                          alt={s.name}
                          className={`object-contain ${tier === "principal" ? "max-h-32" : tier === "oro" ? "max-h-24" : "max-h-16"} max-w-full`}
                        />
                      ) : (
                        <span
                          className={`font-display font-bold text-primary ${tier === "principal" ? "text-3xl" : "text-xl"}`}
                        >
                          {s.name}
                        </span>
                      )}
                    </div>
                    <div className="px-5 pb-5">
                      <h3 className="font-display font-bold text-lg">
                        {s.name}
                      </h3>
                      {s.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {s.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        {s.website_url && (
                          <a
                            href={s.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        {s.instagram_url && (
                          <a
                            href={s.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors text-sm"
                          >
                            IG
                          </a>
                        )}
                        {s.whatsapp_url && (
                          <a
                            href={s.whatsapp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors text-sm"
                          >
                            WA
                          </a>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex-1"
                            onClick={() => handleEdit(s)}
                          >
                            <Edit className="w-3 h-3 mr-1" /> Editar
                          </Button>
                          <Switch
                            checked={s.active !== false}
                            onCheckedChange={(v) =>
                              toggleActive.mutate({ id: s.id, active: v })
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30 text-xs"
                            onClick={() => deleteMutation.mutate(s.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
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
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar Sponsor" : "Nuevo Sponsor"}
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
            <div>
              <Label>Categoría</Label>
              <Select
                value={form.tier}
                onValueChange={(v) => setForm({ ...form, tier: v })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="oro">Oro</SelectItem>
                  <SelectItem value="plata">Plata</SelectItem>
                  <SelectItem value="bronce">Bronce</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                </SelectContent>
              </Select>
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
            <div>
              <Label>Instagram</Label>
              <Input
                value={form.instagram_url}
                onChange={(e) =>
                  setForm({ ...form, instagram_url: e.target.value })
                }
                placeholder="https://instagram.com/..."
                className="bg-background"
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={form.whatsapp_url}
                onChange={(e) =>
                  setForm({ ...form, whatsapp_url: e.target.value })
                }
                placeholder="https://wa.me/..."
                className="bg-background"
              />
            </div>
            <div>
              <Label>Página Web</Label>
              <Input
                value={form.website_url}
                onChange={(e) =>
                  setForm({ ...form, website_url: e.target.value })
                }
                placeholder="https://..."
                className="bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label>Activo</Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editing ? "Guardar" : "Crear sponsor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
