import { useState, useEffect } from "react";
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
import { X, Plus, Image, Calendar } from "lucide-react";
import { POST_STATUS } from "@/services/BlogService";
import { BlogService } from "@/services/BlogService";

// Form validation schema
const blogPostFormSchema = z.object({
  title: z.string().min(5, {
    message: "Le titre doit contenir au moins 5 caractères",
  }),
  excerpt: z.string().min(20, {
    message: "Le résumé doit contenir au moins 20 caractères",
  }),
  content: z.string().min(50, {
    message: "Le contenu doit contenir au moins 50 caractères",
  }),
  authorName: z.string().min(3, {
    message: "Le nom de l'auteur doit contenir au moins 3 caractères",
  }),
  category: z.string({
    required_error: "Veuillez sélectionner une catégorie",
  }),
  status: z.enum([POST_STATUS.DRAFT, POST_STATUS.PUBLISHED, POST_STATUS.SCHEDULED, POST_STATUS.ARCHIVED], {
    required_error: "Veuillez sélectionner un statut",
  }),
  featured: z.boolean().default(false),
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  
  if (!file) return;
  
  // Vérifier que c'est bien une image
  if (!file.type.startsWith('image/')) {
    setImageError("Le fichier doit être une image");
    return;
  }
  
  // Limiter la taille de l'image (5MB par exemple)
  if (file.size > 5 * 1024 * 1024) {
    setImageError("L'image est trop volumineuse (max 5MB)");
    return;
  }
  
  // Utiliser FileReader pour obtenir l'URL de l'image
  const reader = new FileReader();
  reader.onload = (e) => {
    // Récupérer l'URL data de l'image
    const imageDataUrl = e.target.result;
    setImageUrl(imageDataUrl);
    setImageError("");
  };
  
  reader.onerror = () => {
    setImageError("Erreur lors du chargement de l'image");
  };
  
  // Lire le fichier comme une URL de données
  reader.readAsDataURL(file);
};

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

interface BlogPostFormProps {
  post: any | null;
  onSubmit: (post: any) => void;
  onCancel: () => void;
}

export function BlogPostForm({ post, onSubmit, onCancel }: BlogPostFormProps) {
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Charger les catégories existantes
  useEffect(() => {
    const categories = BlogService.getAllCategories();
    setAvailableCategories(categories);
  }, []);

  // Setup form with default values
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: post?.title || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      authorName: post?.authorName || post?.author || "",
      category: post?.category || "",
      status: post?.status || POST_STATUS.DRAFT,
      featured: post?.featured || false,
    },
  });

  // Form submission handler
  const handleFormSubmit = (values: BlogPostFormValues) => {
    // Create post object for submission
    const updatedPost = {
      ...values,
      imageUrl,
      tags,
    };

    onSubmit(updatedPost);
  };

  // Add tag to the list
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  // Remove tag from the list
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };
  
  // Handle key press in tag input
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'article</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre accrocheur de l'article" {...field} />
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {field.value === "autre" && (
                    <Input
                      placeholder="Nouvelle catégorie"
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(e.target.value);
                        }
                      }}
                      className="mt-2"
                    />
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={POST_STATUS.DRAFT}>Brouillon</SelectItem>
                      <SelectItem value={POST_STATUS.PUBLISHED}>Publié</SelectItem>
                      {post && (
                        <>
                          <SelectItem value={POST_STATUS.SCHEDULED}>Programmé</SelectItem>
                          <SelectItem value={POST_STATUS.ARCHIVED}>Archivé</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {field.value === POST_STATUS.SCHEDULED && (
                    <FormDescription className="flex items-center text-sm mt-1 text-yellow-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Vous pourrez configurer la date de publication après l'enregistrement
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auteur</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'auteur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Image de couverture</Label>
              <Input
                type="url"
                placeholder="URL de l'image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <div className="relative mt-2">
                  <img
                    src={imageUrl}
                    alt="Image de couverture"
                    className="h-32 w-full object-cover rounded-md border"
                    onError={(e) => {
                      // If image fails to load, set a placeholder
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
              {!imageUrl && (
                <div className="flex items-center justify-center h-32 bg-muted rounded-md border border-dashed">
                  <div className="text-muted-foreground text-center">
                    <Image className="h-8 w-8 mx-auto mb-2" />
                    <span>Ajoutez une URL d'image</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Un bref résumé de l'article..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contenu détaillé de l'article..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Ajouter un tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyPress}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={!newTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-1 bg-muted text-muted-foreground px-2 py-1 rounded-md">
                    <span>{tag}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aucun tag ajouté. Les tags aident à la recherche et au référencement.
                  </p>
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                  <div className="space-y-0.5">
                    <FormLabel>Mettre en avant</FormLabel>
                    <FormDescription>
                      Cet article sera mis en avant sur la page d'accueil
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {post ? "Mettre à jour" : "Créer l'article"}
          </Button>
        </div>
      </form>
    </Form>
  );
}