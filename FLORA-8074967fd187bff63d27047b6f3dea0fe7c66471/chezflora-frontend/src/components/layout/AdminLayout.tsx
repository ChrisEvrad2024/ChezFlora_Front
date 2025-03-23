import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PackageOpen, 
  Users, 
  ShoppingBag, 
  Settings, 
  FileText, 
  BarChart3,
  LogOut,
  Menu,
  AlertCircle,
  FolderTree,
  Home,
  UserCog  // Add this import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Utilisation du contexte d'authentification
  const { currentUser, isAdmin, logout } = useAuth();

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (!isAdmin()) {
      toast.error("Accès non autorisé", {
        description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page"
      });
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Si l'utilisateur n'est pas admin, ne rien afficher (sera redirigé)
  if (!isAdmin()) {
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
    { 
      label: "Tableau de bord", 
      href: "/admin", 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      label: "Produits", 
      href: "/admin/products", 
      icon: <PackageOpen size={18} /> 
    },
    { 
      label: "Catégories", 
      href: "/admin/categories", 
      icon: <FolderTree size={18} /> 
    },
    { 
      label: "Commandes", 
      href: "/admin/orders", 
      icon: <ShoppingBag size={18} /> 
    },
    { 
      label: "Clients", 
      href: "/admin/customers", 
      icon: <Users size={18} /> 
    },
    // Nouvel élément pour la gestion des utilisateurs
    { 
      label: "Utilisateurs", 
      href: "/admin/users", 
      icon: <UserCog size={18} />,
      // Visible uniquement pour les Super Admin
      adminOnly: true
    },
    { 
      label: "Blog", 
      href: "/admin/blog", 
      icon: <FileText size={18} /> 
    },
    { 
      label: "Statistiques", 
      href: "/admin/analytics", 
      icon: <BarChart3 size={18} /> 
    },
    { 
      label: "Paramètres", 
      href: "/admin/settings", 
      icon: <Settings size={18} /> 
    }
  ];

  const Sidebar = () => (
    <div className="space-y-1">
      <div className="px-3 py-4">
        <h2 className="text-lg font-semibold mb-1">Admin ChezFlora</h2>
        <p className="text-sm text-muted-foreground">
          Connecté en tant que {currentUser?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
        </p>
      </div>
      
      <Separator />
      
      <nav className="space-y-1 px-3 py-2">
        {navigationItems.map((item) => (
          <Link 
            key={item.href} 
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted w-full transition-colors ${
              location.pathname === item.href ? "bg-muted font-medium" : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <Separator className="my-2" />
        
        {/* Bouton pour retourner au site principal */}
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted w-full transition-colors text-primary"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Home size={18} />
          <span>Retour au site</span>
        </Link>
        
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 w-full transition-colors text-destructive justify-start font-normal"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </Button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r h-screen overflow-y-auto sticky top-0">
        <Sidebar />
      </aside>
      
      {/* Mobile sidebar (sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-10 bg-background border-b flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={20} />
          </Button>
          <h1 className="font-semibold">Admin ChezFlora</h1>
          <div className="w-10"></div> {/* Pour balance */}
        </header>
        
        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;