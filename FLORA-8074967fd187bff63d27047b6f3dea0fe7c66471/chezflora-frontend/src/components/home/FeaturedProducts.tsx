
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/shared/ProductCard';
import { ChevronRight } from 'lucide-react';
import { ProductService } from '@/services/ProductService';

const FeaturedProducts = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setPopularProducts(ProductService.getPopularProducts());
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return <div className="section-container">Chargement des produits...</div>;
  }
  
  return (
    <section className="section-container">
      <div className="text-center mb-16">
        <span className="inline-block text-xs uppercase tracking-widest mb-3 text-primary font-medium">
          Notre Sélection
        </span>
        <h2 className="section-title">Créations Populaires</h2>
        <p className="section-subtitle max-w-2xl mx-auto">
          Découvrez nos compositions les plus appréciées, créées avec passion par nos artisans fleuristes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {popularProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="text-center mt-12">
        <Link 
          to="/catalog" 
          className="inline-flex items-center text-primary hover:underline"
        >
          Voir toute la collection
          <ChevronRight size={18} className="ml-1" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
