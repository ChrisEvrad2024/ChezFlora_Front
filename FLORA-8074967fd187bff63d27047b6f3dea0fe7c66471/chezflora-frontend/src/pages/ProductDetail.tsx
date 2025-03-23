import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductService } from '@/services/ProductService';
import { addToRecentlyViewed } from '@/lib/recentlyViewed';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist';
import { addToCart } from '@/lib/cart';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shared/ProductCard';
import { 
  Minus, Plus, ShoppingBag, Heart, Share2, ArrowLeft, 
  CheckCircle, XCircle, Facebook, Twitter, Linkedin, Copy, 
  ChevronRight, Tag, Star, TruckIcon, Clock, Package, ShieldCheck
} from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categoryPath, setCategoryPath] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      loadProductData();
      window.scrollTo(0, 0);
    } else {
      navigate('/catalog');
    }
  }, [id, navigate]);
  
  const loadProductData = async () => {
    setIsLoading(true);
    try {
      // Charger le produit
      const productData = await ProductService.getProductById(id);
      
      if (!productData) {
        navigate('/catalog');
        return;
      }
      
      setProduct(productData);
      setInWishlist(isInWishlist(productData.id));
      
      // Ajouter aux produits récemment vus
      addToRecentlyViewed(productData);
      
      // Charger le chemin de catégorie
      if (productData.category) {
        const path = await ProductService.getCategoryPath(productData.category);
        setCategoryPath(path);
      }
      
      // Charger les produits associés
      const related = await ProductService.getProductsByCategory(productData.category)
        .filter(p => p.id !== productData.id)
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger les détails du produit'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isInStock = product?.stock === undefined || (product?.stock || 0) > 0;
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    // Limit quantity to stock level if stock is defined
    if (product?.stock !== undefined && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (product?.stock === undefined) {
      setQuantity(quantity + 1);
    } else {
      toast.error("Quantité maximale atteinte", {
        description: "Vous avez atteint le maximum de stock disponible.",
        duration: 3000,
      });
    }
  };
  
  const addProductToCart = () => {
    if (product && isInStock) {
      addToCart(product, quantity);
      toast.success("Ajouté au panier", {
        description: `${product.name} (${quantity}) a été ajouté à votre panier.`,
        duration: 3000,
      });
      
      // Dispatch custom event to update cart icon
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      toast.error("Produit en rupture de stock", {
        description: "Ce produit n'est actuellement pas disponible.",
        duration: 3000,
      });
    }
  };
  
  const toggleWishlist = () => {
    if (!product) return;
    
    if (inWishlist) {
      removeFromWishlist(product.id);
      setInWishlist(false);
      toast.info("Retiré des favoris", {
        description: `${product.name} a été retiré de vos favoris.`,
        duration: 3000,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]
      });
      setInWishlist(true);
      toast.success("Ajouté aux favoris", {
        description: `${product.name} a été ajouté à vos favoris.`,
        duration: 3000,
      });
    }
  };
  
  const shareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsLinkCopied(true);
    toast.success("Lien copié !", {
      description: "Le lien du produit a été copié dans le presse-papier.",
      duration: 3000,
    });
    
    setTimeout(() => {
      setIsLinkCopied(false);
    }, 3000);
  };
  
  const shareToSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Découvrez ${product.name} - ChezFlora`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };
  
  // Afficher le chargement
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex justify-center items-center h-96">
              <span className="text-muted-foreground">Chargement du produit...</span>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Si le produit n'existe pas
  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-serif mb-4">Produit non trouvé</h1>
            <p className="mb-8">Le produit que vous recherchez n'existe pas ou a été retiré.</p>
            <Link to="/catalog" className="btn-primary inline-flex">
              Retour à la boutique
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 overflow-x-auto mb-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Accueil
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/catalog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Boutique
            </Link>
            
            {categoryPath.map((category, index) => {
              // Using a key directly on the fragment without any other props
              return (
                <React.Fragment key={category.id}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Link 
                    to={`/catalog?category=${category.id}`}
                    className={`text-sm ${
                      index === categoryPath.length - 1 
                        ? 'font-medium' 
                        : 'text-muted-foreground hover:text-foreground transition-colors'
                    }`}
                  >
                    {category.name}
                  </Link>
                </React.Fragment>
              );
            })}
            
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate">{product.name}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Galerie d'images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name}
                  className={`w-full h-full object-cover animate-fade-in ${!isInStock ? 'opacity-70' : ''}`}
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`aspect-square rounded-md overflow-hidden w-20 border-2 transition-all snap-start flex-shrink-0 ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} - vue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Partage sur les réseaux sociaux */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full"
                  onClick={() => shareToSocial('facebook')}
                >
                  <Facebook size={18} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full"
                  onClick={() => shareToSocial('twitter')}
                >
                  <Twitter size={18} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full"
                  onClick={() => shareToSocial('linkedin')}
                >
                  <Linkedin size={18} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full"
                  onClick={shareProduct}
                >
                  {isLinkCopied ? <CheckCircle size={18} className="text-primary" /> : <Copy size={18} />}
                </Button>
              </div>
            </div>
            
            {/* Information produit */}
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl lg:text-4xl font-serif font-medium mb-2">{product.name}</h1>
                  
                  {/* Indicateur de stock */}
                  {product.stock !== undefined && (
                    <div className="flex-shrink-0">
                      {product.stock > 0 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex gap-1 items-center">
                          <CheckCircle size={12} />
                          En stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex gap-1 items-center">
                          <XCircle size={12} />
                          Rupture
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Prix et référence */}
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-3xl text-primary font-medium">{product.price.toFixed(2)} XAF</p>
                    {product.sku && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Tag size={14} />
                        Réf: {product.sku}
                      </p>
                    )}
                  </div>
                  
                  {product.popular && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex gap-1 items-center">
                      <Star size={12} />
                      Produit populaire
                    </Badge>
                  )}
                </div>
                
                {/* Ligne de séparation */}
                <Separator className="my-6" />
                
                {/* Description */}
                <div className="prose prose-stone max-w-none">
                  <p>{product.description}</p>
                </div>
                
                {/* Avantages produit */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <TruckIcon size={16} className="text-primary" />
                    <span>Livraison 24-48h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package size={16} className="text-primary" />
                    <span>Emballage soigné</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-primary" />
                    <span>Fraîcheur garantie</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>Satisfait ou remboursé</span>
                  </div>
                </div>
              </div>
              
              {/* Contrôle de quantité */}
              <div className="pt-4">
                <h3 className="font-medium mb-4">Quantité</h3>
                <div className="flex items-center">
                  <button 
                    className="border border-border rounded-l-md p-3 hover:bg-muted transition-colors"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || !isInStock}
                  >
                    <Minus size={16} />
                  </button>
                  <div className="border-t border-b border-border px-6 py-2 flex items-center justify-center min-w-[60px]">
                    {quantity}
                  </div>
                  <button 
                    className="border border-border rounded-r-md p-3 hover:bg-muted transition-colors"
                    onClick={increaseQuantity}
                    disabled={!isInStock || (product.stock !== undefined && quantity >= product.stock)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {/* Afficher le stock disponible */}
                {product.stock !== undefined && product.stock > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {product.stock} unité{product.stock > 1 ? 's' : ''} disponible{product.stock > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                    !isInStock ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={addProductToCart}
                  disabled={!isInStock}
                >
                  <ShoppingBag size={18} /> Ajouter au panier
                </button>
                <button 
                  className={`btn-ghost flex items-center justify-center gap-2 ${inWishlist ? 'border-primary text-primary' : ''}`}
                  onClick={toggleWishlist}
                >
                  <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} /> Favoris
                </button>
              </div>
              
              {/* Détails supplémentaires */}
              {(product.weight || (product.dimensions && Object.keys(product.dimensions).length > 0)) && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <h3 className="font-medium">Spécifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.weight && (
                        <div>
                          <p className="text-sm text-muted-foreground">Poids</p>
                          <p>{product.weight} kg</p>
                        </div>
                      )}
                      {product.dimensions && (
                        <div>
                          <p className="text-sm text-muted-foreground">Dimensions</p>
                          <p>
                            {product.dimensions.length || 'N/A'} × {product.dimensions.width || 'N/A'} × {product.dimensions.height || 'N/A'} cm
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Produits associés */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="text-2xl font-serif mb-8">Produits similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;