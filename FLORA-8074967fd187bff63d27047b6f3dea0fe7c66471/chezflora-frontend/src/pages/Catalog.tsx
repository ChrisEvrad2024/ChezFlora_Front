import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shared/ProductCard';
import { Filter, ChevronRight, FolderTree } from 'lucide-react';
import { ProductService } from '@/services/ProductService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryPath, setCategoryPath] = useState([]);
  const categoryParam = searchParams.get('category');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [categoryParam]);
  
  const loadData = () => {
    setIsLoading(true);
    try {
      // Charger les catégories principales
      const mainCats = ProductService.getMainCategories();
      setMainCategories(mainCats);
      
      if (categoryParam) {
        // Charger les produits de la catégorie et ses sous-catégories
        const categoryProducts = ProductService.getProductsByCategory(categoryParam);
        setProducts(categoryProducts);
        
        // Charger les sous-catégories directes de la catégorie actuelle
        const childCats = ProductService.getChildCategories(categoryParam);
        setSubcategories(childCats);
        
        // Charger le chemin de catégories
        const path = ProductService.getCategoryPath(categoryParam);
        setCategoryPath(path);
      } else {
        // Charger tous les produits
        const allProducts = ProductService.getAllProducts();
        setProducts(allProducts);
        setSubcategories([]);
        setCategoryPath([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gérer le changement de catégorie
  const handleCategoryChange = (categoryId) => {
    setSearchParams({ category: categoryId });
  };
  
  // Effacer les filtres
  const clearFilters = () => {
    setSearchParams({});
  };
  
  // Compter les produits dans une catégorie
  const countProductsInCategory = (categoryId) => {
    return ProductService.getProductsByCategory(categoryId).length;
  };
  
  // Afficher le chargement
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="section-container">
            <div className="flex justify-center items-center h-96">
              <span className="text-muted-foreground">Chargement des produits...</span>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="section-container">
          <div className="text-center mb-16 animate-fade-up">
            <h1 className="section-title">Notre Collection</h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Parcourez notre sélection de fleurs fraîches, bouquets, plantes et décorations.
            </p>
          </div>
          
          {/* Fil d'Ariane des catégories */}
          {categoryPath.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto mb-8 pb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <FolderTree className="h-4 w-4" />
                Toutes les catégories
              </Button>
              
              {categoryPath.map((cat, index) => (
                <div key={cat.id} className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                  <Button 
                    variant={index === categoryPath.length - 1 ? "default" : "outline"}
                    size="sm" 
                    onClick={() => handleCategoryChange(cat.id)}
                    disabled={index === categoryPath.length - 1}
                  >
                    {cat.name}
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile filter toggle */}
            <button 
              className="lg:hidden flex items-center justify-center gap-2 w-full py-3 border border-border rounded-md mb-4"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <Filter size={18} />
              Filtrer les produits
            </button>
            
            {/* Sidebar filters */}
            <aside className={`lg:w-1/4 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24 bg-white p-6 rounded-lg border border-border">
                <h3 className="font-serif text-xl mb-4">Catégories</h3>
                <ul className="space-y-2">
                  <li>
                    <button 
                      className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                        !categoryParam ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                      }`}
                      onClick={clearFilters}
                    >
                      Tous les produits ({ProductService.getAllProducts().length})
                    </button>
                  </li>
                  
                  {/* Afficher soit les sous-catégories de la catégorie actuelle, soit les catégories principales */}
                  {categoryParam && subcategories.length > 0 ? (
                    <>
                      <li className="py-2 px-3 text-sm font-semibold text-muted-foreground">
                        Sous-catégories de {categoryPath[categoryPath.length - 1]?.name}:
                      </li>
                      {subcategories.map((category) => (
                        <li key={category.id}>
                          <button 
                            className={`w-full text-left py-2 px-3 ml-2 border-l-2 border-muted rounded-md transition-colors hover:bg-muted flex justify-between items-center`}
                            onClick={() => handleCategoryChange(category.id)}
                          >
                            <span>{category.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {countProductsInCategory(category.id)}
                            </Badge>
                          </button>
                        </li>
                      ))}
                      <li className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleCategoryChange(categoryPath[categoryPath.length - 2]?.id || '')}
                        >
                          Remonter au niveau supérieur
                        </Button>
                      </li>
                    </>
                  ) : (
                    mainCategories.map((category) => {
                      const hasChildren = ProductService.getChildCategories(category.id).length > 0;
                      return (
                        <li key={category.id}>
                          <button 
                            className={`w-full text-left py-2 px-3 rounded-md transition-colors flex justify-between items-center ${
                              categoryParam === category.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                            }`}
                            onClick={() => handleCategoryChange(category.id)}
                          >
                            <span>{category.name}</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="ml-2">
                                {countProductsInCategory(category.id)}
                              </Badge>
                              {hasChildren && <ChevronRight size={14} />}
                            </div>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </aside>
            
            {/* Products grid */}
            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
<div className="col-span-full text-center py-12">
                    <p className="text-lg text-muted-foreground">Aucun produit trouvé dans cette catégorie.</p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="mt-4"
                    >
                      Voir tous les produits
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Recommandations de sous-catégories */}
              {categoryParam && subcategories.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-xl font-serif mb-6">Explorez les catégories</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subcategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex flex-col items-center text-center gap-2"
                      >
                        <FolderTree className="h-6 w-6 text-primary" />
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <Badge variant="outline">
                          {countProductsInCategory(category.id)} produits
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Catalog;