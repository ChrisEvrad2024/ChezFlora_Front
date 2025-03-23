import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/product";
import { ProductService } from "@/services/ProductService";
import { Edit, Package, Check, X, ShoppingBag, Tag, Calendar, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProductDetailsProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

const ProductDetails = ({ product, isOpen, onClose, onEdit }: ProductDetailsProps) => {
  const [activeTab, setActiveTab] = useState("info");

  if (!product) return null;

  // Formatage de la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Récupération du chemin de catégorie
  const categoryPath = ProductService.getCategoryPath(product.category);
  const categoryPathString = categoryPath.map(cat => cat.name).join(" > ");

  // Status du stock
  const getStockStatus = () => {
    if (product.stock === undefined) return "Non géré";
    if (product.stock === 0) return "Rupture";
    if (product.stock < 5) return "Faible";
    return "En stock";
  };

  // Couleur du badge de stock
  const getStockBadgeVariant = () => {
    if (product.stock === undefined) return "secondary";
    if (product.stock === 0) return "destructive";
    if (product.stock < 5) return "warning";
    return "success";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            {product.sku && <span className="text-sm">SKU: {product.sku}</span>}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Images
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Prix</h3>
                    <p className="mt-1 text-lg font-semibold">{product.price.toFixed(2)} XAF</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Stock</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={getStockBadgeVariant()}>
                        {getStockStatus()}
                      </Badge>
                      <span>{product.stock !== undefined ? product.stock : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Catégorie</h3>
                  <div className="mt-1 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{categoryPathString || 'Non catégorisé'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Produit populaire</h3>
                    <div className="mt-1 flex items-center">
                      {product.popular ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mr-2" />
                      )}
                      <span>{product.popular ? 'Oui' : 'Non'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Produit en vedette</h3>
                    <div className="mt-1 flex items-center">
                      {product.featured ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mr-2" />
                      )}
                      <span>{product.featured ? 'Oui' : 'Non'}</span>
                    </div>
                  </div>
                </div>

                {(product.weight || product.dimensions) && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Caractéristiques</h3>
                    <div className="mt-1 space-y-1">
                      {product.weight && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Poids</span>
                          <span>{product.weight} kg</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dimensions</span>
                          <span>
                            {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Informations supplémentaires</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Créé le {formatDate(product.createdAt)}
                      </span>
                    </div>
                    {product.updatedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Modifié le {formatDate(product.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Action rapides</h3>
                  <div className="mt-2 space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full flex items-center justify-start gap-2"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                      Modifier ce produit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full flex items-center justify-start gap-2"
                      asChild
                    >
                      <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer">
                        <ShoppingBag className="h-4 w-4" />
                        Voir dans la boutique
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Galerie d'images ({product.images.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group rounded-md overflow-hidden border aspect-square">
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <p className="text-xs">Image {index + 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-4">
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <BarChart2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-medium">Statistiques non disponibles</h3>
                <p className="text-muted-foreground">
                  Les statistiques de ce produit ne sont pas encore disponibles.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;