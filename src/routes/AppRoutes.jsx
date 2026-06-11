import { Routes, Route } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";

import Home from "@/pages/Home";
import Teams from "@/pages/Teams";
import Tournaments from "@/pages/Tournaments";
import TournamentDetail from "@/pages/TournamentDetail";
import Champions from "@/pages/Champions";
import Sponsors from "@/pages/Sponsors";
import Publications from "@/pages/Publications";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import PageNotFound from "@/lib/PageNotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Sitio */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/torneos" element={<Tournaments />} />
        <Route path="/torneos/:id" element={<TournamentDetail />} />
        <Route path="/equipos" element={<Teams />} />
        <Route path="/campeones" element={<Champions />} />
        <Route path="/publicaciones" element={<Publications />} />
        <Route path="/sponsors" element={<Sponsors />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}