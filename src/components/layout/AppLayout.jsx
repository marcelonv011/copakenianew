import React from "react";
import { Outlet } from "react-router-dom";
import { Instagram, Phone, Trophy, Code2 } from "lucide-react";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}