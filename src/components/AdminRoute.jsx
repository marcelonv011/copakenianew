import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function AdminRoute() {
  const { user, isAuthenticated, isLoadingAuth, authChecked, authError, logout } = useAuth();
  if (isLoadingAuth || !authChecked) return <main className='p-8 text-center' role='status'>Verificando acceso…</main>;
  if (!isAuthenticated || authError) return <Navigate to='/login' replace />;
  if (user?.role !== 'admin') return <main className='max-w-md mx-auto p-8 text-center space-y-4'>
    <h1 className='text-2xl font-bold'>Acceso exclusivo para administración</h1>
    <p>Para consultar horarios, resultados y posiciones, abrí el QR de tu cartelera.</p>
    <button onClick={logout} className='underline'>Cerrar sesión</button>
  </main>;
  return <Outlet />;
}
