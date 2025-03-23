import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { User, Settings, ShoppingBag, MapPin, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";


const AccountLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Utilisation du contexte d'authentification
  const { currentUser, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: location.pathname } });
      toast.error("Veuillez vous connecter pour accéder à votre compte");
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // Si l'utilisateur n'est pas authentifié, ne rien afficher (sera redirigé)
  if (!isAuthenticated) {
    return null;
  }

  // Logout handler
  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  // Navigation items for the sidebar
  const navigationItems = [
    { label: "Mon compte", href: "/account", icon: <User size={18} /> },
    { label: "Mes informations", href: "/account/profile", icon: <Settings size={18} /> },
    { label: "Mes commandes", href: "/account/orders", icon: <ShoppingBag size={18} /> },
    { label: "Mes adresses", href: "/account/addresses", icon: <MapPin size={18} /> }
  ];

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto px-4 py-8 pt-24 md:py-12 md:pt-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="space-y-1 md:sticky md:top-28">
              <div className="p-4 border rounded-lg mb-4">
                <h2 className="font-semibold">
                  {currentUser?.firstName} {currentUser?.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
              </div>
              
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.href} 
                    to={item.href}
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted w-full transition-colors ${
                      location.pathname === item.href ? "bg-muted font-medium" : ""
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <Separator className="my-2" />
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-destructive/10 w-full transition-colors text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Déconnexion
                </Button>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <main className="md:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AccountLayout;