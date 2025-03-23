import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Package, 
  FolderTree,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  MoveVertical,
  ArrowDownUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductService } from '@/services/ProductService';
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form validation schema
const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  description: z.string().min(5, {
    message: "La description doit contenir au moins 5 caractères",
  }),
  parentId: z.string().nullable().optional(),
  order: z.number().int().positive().optional(),
  id: z.string().optional()
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

type Category = {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  order?: number;
};

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [currentParentCategory, setCurrentParentCategory] = useState<string | null>(null);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  
  // Setup form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
      order: 1
    },
  });
  
  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);
  
  // Update displayed categories when parent changes
  useEffect(() => {
    if (currentParentCategory === null) {
      // Afficher les catégories principales
      const mainCategories = allCategories.filter(cat => !cat.parentId);
      setCategories(mainCategories);
      setCategoryPath([]);
    } else {
      // Afficher les sous-catégories du parent sélectionné
      const childCategories = allCategories.filter(cat => cat.parentId === currentParentCategory);
      setCategories(childCategories);
      
      // Mettre à jour le chemin de catégories
      const path = ProductService.getCategoryPath(currentParentCategory);
      setCategoryPath(path);
    }
  }, [currentParentCategory, allCategories]);
  
  // Load categories from service
  const loadCategories = () => {
    setIsLoading(true);
    try {
      const loadedCategories = ProductService.getAllCategories();
      
      // Trier les catégories par ordre
      const sortedCategories = [...loadedCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setAllCategories(sortedCategories);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger les données des catégories'
      });
      setIsLoading(false);
    }
  };
  
  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    searchQuery === "" || 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle adding a new category
  const handleAddCategory = () => {
    setEditingCategory(null);
    
    // Déterminer l'ordre par défaut
    const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order || 0), 0);
    
    form.reset({
      name: "",
      description: "",
      parentId: currentParentCategory,
      order: maxOrder + 1
    });
    
    setIsDialogOpen(true);
  };
  
  // Handle editing a category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      order: category.order || 1,
      id: category.id
    });
    setIsDialogOpen(true);
  };
  
  // Handle saving category
  const handleSaveCategory = (values: CategoryFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = ProductService.updateCategory(editingCategory.id, {
          name: values.name,
          description: values.description,
          parentId: values.parentId,
          order: values.order
        });
        
        if (updatedCategory) {
          // Update local list
          setAllCategories(prevCategories => {
            return prevCategories.map(cat => 
              cat.id === updatedCategory.id ? updatedCategory : cat
            );
          });
          
          toast.success("Catégorie mise à jour", {
            description: "La catégorie a été mise à jour avec succès"
          });
        } else {
          toast.error("Échec de la mise à jour", {
            description: "La catégorie n'a pas pu être mise à jour"
          });
        }
      } else {
        // Add new category
        const newCategory = ProductService.addCategory({
          name: values.name,
          description: values.description,
          parentId: values.parentId,
          order: values.order
        });
        
        // Add to local list
        setAllCategories(prev => [...prev, newCategory]);
        
        toast.success("Catégorie ajoutée", {
          description: "La catégorie a été ajoutée avec succès"
        });
      }
      
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la catégorie:', error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement de la catégorie"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Prepare category deletion
  const confirmDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    
    // Vérifier s'il y a des produits dans cette catégorie
    const productsInCategory = ProductService.getProductsByCategory(categoryId, false);
    
    if (productsInCategory.length > 0) {
      setIsReassignDialogOpen(true);
    } else {
      setIsDeleteDialogOpen(true);
    }
  };
  
  // Execute category deletion
  const executeDeleteCategory = (reassignProducts = false) => {
    if (!categoryToDelete) return;
    
    try {
      const success = ProductService.deleteCategory(categoryToDelete, reassignProducts);
      
      if (success) {
        // Update local list
        const updatedCategories = allCategories.filter(cat => cat.id !== categoryToDelete);
        setAllCategories(updatedCategories);
        
        toast.success("Catégorie supprimée", {
          description: reassignProducts ? 
            "La catégorie a été supprimée et les produits ont été réattribués" : 
            "La catégorie a été supprimée avec succès"
        });
      } else {
        toast.error("Échec de la suppression", {
          description: "La catégorie n'a pas pu être supprimée"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression de la catégorie"
      });
    } finally {
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
      setIsReassignDialogOpen(false);
    }
  };
  
  // Count products in category
  const countProductsInCategory = (categoryId: string) => {
    return ProductService.getProductsByCategory(categoryId, true).length;
  };
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };
  
  // Enter sub-category view
  const enterCategory = (categoryId: string) => {
    setCurrentParentCategory(categoryId);
  };
  
  // Navigate up to parent
  const navigateUp = () => {
    if (!currentParentCategory) return;
    
    const currentCategory = allCategories.find(cat => cat.id === currentParentCategory);
    if (currentCategory) {
      setCurrentParentCategory(currentCategory.parentId);
    }
  };
  
  // Check if category has children
  const hasChildren = (categoryId: string) => {
    return allCategories.some(cat => cat.parentId === categoryId);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-muted-foreground">Chargement des catégories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground">Gérez les catégories et sous-catégories de produits.</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une catégorie
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {currentParentCategory && (
                <Button variant="outline" size="sm" onClick={navigateUp} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
              )}
              
              {/* Breadcrumb path */}
              {categoryPath.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => setCurrentParentCategory(null)}
                  >
                    Accueil
                  </Button>
                  {categoryPath.map((cat, index) => (
                    <div key={cat.id} className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 px-2 ${index === categoryPath.length - 1 ? 'font-medium' : ''}`}
                        onClick={() => setCurrentParentCategory(cat.id)}
                      >
                        {cat.name}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une catégorie..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Nom</TableHead>
                  <TableHead className="w-[35%]">Description</TableHead>
                  <TableHead className="text-center">Produits</TableHead>
                  <TableHead className="text-center">Ordre</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => {
                    const productCount = countProductsInCategory(category.id);
                    const hasChildCategories = hasChildren(category.id);
                    const isExpanded = expandedCategories.includes(category.id);
                    
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {hasChildCategories && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => enterCategory(category.id)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            )}
                            <span>{category.name}</span>
                            {hasChildCategories && (
                              <Badge variant="outline" className="ml-2">
                                Parent
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell className="text-center">{productCount}</TableCell>
                        <TableCell className="text-center">{category.order || 1}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {hasChildCategories && (
                                <DropdownMenuItem onClick={() => enterCategory(category.id)}>
                                  <ChevronRight className="h-4 w-4 mr-2" />
                                  Voir sous-catégories
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => confirmDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchQuery ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-8 w-8 mb-2 opacity-50" />
                          <p>Aucune catégorie ne correspond à votre recherche</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FolderTree className="h-8 w-8 mb-2 opacity-50" />
                          <p>Aucune catégorie disponible</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={handleAddCategory}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une catégorie
                          </Button>
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
            Affichage de {filteredCategories.length} catégorie(s) 
            {currentParentCategory ? (
              <span> dans <span className="font-medium">{categoryPath[categoryPath.length - 1]?.name}</span></span>
            ) : (
              <span> principales</span>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier une catégorie' : 'Ajouter une catégorie'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Modifiez les informations de la catégorie' 
                : 'Créez une nouvelle catégorie pour organiser vos produits'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveCategory)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom de la catégorie" 
                        disabled={isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description de la catégorie" 
                        disabled={isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie parente</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                      value={field.value?.toString() || "null"}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie parente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Aucune (catégorie principale)</SelectItem>
                        {allCategories
                          .filter(cat => cat.id !== editingCategory?.id)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Une catégorie peut être une sous-catégorie d'une autre catégorie.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordre d'affichage</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        disabled={isSubmitting}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Les catégories sont triées par ordre croissant.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? "Enregistrement..." 
                    : (editingCategory ? "Mettre à jour" : "Créer")
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
              {hasChildren(categoryToDelete || '') && (
                <p className="mt-2 font-medium text-amber-500">
                  Attention : Les sous-catégories seront déplacées vers la catégorie parente.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => executeDeleteCategory(false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reassign Products Dialog */}
      <AlertDialog 
        open={isReassignDialogOpen} 
        onOpenChange={setIsReassignDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Produits associés détectés</AlertDialogTitle>
            <AlertDialogDescription>
              Cette catégorie contient des produits. Que souhaitez-vous faire ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => executeDeleteCategory(true)}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              Réattribuer les produits
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => {
                setIsReassignDialogOpen(false);
                setIsDeleteDialogOpen(true);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continuer sans réattribuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesManagement;