import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector } from '@/store';
import { selectIsAuthenticated, selectUserRole, selectIsInitialized } from '@/store/authSlice';
import type { UserRole } from '@/types/user';

// Lazy imports
const Home = React.lazy(() => import('@/pages/Home'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const Listings = React.lazy(() => import('@/pages/Listings'));
const ListingDetail = React.lazy(() => import('@/pages/ListingDetail'));
const CreateListing = React.lazy(() => import('@/pages/CreateListing'));
const EditListing = React.lazy(() => import('@/pages/EditListing'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const MyListings = React.lazy(() => import('@/pages/MyListings'));
const Favorites = React.lazy(() => import('@/pages/Favorites'));
const Chats = React.lazy(() => import('@/pages/Chats'));
const ChatRoom = React.lazy(() => import('@/pages/ChatRoom'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Fallback пока страница загружается
const PageSkeleton: React.FC = () => (
  <div className="min-h-screen p-6 max-w-[1280px] mx-auto">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-2xl" />
      ))}
    </div>
  </div>
);

// Обёртка для защищённых маршрутов (только авторизованные)
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  if (!isInitialized) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// Обёртка для маршрутов с проверкой роли
interface RoleRouteProps {
  allowedRoles: UserRole[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const role = useAppSelector(selectUserRole);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  if (!isInitialized) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

const withSuspense = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Публичные маршруты
  { path: '/', element: withSuspense(Home) },
  { path: '/login', element: withSuspense(Login) },
  { path: '/register', element: withSuspense(Register) },
  { path: '/listings', element: withSuspense(Listings) },
  { path: '/listings/:id', element: withSuspense(ListingDetail) },

  // Только для agent и admin
  {
    element: <RoleRoute allowedRoles={['agent', 'admin']} />,
    children: [
      { path: '/listings/create', element: withSuspense(CreateListing) },
      { path: '/listings/:id/edit', element: withSuspense(EditListing) },
    ],
  },

  // Только для авторизованных
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/profile', element: withSuspense(Profile) },
      { path: '/profile/listings', element: withSuspense(MyListings) },
      { path: '/profile/favorites', element: withSuspense(Favorites) },
      { path: '/profile/chats', element: withSuspense(Chats) },
      { path: '/profile/chats/:id', element: withSuspense(ChatRoom) },
    ],
  },

  // Только для admin
  {
    element: <RoleRoute allowedRoles={['admin']} />,
    children: [{ path: '/admin', element: withSuspense(Admin) }],
  },

  // 404
  { path: '*', element: withSuspense(NotFound) },
]);
