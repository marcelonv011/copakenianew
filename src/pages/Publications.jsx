import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPublications,
  createPublication,
  updatePublication,
  deletePublication,
} from "@/services/publicationService";

import { getClubs } from "@/services/clubService";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { createNotification } from "@/services/notificationService";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  Trash2,
  Loader2,
  ImagePlus,
  MessageCircle,
  Send,
  UserPen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Publications() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isClubResponsible =
    isAuthenticated && user?.role === "club_responsible";
  const canPost = isAdmin || isClubResponsible;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [displayName, setDisplayName] = useState(user?.full_name || "");
  const fileRef = useRef(null);

  const { data: publications, isLoading } = useQuery({
    queryKey: ["publications"],
    queryFn: getPublications,
    initialData: [],
  });

  const { data: clubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
    initialData: [],
  });

  const sendPublicationNotifications = async (publicationData) => {
    const usersSnapshot = await getDocs(collection(db, "users"));

    const users = usersSnapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    await Promise.all(
      users
        .filter((u) => u.id !== user?.id)
        .map((u) =>
          createNotification({
            user_id: u.id,
            type: "publicacion",
            title: "Nueva publicación en el muro",
            message: `${publicationData.user_name || "Alguien"} subió una foto al muro.`,
            publication_id: publicationData.id,
          }),
        ),
    );
  };
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const club = clubs.find((c) => c.id === user?.club_id);

      const payload = {
        ...data,
        club_id: user?.club_id || "",
        club_name: club?.name || "",
        club_logo_url: club?.logo_url || "",
        user_id: user?.id,
        user_name: user?.full_name || user?.email || "Usuario",
        likes_count: 0,
        liked_by: [],
      };

      const createdPublication = await createPublication(payload);

      await sendPublicationNotifications({
        ...payload,
        id: createdPublication.id,
      });

      return createdPublication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      setDialogOpen(false);
      setDescription("");
      setImageUrl("");
    },
  });
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const userRef = doc(db, "users", user.id);

      await updateDoc(userRef, {
        full_name: displayName,
      });

      return true;
    },
    onSuccess: () => {
      setProfileDialog(false);
      window.location.reload();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePublication(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["publications"] }),
  });

  const likeMutation = useMutation({
    mutationFn: async (pub) => {
      const likedBy = pub.liked_by || [];
      const alreadyLiked = likedBy.includes(user?.id);

      const newLikedBy = alreadyLiked
        ? likedBy.filter((id) => id !== user?.id)
        : [...likedBy, user?.id];

      await updatePublication(pub.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length,
      });

      if (!alreadyLiked && pub.user_id && pub.user_id !== user?.id) {
        await createNotification({
          user_id: pub.user_id,
          type: "like",
          title: "Le dieron MG a tu foto",
          message: `${user?.full_name || user?.email || "Alguien"} le dio MG a tu publicación.`,
          publication_id: pub.id,
        });
      }

      return true;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["publications"] }),
  });

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Seleccioná una imagen válida");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Faltan las variables de Cloudinary en el archivo .env");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "copa-kenia/publicaciones");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al subir imagen");
      }

      setImageUrl(data.secure_url);
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const canDelete = (pub) => {
    if (isAdmin) return true;
    if (isClubResponsible && pub.club_id === user?.club_id) return true;
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">
            MURO DE <span className="text-primary">CLUBES</span>
          </h1>
          {isClubResponsible && (
            <Button
              variant="outline"
              className="mt-4 border-primary/30 text-primary"
              onClick={() => {
                setDisplayName(user?.full_name || "");
                setProfileDialog(true);
              }}
            >
              <UserPen className="w-4 h-4 mr-2" />
              Cambiar nombre visible
            </Button>
          )}
          <p className="text-muted-foreground mt-1">
            Publicaciones de los clubes de la Copa Kenia
          </p>
        </div>
      </div>

      {/* New Post */}
      {canPost && (
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <button
            onClick={() => setDialogOpen(true)}
            className="w-full text-left text-muted-foreground text-sm p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <ImagePlus className="w-4 h-4 inline mr-2" />
            Compartir una publicación...
          </button>
        </div>
      )}

      {/* Publish dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Nueva Publicación
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate({ image_url: imageUrl, description });
            }}
            className="space-y-4"
          >
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Subir foto
                    </span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribe un comentario..."
              className="bg-background resize-none"
              rows={3}
            />
            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={createMutation.isPending || !imageUrl}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publicar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : publications.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-border">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay publicaciones aún</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {publications.map((pub) => {
              const isLiked =
                isAuthenticated && (pub.liked_by || []).includes(user?.id);
              return (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4">
                    {pub.club_logo_url ? (
                      <img
                        src={pub.club_logo_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                        {(pub.club_name || "C")[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {pub.user_name || "Usuario"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {pub.club_name ? `${pub.club_name} · ` : ""}
                        {pub.created_date
                          ? format(new Date(pub.created_date), "d MMM yyyy", {
                              locale: es,
                            })
                          : ""}
                      </p>
                    </div>
                    {canDelete(pub) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => deleteMutation.mutate(pub.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Image */}
                  {pub.image_url && (
                    <img
                      src={pub.image_url}
                      alt=""
                      className="w-full max-h-[500px] object-cover"
                    />
                  )}

                  {/* Actions & Description */}
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) return;
                          likeMutation.mutate(pub);
                        }}
                        disabled={!isAuthenticated}
                        className={`flex items-center gap-1.5 transition-colors ${
                          isLiked
                            ? "text-red-500"
                            : "text-muted-foreground hover:text-red-500"
                        } ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Heart
                          className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                        />
                        <span className="text-sm font-medium">
                          {pub.likes_count || 0}
                        </span>
                      </button>
                    </div>
                    {pub.description && (
                      <p className="text-sm">
                        <span className="font-medium">
                          {pub.user_name || "Usuario"}{" "}
                        </span>
                        {pub.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              Cambiar nombre visible
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nombre que aparecerá en el muro</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Boca"
                className="bg-background"
              />
            </div>

            <Button
              className="w-full bg-primary"
              disabled={updateProfileMutation.isPending || !displayName.trim()}
              onClick={() => updateProfileMutation.mutate()}
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Guardar nombre
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
