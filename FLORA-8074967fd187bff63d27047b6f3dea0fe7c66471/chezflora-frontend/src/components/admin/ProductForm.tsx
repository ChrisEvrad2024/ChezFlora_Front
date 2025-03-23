import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Product } from "@/types/product";
import { Trash2, Plus, X, AlertTriangle, Upload, Link as LinkIcon, Loader2, Image as ImageIcon, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductService } from "@/services/ProductService";

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom du produit doit contenir au moins 3 caractères",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
  price: z.coerce.number().positive({
    message: "Le prix doit être un nombre positif",
  }),
  stock: z.coerce.number().int().nonnegative({
    message: "Le stock doit être un nombre entier positif ou zéro",
  }).optional(),
  category: z.string({
    required_error: "Veuillez sélectionner une catégorie",
  }),
  sku: z.string().optional(),
  weight: z.coerce.number().positive().optional(),
  popular: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product: Product | null;
  categories: { id: string; name: string }[];
  onSubmit: (product: Product) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProductForm({ product, categories, onSubmit, onCancel, isSubmitting = false }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageTab, setImageTab] = useState<string>("url");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoriesWithPath, setCategoriesWithPath] = useState<any[]>([]);

  // Charger les catégories avec leur chemin complet
  useEffect(() => {
    // Préparer les catégories avec leur chemin complet
    const prepareCategories = () => {
      const allCategories = ProductService.getAllCategories();
      const prepared = allCategories.map(cat => {
        const path = ProductService.getCategoryPath(cat.id);
        const pathName = path.map(p => p.name).join(' > ');
        return {
          ...cat,
          pathName
        };
      });
      
      // Trier d'abord par niveau puis par ordre
      prepared.sort((a, b) => {
        const aPath = a.pathName.split('>').length;
        const bPath = b.pathName.split('>').length;
        
        if (aPath === bPath) {
          return (a.order || 0) - (b.order || 0);
        }
        
        return aPath - bPath;
      });
      
      setCategoriesWithPath(prepared);
    };
    
    prepareCategories();
  }, []);

  // Setup form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      stock: product?.stock || 0,
      category: product?.category || "",
      sku: product?.sku || "",
      weight: product?.weight || undefined,
      popular: product?.popular || false,
      featured: product?.featured || false,
    },
  });

  // Form submission handler
  const handleFormSubmit = (values: ProductFormValues) => {
    // Validate images
    if (images.length === 0) {
      setImageError("Veuillez ajouter au moins une image pour le produit");
      return;
    }
    
    // Create new product object
    const updatedProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      images: images,
      category: values.category,
      popular: values.popular,
      featured: values.featured,
      sku: values.sku,
      weight: values.weight,
    };

    onSubmit(updatedProduct);
  };

  // Add image URL to the list
  const handleAddImageUrl = () => {
    // Reset error
    setImageError("");
    
    if (!imageUrl) {
      setImageError("Veuillez saisir une URL d'image");
      return;
    }
    
    if (images.includes(imageUrl)) {
      setImageError("Cette image est déjà dans la liste");
      return;
    }
    
    setImages([...images, imageUrl]);
    setImageUrl("");
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setImageError("");
    
    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          reject(new Error(`Le fichier ${file.name} n'est pas une image`));
          return;
        }
        
        // Vérifier la taille du fichier (limite à 5MB)
        if (file.size >10 * 1024 * 1024) {
          reject(new Error(`L'image ${file.name} dépasse 5MB`));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            resolve(result);
          } else {
            reject(new Error(`Échec de lecture du fichier ${file.name}`));
          }
        };
        reader.onerror = () => {
          reject(new Error(`Échec de lecture du fichier ${file.name}`));
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(filePromises)
      .then(newImages => {
        // Vérifier les doublons
        const uniqueNewImages = newImages.filter(img => !images.includes(img));
        setImages([...images, ...uniqueNewImages]);
        
        // Afficher un message si des images ont été ignorées
        if (uniqueNewImages.length < newImages.length) {
          setImageError("Certaines images ont été ignorées car elles sont déjà ajoutées");
        }
      })
      .catch(error => {
        setImageError(error.message);
      })
      .finally(() => {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
  };

  // Remove image from the list
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  // Handle Enter key in image input
  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImageUrl();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Bouquet de roses rouges" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[400px]">
                      {categoriesWithPath.map((category) => {
                        // Calculer l'indentation
                        const level = category.pathName.split('>').length - 1;
                        const indent = level * 12; // 12px par niveau
                        
                        return (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className="flex items-center"
                          >
                            <div style={{ marginLeft: `${indent}px` }} className="flex items-center">
                              {level > 0 && (
                                <ChevronRight className="h-3 w-3 text-muted-foreground mr-1" />
                              )}
                              {category.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Référence)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="SKU-12345" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      disabled={isSubmitting}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        // Handle empty input to avoid NaN
                        const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description détaillée du produit..."
                      className="min-h-[120px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Images du produit</Label>
              
              <Tabs defaultValue="url" value={imageTab} onValueChange={setImageTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    URL d'image
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Télécharger
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url">
                  <div className="flex space-x-2">
                    <Input
                      type="url"
                      placeholder="URL de l'image"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImageError("");
                      }}
                      onKeyDown={handleImageKeyDown}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddImageUrl}
                      disabled={isSubmitting || !imageUrl}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="upload">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          disabled={isSubmitting || isUploading}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <div className="border border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                              <span>Téléchargement en cours...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                              <span>Cliquez ou glissez-déposez des images ici</span>
                              <span className="text-xs text-muted-foreground mt-1">Formats pris en charge : JPEG, PNG, GIF (Max: 5MB)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {imageError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>{imageError}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Image produit ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md border"
                      onError={(e) => {
                        // If image fails to load, set a placeholder
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-80"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {images.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Aucune image ajoutée. Veuillez ajouter au moins une image.
                </p>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="popular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Produit populaire</FormLabel>
                      <FormDescription>
                        Marquer ce produit comme populaire
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Produit en vedette</FormLabel>
                      <FormDescription>
                        Mettre ce produit en avant sur la page d'accueil
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? "Enregistrement..." : (product ? "Mettre à jour" : "Créer le produit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}