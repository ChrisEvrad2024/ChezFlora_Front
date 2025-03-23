
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  backLink?: {
    href: string;
    label: string;
  };
}

const AuthLayout = ({ children, title, description, backLink }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Image */}
      <div className="hidden md:block bg-muted relative">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1613539246066-78db6f03a16f?q=80&w=1974')",
            backgroundPosition: "center 30%"
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
          <div>
            <Link to="/" className="text-2xl font-serif">Floralie</Link>
          </div>
          <div>
            <h2 className="text-xl font-medium mb-2">Bienvenue dans notre boutique de fleurs</h2>
            <p className="text-white/80">Découvrez notre sélection de fleurs fraîches, bouquets et plantes.</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex flex-col justify-center p-6 md:p-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Mobile logo and back button */}
          <div className="md:hidden flex justify-between items-center mb-8">
            <Link to="/" className="text-2xl font-serif">Floralie</Link>
            {backLink && (
              <Link to={backLink.href} className="text-sm text-muted-foreground flex items-center gap-1">
                <ArrowLeft size={14} />
                {backLink.label}
              </Link>
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-serif">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          {/* Auth form */}
          {children}
          
          {/* Desktop back link */}
          {backLink && (
            <div className="hidden md:block text-center pt-4">
              <Link to={backLink.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {backLink.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
