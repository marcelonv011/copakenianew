import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";

const STATS = [
  { icon: Users, value: "24+", label: "Equipos" },
  { icon: MapPin, value: "2", label: "Ciudades" },
  { icon: Calendar, value: "U15 · U17", label: "Categorías" },
  { icon: Trophy, value: "2026", label: "Edición" },
];

export default function HeroBanner() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Imagen desktop/mobile */}
      <picture className="absolute inset-0">
        <source
          media="(max-width: 768px)"
          srcSet="/images/hero-copa-kenia-mobile.png"
        />

        <img
          src="/images/hero-copa-kenia.png"
          alt="Copa Kenia"
          className="w-full h-full object-cover object-center"
        />
      </picture>

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/25 md:bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/25 via-transparent to-orange-950/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 md:pt-28 pb-12 md:pb-20">
        <div className="min-h-[58vh] md:min-h-[76vh] flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-black/25 md:bg-transparent md:border-0 backdrop-blur-sm md:backdrop-blur-none px-4 py-6 md:p-0">
            <p className="font-display text-[10px] md:text-sm tracking-[0.32em] md:tracking-[0.55em] uppercase text-white/75 mb-3 md:mb-5">
              Torneo Internacional de Básquet
            </p>

            <div className="text-center">
              <h1 className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider leading-none text-white drop-shadow-[0_0_45px_rgba(0,0,0,1)]">
                COPA KENIA
              </h1>

              <h2 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-[0.12em] text-primary mt-2 drop-shadow-[0_0_24px_rgba(255,120,0,.9)]">
                COMERCIAL ELDORADO
              </h2>
            </div>

            <p className="font-display text-3xl md:text-5xl font-bold text-primary mt-2 md:mt-3 drop-shadow-[0_0_24px_rgba(255,120,0,.9)]">
              2026
            </p>

            <p className="mt-4 md:mt-6 max-w-3xl text-sm sm:text-base md:text-xl text-white/90 px-2 drop-shadow-[0_2px_12px_rgba(0,0,0,.9)]">
              Dos ciudades. Una pasión. Viví la emoción del básquet
              internacional.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-7 md:mt-10 w-full max-w-md sm:max-w-none mx-auto justify-center px-2 sm:px-0">
              <Link to="/torneos" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 md:h-14 px-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(255,120,0,0.55)]">
                  Ver torneos
                </Button>
              </Link>

              <Link to="/publicaciones" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 md:h-14 px-10 rounded-xl border-white/25 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 font-bold"
                >
                  Publicaciones
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5 md:-mt-12 relative z-20">
          {STATS.map((item, index) => (
            <div
              key={index}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border border-white/10
                bg-black/55
                backdrop-blur-xl
                p-4 md:p-6
                text-center
                shadow-[0_0_40px_rgba(0,0,0,0.35)]
                hover:border-primary/60
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

              <div className="relative z-10">
                <item.icon className="w-5 h-5 md:w-7 md:h-7 mx-auto mb-2 md:mb-3 text-primary" />

                <p className="font-display text-3xl md:text-4xl font-bold text-white">
                  {item.value}
                </p>

                <p className="text-[10px] md:text-xs uppercase tracking-[0.18em] md:tracking-[0.25em] text-white/60 mt-1 md:mt-2">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
