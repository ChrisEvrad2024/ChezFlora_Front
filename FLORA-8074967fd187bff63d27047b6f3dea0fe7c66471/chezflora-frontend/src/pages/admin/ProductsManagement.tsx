import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye, 
  Copy,
  Filter,
  AlertCircle,
  X,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "@/components/admin/ProductForm";
import ProductDetails from "@/components/admin/ProductDetails";
import { Product } from "@/types/product";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProductService } from "@/services/ProductService";

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, []);
  
  // Chargement des données depuis les services
  const loadData = () => {
    setIsLoading(true);
    try {
      const allProducts = ProductService.getAllProducts();
      const allCategories = ProductService.getAllCategories();
      
      setProducts(allProducts);
      setCategories(allCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger les données des produits'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrer les produits par recherche et catégorie
  const filteredProducts = products
    .filter(product => 
      (searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      ) && 
      (selectedCategory === "" || product.category === selectedCategory)
    );
  
  // Trouver le nom de la catégorie
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Gérer l'édition d'un produit
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  
  // Gérer l'ajout d'un produit
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };
  
  // Gérer l'affichage des détails d'un produit
  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsDetailsOpen(true);
  };
  
  // Préparer la suppression d'un produit
  const confirmDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };
  
  // Exécuter la suppression d'un produit
  const executeDeleteProduct = () => {
    if (!productToDelete) return;
    
    try {
      const success = ProductService.deleteProduct(productToDelete);
      
      if (success) {
        // Mettre à jour la liste locale
        setProducts(products.filter(p => p.id !== productToDelete));
        
        toast.success("Produit supprimé", {
          description: "Le produit a été supprimé avec succès"
        });
      } else {
        toast.error("Échec de la suppression", {
          description: "Le produit n'a pas pu être supprimé"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression du produit"
      });
    } finally {
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Gérer la sauvegarde d'un produit (ajout ou modification)
  const handleSaveProduct = async (productData: Product) => {
    setIsSubmitting(true);
    
    try {
      if (editingProduct) {
        // Mise à jour d'un produit existant
        const updatedProduct = ProductService.updateProduct(editingProduct.id, productData);
        
        if (updatedProduct) {
          // Mettre à jour la liste locale
          setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
          
          toast.success("Produit mis à jour", {
            description: "Les modifications ont été enregistrées avec succès"
          });
        } else {
          toast.error("Échec de la mise à jour", {
            description: "Le produit n'a pas pu être mis à jour"
          });
        }
      } else {
        // Ajout d'un nouveau produit
        const newProduct = ProductService.addProduct(productData);
        
        // Ajouter à la liste locale
        setProducts([...products, newProduct]);
        
        toast.success("Produit ajouté", {
          description: "Le produit a été ajouté avec succès"
        });
      }
      
      // Fermer le dialogue
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement du produit"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Dupliquer un produit
  const handleDuplicateProduct = (product: Product) => {
    // Créer une copie du produit avec un nouvel ID
    const duplicatedProduct = {
      ...product,
      id: `copy-of-${product.id}`,
      name: `Copie de ${product.name}`,
      sku: product.sku ? `COPY-${product.sku}` : undefined
    };
    
    try {
      // Ajouter le produit dupliqué
      const newProduct = ProductService.addProduct(duplicatedProduct);
      
      // Mettre à jour la liste locale
      setProducts([...products, newProduct]);
      
      toast.success("Produit dupliqué", {
        description: "Le produit a été dupliqué avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la duplication du produit"
      });
    }
  };
  
  // Obtenir le badge de statut de stock
  const getStockBadge = (stock?: number) => {
    if (stock === undefined) return null;
    
    if (stock > 10) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">En stock</Badge>;
    } else if (stock > 0) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Stock faible</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rupture</Badge>;
    }
  };
  
  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-muted-foreground">Chargement des produits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">Gérez votre catalogue de produits.</p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {selectedCategory && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCategory("")}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {getCategoryName(selectedCategory)}
                  <X className="h-4 w-4" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Catégories
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedCategory("")}>
                    Tous les produits
                  </DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem 
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                          <img
                            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <span className="block truncate max-w-[200px]">{product.name}</span>
                          {product.sku && (
                            <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(product.category)}</TableCell>
                      <TableCell className="text-right">{product.price.toFixed(2)} €</TableCell>
                      <TableCell className="text-center">{product.stock ?? 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        {getStockBadge(product.stock)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchQuery ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-8 w-8 mb-2 opacity-50" />
                          <p>Aucun produit ne correspond à votre recherche</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8 mb-2 opacity-50" />
                          <p>Aucun produit dans cette catégorie</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredProducts.length} sur {products.length} produits
          </div>
          {products.length > 10 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Précédent</Button>
              <Button variant="outline" size="sm" disabled>Suivant</Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Formulaire de produit en dialogue */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[725px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Modifier un produit' : 'Ajouter un produit'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            categories={categories}
            product={editingProduct}
            onSubmit={handleSaveProduct}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Composant de détails du produit */}
      <ProductDetails 
        product={viewingProduct} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        onEdit={(product) => {
          setIsDetailsOpen(false);
          handleEditProduct(product);
        }} 
      />
    </div>
  );
};

export default ProductsManagement;