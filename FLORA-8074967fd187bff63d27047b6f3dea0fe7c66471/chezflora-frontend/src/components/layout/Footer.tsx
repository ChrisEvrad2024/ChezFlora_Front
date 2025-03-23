import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import Newsletter from '@/components/shared/Newsletter';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted py-16">
      <div className="container max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and About */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="font-serif text-2xl font-medium">ChezFlora</Link>
            <p className="text-muted-foreground text-sm">
              Depuis 2016, ChezFlora vous propose des créations florales uniques et des services de décoration pour tous vos événements.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Catégories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog?category=fresh-flowers" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Fleurs Fraîches
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=bouquets" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Bouquets
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=potted-plants" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Plantes en Pot
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=floral-decor" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  Décoration Florale
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <Newsletter variant="footer" />
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Adresse:</span>
              <span className="text-sm">123 Rue des Fleurs, 75001 Paris</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Téléphone:</span>
              <a href="tel:+33123456789" className="text-sm hover:text-primary transition-colors">
                +33 1 23 45 67 89
              </a>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Email:</span>
              <a href="mailto:contact@chezflora.fr" className="text-sm hover:text-primary transition-colors">
                contact@chezflora.fr
              </a>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {currentYear} ChezFlora. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;