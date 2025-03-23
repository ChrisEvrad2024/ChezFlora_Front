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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye, 
  Filter,
  FileText,
  Calendar as CalendarIcon,
  Clock,
  MessageSquare,
  CalendarCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { BlogService, POST_STATUS } from "@/services/BlogService";

const BlogManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [postToSchedule, setPostToSchedule] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [pendingCommentsCount, setPendingCommentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Chargement initial des données
  useEffect(() => {
    loadData();
    
    // Vérifier les articles programmés à intervalles réguliers
    const checkScheduledInterval = setInterval(() => {
      const publishedCount = BlogService.publishScheduledPosts();
      if (publishedCount > 0) {
        loadData();
        toast.success(`${publishedCount} article(s) programmé(s) publié(s)`, {
          description: "Les articles programmés ont été publiés automatiquement."
        });
      }
    }, 60000); // Vérifier toutes les minutes
    
    return () => clearInterval(checkScheduledInterval);
  }, []);
  
  // Charger les données
  const loadData = () => {
    setIsLoading(true);
    try {
      // Charger tous les articles
      const allPosts = BlogService.getAllPosts(true);
      setPosts(allPosts);
      
      // Vérifier s'il y a des commentaires en attente
      const pendingComments = BlogService.getPendingComments();
      setPendingCommentsCount(pendingComments.length);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données du blog"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrer les articles selon l'onglet actif et la recherche
  const getFilteredPosts = () => {
    let filtered = [...posts];
    
    // Filtrer par statut
    if (activeTab !== "all") {
      filtered = filtered.filter(post => post.status === activeTab);
    }
    
    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Trier par date (plus récent d'abord)
    return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  };
  
  const filteredPosts = getFilteredPosts();
  
  // Voir les détails d'un article
  const handleViewPost = (post) => {
    setSelectedPost(post);
    setIsViewDialogOpen(true);
  };
  
  // Éditer un article
  const handleEditPost = (post) => {
    setEditingPost({
      ...post,
      authorName: post.author
    });
    setIsFormDialogOpen(true);
  };
  
  // Ajouter un nouvel article
  const handleAddPost = () => {
    setEditingPost(null);
    setIsFormDialogOpen(true);
  };
  
  // Préparer la suppression d'un article
  const handleDeleteConfirmation = (post) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };
  
  // Exécuter la suppression d'un article
  const executeDeletePost = () => {
    if (!postToDelete) return;
    
    try {
      const success = BlogService.deletePost(postToDelete.id);
      
      if (success) {
        // Mettre à jour la liste locale
        setPosts(posts.filter(p => p.id !== postToDelete.id));
        
        toast.success("Article supprimé", {
          description: "L'article a été supprimé avec succès"
        });
      } else {
        toast.error("Échec de la suppression", {
          description: "L'article n'a pas pu être supprimé"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression de l'article"
      });
    } finally {
      setPostToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Préparer la programmation d'un article
  const handleSchedulePost = (post) => {
    setPostToSchedule(post);
    // Définir une date par défaut (demain à midi)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    
    setScheduledDate(tomorrow);
    setScheduledTime("12:00");
    setIsScheduleDialogOpen(true);
  };
  
  // Exécuter la programmation d'un article
  const executeSchedulePost = () => {
    if (!postToSchedule || !scheduledDate) return;
    
    try {
      // Combiner date et heure
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      // Vérifier que la date est future
      if (scheduledDateTime <= new Date()) {
        toast.error("Date invalide", {
          description: "La date de programmation doit être dans le futur"
        });
        return;
      }
      
      // Programmer l'article
      const updatedPost = BlogService.schedulePost(postToSchedule.id, scheduledDateTime);
      
      if (updatedPost) {
        // Mettre à jour la liste locale
        setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
        
        toast.success("Article programmé", {
          description: `Publication programmée pour le ${format(scheduledDateTime, 'dd/MM/yyyy à HH:mm')}`
        });
      } else {
        toast.error("Échec de la programmation", {
          description: "L'article n'a pas pu être programmé"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la programmation:", error);
      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue lors de la programmation"
      });
    } finally {
      setPostToSchedule(null);
      setIsScheduleDialogOpen(false);
    }
  };
  
  // Publier immédiatement un article
  const handlePublishNow = (post) => {
    try {
      const updatedPost = BlogService.updatePost(post.id, {
        status: POST_STATUS.PUBLISHED,
        publishDate: new Date().toISOString()
      });
      
      if (updatedPost) {
        // Mettre à jour la liste locale
        setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
        
        toast.success("Article publié", {
          description: "L'article a été publié avec succès"
        });
      } else {
        toast.error("Échec de la publication", {
          description: "L'article n'a pas pu être publié"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la publication"
      });
    }
  };
  
  // Voir et gérer les commentaires d'un article
  const handleManageComments = (post) => {
    setSelectedPostForComments(post);
    // Charger tous les commentaires, y compris ceux en attente
    const comments = BlogService.getComments(post.id, false);
    setPostComments(comments);
    setIsCommentsDialogOpen(true);
  };
  
  // Approuver un commentaire
  const handleApproveComment = (commentId) => {
    if (!selectedPostForComments) return;
    
    try {
      const success = BlogService.approveComment(selectedPostForComments.id, commentId);
      
      if (success) {
        // Mettre à jour la liste locale des commentaires
        setPostComments(postComments.map(c => 
          c.id === commentId ? { ...c, approved: true } : c
        ));
        
        toast.success("Commentaire approuvé", {
          description: "Le commentaire a été approuvé et est maintenant visible"
        });
        
        // Mettre à jour le compteur de commentaires en attente
        setPendingCommentsCount(prevCount => Math.max(0, prevCount - 1));
      } else {
        toast.error("Échec de l'approbation", {
          description: "Le commentaire n'a pas pu être approuvé"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'approbation du commentaire"
      });
    }
  };
  
  // Supprimer un commentaire
  const handleDeleteComment = (commentId) => {
    if (!selectedPostForComments) return;
    
    try {
      const success = BlogService.deleteComment(selectedPostForComments.id, commentId);
      
      if (success) {
        // Mettre à jour la liste locale des commentaires
        const deletedComment = postComments.find(c => c.id === commentId);
        setPostComments(postComments.filter(c => c.id !== commentId));
        
        toast.success("Commentaire supprimé", {
          description: "Le commentaire a été supprimé avec succès"
        });
        
        // Mettre à jour le compteur de commentaires en attente si nécessaire
        if (deletedComment && !deletedComment.approved) {
          setPendingCommentsCount(prevCount => Math.max(0, prevCount - 1));
        }
      } else {
        toast.error("Échec de la suppression", {
          description: "Le commentaire n'a pas pu être supprimé"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression du commentaire"
      });
    }
  };
  
  // Enregistrer un nouvel article ou mettre à jour un article existant
  const handleSavePost = (formData) => {
    try {
      if (editingPost) {
        // Mise à jour d'un article existant
        const updatedPost = BlogService.updatePost(editingPost.id, {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          tags: formData.tags,
          status: formData.status,
          imageUrl: formData.imageUrl,
          featured: formData.featured,
          author: formData.authorName
        });
        
        if (updatedPost) {
          // Mettre à jour la liste locale
          setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
          
          toast.success("Article mis à jour", {
            description: "Les modifications ont été enregistrées avec succès"
          });
        } else {
          toast.error("Échec de la mise à jour", {
            description: "L'article n'a pas pu être mis à jour"
          });
        }
      } else {
        // Création d'un nouvel article
        const newPost = BlogService.createPost({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          tags: formData.tags,
          status: formData.status,
          imageUrl: formData.imageUrl,
          featured: formData.featured,
          authorName: formData.authorName
        });
        
        // Ajouter à la liste locale
        setPosts([...posts, newPost]);
        
        toast.success("Article créé", {
          description: "Le nouvel article a été créé avec succès"
        });
      }
      
      // Fermer le dialogue
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement de l'article"
      });
    }
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    switch (status) {
      case POST_STATUS.PUBLISHED:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Publié</Badge>;
      case POST_STATUS.DRAFT:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 flex items-center gap-1"><Edit className="h-3 w-3" /> Brouillon</Badge>;
      case POST_STATUS.SCHEDULED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 flex items-center gap-1"><CalendarCheck className="h-3 w-3" /> Programmé</Badge>;
      case POST_STATUS.ARCHIVED:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 flex items-center gap-1"><XCircle className="h-3 w-3" /> Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Obtenir le titre de l'onglet avec le compteur
  const getTabTitle = (status, label) => {
    if (status === "all") {
      return `${label} (${posts.length})`;
    }
    
    const count = posts.filter(post => post.status === status).length;
    return `${label} (${count})`;
  };
  
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-muted-foreground">Chargement des articles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Gérez les articles de votre blog.</p>
        </div>
        <div className="flex gap-2">
          {pendingCommentsCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveTab("all");
                toast.info("Commentaires en attente", {
                  description: `${pendingCommentsCount} commentaire(s) en attente de modération`
                });
              }}
              className="relative"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Commentaires
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCommentsCount}
              </span>
            </Button>
          )}
          <Button onClick={handleAddPost}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{getTabTitle("all", "Tous")}</TabsTrigger>
          <TabsTrigger value={POST_STATUS.PUBLISHED}>{getTabTitle(POST_STATUS.PUBLISHED, "Publiés")}</TabsTrigger>
          <TabsTrigger value={POST_STATUS.DRAFT}>{getTabTitle(POST_STATUS.DRAFT, "Brouillons")}</TabsTrigger>
          <TabsTrigger value={POST_STATUS.SCHEDULED}>{getTabTitle(POST_STATUS.SCHEDULED, "Programmés")}</TabsTrigger>
          <TabsTrigger value={POST_STATUS.ARCHIVED}>{getTabTitle(POST_STATUS.ARCHIVED, "Archivés")}</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un article..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Catégories
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSearchQuery("")}>
                      Toutes les catégories
                    </DropdownMenuItem>
                    {BlogService.getAllCategories().map((category) => (
                      <DropdownMenuItem 
                        key={category} 
                        onClick={() => setSearchQuery(category)}
                      >
                        {category}
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
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell className="capitalize">{post.category}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell className="text-center">
                          {post.status === POST_STATUS.SCHEDULED ? (
                            <div className="flex flex-col items-center">
                              <span>{formatDate(post.updatedAt)}</span>
                              <span className="text-xs text-blue-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.scheduledDate && format(new Date(post.scheduledDate), 'HH:mm')}
                              </span>
                            </div>
                          ) : (
                            formatDate(post.publishDate || post.updatedAt)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(post.status)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewPost(post)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              
                              {post.status === POST_STATUS.DRAFT && (
                                <>
                                  <DropdownMenuItem onClick={() => handlePublishNow(post)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Publier maintenant
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSchedulePost(post)}>
                                    <CalendarCheck className="h-4 w-4 mr-2" />
                                    Programmer
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {post.status === POST_STATUS.SCHEDULED && (
                                <DropdownMenuItem onClick={() => handlePublishNow(post)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Publier maintenant
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem onClick={() => handleManageComments(post)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Gérer les commentaires
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteConfirmation(post)}
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
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="h-8 w-8 mb-2 opacity-50" />
                          <p>Aucun article trouvé.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Affichage de {filteredPosts.length} sur {posts.length} articles
            </div>
            {filteredPosts.length > 10 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>Précédent</Button>
                <Button variant="outline" size="sm" disabled>Suivant</Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </Tabs>

      {/* Dialogue de visualisation d'article */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[725px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <img 
                  src={selectedPost.imageUrl} 
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedPost.publishDate || selectedPost.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground capitalize">
                    {selectedPost.category}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Auteur: {selectedPost.author}</p>
                <p className="text-sm text-muted-foreground">Vues: {selectedPost.viewCount || 0}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Résumé</h3>
                <p>{selectedPost.excerpt}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Contenu</h3>
                <div className="prose prose-sm max-w-none">
                  <p>{selectedPost.content}</p>
                </div>
              </div>
              
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => handleEditPost(selectedPost)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de création/édition d'article */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
  <DialogContent className="sm:max-w-[725px] max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editingPost ? 'Modifier un article' : 'Ajouter un article'}
      </DialogTitle>
      <DialogDescription>
        {editingPost 
          ? "Modifiez les informations de l'article ci-dessous" 
          : "Remplissez le formulaire pour créer un nouvel article"}
      </DialogDescription>
    </DialogHeader>
    <BlogPostForm 
      initialData={editingPost} 
      onSave={handleSavePost} 
      onCancel={() => setIsFormDialogOpen(false)} 
    />
  </DialogContent>
</Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'article sera définitivement supprimé de votre blog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeletePost} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue de programmation d'article */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Programmer la publication</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Date de publication</h3>
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Heure de publication</h3>
              <Input 
                type="time" 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsScheduleDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={executeSchedulePost}
                disabled={!scheduledDate}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                Programmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue de gestion des commentaires */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Commentaires de "{selectedPostForComments?.title}"
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {postComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p>Aucun commentaire pour cet article.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postComments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`border rounded-lg p-4 ${
                    !comment.approved ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author}</span>
                      {!comment.approved && (
                        <Badge variant="warning" className="text-xs">En attente</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">{comment.content}</p>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    {!comment.approved && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApproveComment(comment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;