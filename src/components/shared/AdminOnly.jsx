import { useAuth } from "@/lib/AuthContext";

export default function AdminOnly({ children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}