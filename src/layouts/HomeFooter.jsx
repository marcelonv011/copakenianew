import React from "react";
import { Code2, Phone, Trophy } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-black">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 via-transparent to-orange-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,121,21,0.08),transparent_55%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3 items-center">

          {/* Marca */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>

              <div>
                <div className="font-display text-2xl font-bold tracking-wider">
                  <span className="text-white">COPA </span>
                  <span className="text-primary">KENIA</span>
                </div>

                <p className="font-display text-[10px] tracking-[0.28em] text-white/50 uppercase">
                  Comercial Eldorado
                </p>
              </div>
            </div>
          </div>

          {/* Centro */}
          <div className="text-center">
            <p className="text-white/70 text-sm">
              Torneo Internacional de Básquet
            </p>

            <p className="mt-2 text-sm text-white/50">
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
          </div>

          {/* Autor */}
          <div className="text-center md:text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <Code2 className="w-4 h-4 text-primary" />
              <span>
                Desarrollado por{" "}
                <span className="font-semibold text-white">
                  Marcelo Nicolás Villalba
                </span>
              </span>
            </div>

            <div className="mt-4 flex justify-center md:justify-end">
              <a
                href="https://wa.me/5493757324376"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:text-primary hover:border-primary/40 transition-all"
              >
                <Phone className="w-4 h-4" />
                +54 9 3757 324376
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}