import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Route protégée pour les administrateurs
 */
const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    // Rediriger vers la page d'accueil si l'utilisateur n'est pas admin
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;