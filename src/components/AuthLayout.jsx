import React from "react";

export default function AuthLayout({
  icon: Icon,
  title,
  subtitle,
  footer,
  children,
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4">

      {/* Glow fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,120,0,0.15),transparent_45%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">

          <div
            className="
              inline-flex
              items-center
              justify-center
              w-16
              h-16
              rounded-2xl
              bg-primary
              shadow-[0_0_30px_rgba(255,120,0,0.45)]
              mb-5
            "
          >
            <Icon
              className="w-8 h-8 text-primary-foreground"
              aria-hidden="true"
            />
          </div>

          <h1 className="font-display text-4xl font-bold tracking-wide text-white">
            {title}
          </h1>

          {subtitle && (
            <p className="text-white/60 mt-3">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="
            bg-card/80
            backdrop-blur-xl
            border
            border-white/10
            rounded-3xl
            p-8
            shadow-[0_0_40px_rgba(0,0,0,0.35)]
          "
        >
          {children}
        </div>

        {footer && (
          <div className="text-center text-sm text-white/50 mt-6">
            {footer}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="font-display text-lg font-bold tracking-wider">
            <span className="text-white">COPA </span>
            <span className="text-primary">KENIA</span>
          </p>

          <p className="text-xs text-white/40 mt-1">
            Comercial Eldorado 2026
          </p>
        </div>
      </div>
    </div>
  );
}