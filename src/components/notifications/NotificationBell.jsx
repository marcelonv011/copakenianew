import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_LABELS = {
  resultado: { emoji: "⚽", label: "Resultado", color: "text-green-400" },
  horario: { emoji: "📅", label: "Horario", color: "text-blue-400" },
  general: { emoji: "🔔", label: "Aviso", color: "text-primary" },
};

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const panelRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Más adelante acá cargaremos desde Firebase
    setNotifications([]);
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener(
        "mousedown",
        handler
      );
    };
  }, []);

  const unread = notifications.filter(
    (n) => !n.read
  ).length;

  const markAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      }))
    );
  };

  const markRead = async (notification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id
          ? { ...n, read: true }
          : n
      )
    );
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          setOpen((v) => !v);

          if (!open && unread > 0) {
            markAllRead();
          }
        }}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5" />

        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.97,
            }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="font-display text-sm font-bold tracking-wide">
                Notificaciones
              </span>

              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Marcar todo leído
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Sin notificaciones
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const typeInfo =
                    TYPE_LABELS[n.type] ||
                    TYPE_LABELS.general;

                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n)}
                      className={`px-4 py-3 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/30 ${
                        !n.read
                          ? "bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg mt-0.5">
                          {typeInfo.emoji}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {n.title}
                            </p>

                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}