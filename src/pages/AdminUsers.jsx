import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";

import { getUsers, updateUser } from "@/services/userService";
import { getTeams } from "@/services/teamService";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, UserCog } from "lucide-react";

export default function AdminUsers() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isAdmin,
  });

  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    enabled: isAdmin,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="rounded-2xl border border-border bg-card p-8">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold">
            Acceso restringido
          </h1>
          <p className="text-muted-foreground mt-2">
            Solo administradores pueden gestionar usuarios.
          </p>
        </div>
      </div>
    );
  }

  if (loadingUsers || loadingTeams) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">
          GESTIÓN DE <span className="text-primary">USUARIOS</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Asigná qué equipo representa cada usuario.
        </p>
      </div>

      <div className="space-y-4">
        {users.map((u) => {
          const assignedTeam = teams.find((t) => t.id === u.team_id);

          return (
            <div
              key={u.id}
              className="rounded-2xl border border-border bg-card p-4 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <UserCog className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {assignedTeam?.name || u.full_name || "Sin nombre"}
                </p>

                <p className="text-sm text-muted-foreground truncate">
                  {u.email}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{u.role || "user"}</Badge>

                  {assignedTeam && (
                    <Badge className="bg-primary">
                      {assignedTeam.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-[420px]">
                <Select
                  value={u.role || "user"}
                  onValueChange={(role) =>
                    updateUserMutation.mutate({
                      userId: u.id,
                      data: {
                        role,
                        team_id:
                          role === "club_responsible" ? u.team_id || "" : "",
                      },
                    })
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="club_responsible">
                      Responsable de equipo
                    </SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={u.team_id || "none"}
                  disabled={u.role !== "club_responsible"}
                  onValueChange={(teamId) =>
                    updateUserMutation.mutate({
                      userId: u.id,
                      data: {
                        role: "club_responsible",
                        team_id: teamId === "none" ? "" : teamId,
                      },
                    })
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin equipo</SelectItem>

                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                        {team.category ? ` · ${team.category}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}