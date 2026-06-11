import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn, LogOut, User, Trophy } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

const NAV_LINKS = [
  { label: "Inicio", path: "/" },
  { label: "Torneos", path: "/torneos" },
  { label: "Equipos", path: "/equipos" },
  { label: "Campeones", path: "/campeones" },
  { label: "Publicaciones", path: "/publicaciones" },
  { label: "Sponsors", path: "/sponsors" },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isAdmin = isAuthenticated && user?.role === "admin";
  const isActive = (path) => location.pathname === path;

  const userName = user?.full_name || "Usuario";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/35 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-[0_0_25px_rgba(255,120,0,.55)]">
              <Trophy className="w-5 h-5 text-white" />
            </div>

            <div className="leading-none">
              <div className="font-display text-xl md:text-2xl font-bold tracking-wider">
                <span className="text-white">COPA </span>
                <span className="text-primary">KENIA</span>
              </div>
              <p className="font-display text-[10px] md:text-xs tracking-[0.25em] text-white/55 uppercase">
                Comercial Eldorado
              </p>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? "text-white bg-primary/20 border border-primary/40 shadow-[0_0_20px_rgba(255,120,0,.3)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin/usuarios"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/admin/usuarios")
                    ? "text-white bg-primary/20 border border-primary/40 shadow-[0_0_20px_rgba(255,120,0,.3)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Usuarios
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && <NotificationBell />}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 border border-white/5 backdrop-blur-xl">
                  <User className="w-4 h-4 text-primary" />

                  <span className="text-sm text-white truncate max-w-[160px]">
                    {userName}
                  </span>

                  {user?.role === "admin" && (
                    <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded">
                      ADMIN
                    </span>
                  )}

                  {user?.role === "club_responsible" && (
                    <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded">
                      CLUB
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  className="text-white/50 hover:text-destructive hover:bg-white/5"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-white text-black hover:bg-white/90 rounded-xl font-bold">
                  <LogIn className="w-4 h-4 mr-2" />
                  Ingresar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 lg:hidden">
            {isAuthenticated && <NotificationBell />}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="bg-background/95 backdrop-blur-xl border-border w-72 p-0"
              >
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-[0_0_25px_rgba(255,120,0,.45)]">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>

                      <div className="leading-none">
                        <div className="font-display text-xl font-bold tracking-wider">
                          <span className="text-white">COPA </span>
                          <span className="text-primary">KENIA</span>
                        </div>
                        <p className="font-display text-[10px] tracking-[0.25em] text-white/50 uppercase">
                          Comercial Eldorado
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 space-y-1">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                          isActive(link.path)
                            ? "text-white bg-primary/20 border border-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}

                    {isAdmin && (
                      <Link
                        to="/admin/usuarios"
                        onClick={() => setOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                          isActive("/admin/usuarios")
                            ? "text-white bg-primary/20 border border-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        Usuarios
                      </Link>
                    )}
                  </div>

                  <div className="p-4 border-t border-border">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
                          <User className="w-4 h-4 text-primary" />

                          <span className="text-sm truncate">
                            {userName}
                          </span>

                          {user?.role === "admin" && (
                            <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            logout();
                            setOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Cerrar sesión
                        </Button>
                      </div>
                    ) : (
                      <Link to="/login" onClick={() => setOpen(false)}>
                        <Button className="w-full bg-primary hover:bg-primary/90 font-bold">
                          <LogIn className="w-4 h-4 mr-2" />
                          Ingresar
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}