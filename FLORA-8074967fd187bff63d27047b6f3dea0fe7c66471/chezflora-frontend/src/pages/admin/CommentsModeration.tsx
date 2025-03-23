import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  CheckCircle,
  Trash2,
  MessageSquare,
  AlertCircle,
  Eye,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BlogService } from "@/services/BlogService";

const CommentsModeration = () => {
  const [comments, setComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isViewPostDialogOpen, setIsViewPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load comments on component mount
  useEffect(() => {
    loadComments();
  }, []);

  // Load pending comments
  const loadComments = () => {
    setIsLoading(true);
    try {
      const pendingComments = BlogService.getPendingComments();
      setComments(pendingComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Error", {
        description: "Failed to load pending comments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter comments based on search
  const filteredComments = searchQuery
    ? comments.filter(
        (comment) =>
          comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : comments;

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy à HH:mm", {
        locale: fr,
      });
    } catch (e) {
      return dateString;
    }
  };

  // Approve comment
  const handleApproveComment = (comment) => {
    try {
      const success = BlogService.approveComment(comment.postId, comment.id);

      if (success) {
        // Update local list
        setComments(comments.filter((c) => !(c.postId === comment.postId && c.id === comment.id)));

        toast.success("Commentaire approuvé", {
          description: "Le commentaire est maintenant visible sur le site",
        });
      } else {
        toast.error("Échec de l'approbation", {
          description: "Le commentaire n'a pas pu être approuvé",
        });
      }
    } catch (error) {
      console.error("Error approving comment:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'approbation du commentaire",
      });
    }
  };

  // Delete comment confirmation
  const handleDeleteConfirmation = (comment) => {
    setCommentToDelete(comment);
    setIsDeleteDialogOpen(true);
  };

  // Execute comment deletion
  const executeDeleteComment = () => {
    if (!commentToDelete) return;

    try {
      const success = BlogService.deleteComment(
        commentToDelete.postId,
        commentToDelete.id
      );

      if (success) {
        // Update local list
        setComments(
          comments.filter(
            (c) =>
              !(
                c.postId === commentToDelete.postId &&
                c.id === commentToDelete.id
              )
          )
        );

        toast.success("Commentaire supprimé", {
          description: "Le commentaire a été supprimé avec succès",
        });
      } else {
        toast.error("Échec de la suppression", {
          description: "Le commentaire n'a pas pu être supprimé",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression du commentaire",
      });
    } finally {
      setCommentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // View article associated with comment
  const handleViewPost = (comment) => {
    const post = BlogService.getPostById(comment.postId);
    if (post) {
      setSelectedPost(post);
      setIsViewPostDialogOpen(true);
    } else {
      toast.error("Article introuvable", {
        description: "L'article associé à ce commentaire n'a pas été trouvé",
      });
    }
  };

  // Handle bulk actions
  const handleApproveAll = () => {
    if (comments.length === 0) return;

    let successCount = 0;
    let errorCount = 0;

    comments.forEach((comment) => {
      try {
        const success = BlogService.approveComment(comment.postId, comment.id);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    });

    if (successCount > 0) {
      toast.success(`${successCount} commentaires approuvés`, {
        description: "Les commentaires sont maintenant visibles sur le site",
      });
      // Reload comments to update the list
      loadComments();
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} commentaires n'ont pas pu être approuvés`, {
        description: "Des erreurs sont survenues lors de l'approbation",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modération des commentaires
          </h1>
          <p className="text-muted-foreground">
            Gérez les commentaires en attente d'approbation.
          </p>
        </div>

        {comments.length > 0 && (
          <Button onClick={handleApproveAll}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Tout approuver ({comments.length})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un commentaire..."
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
                  <TableHead>Auteur</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Chargement des commentaires...
                    </TableCell>
                  </TableRow>
                ) : filteredComments.length > 0 ? (
                  filteredComments.map((comment) => (
                    <TableRow key={`${comment.postId}-${comment.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{comment.author}</p>
                            {comment.email && (
                              <p className="text-xs text-muted-foreground">
                                {comment.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-2">{comment.content}</p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-normal"
                          onClick={() => handleViewPost(comment)}
                        >
                          <span className="underline text-primary">
                            {BlogService.getPostById(comment.postId)?.title || "Article inconnu"}
                          </span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center text-xs">
                          <Calendar className="h-3 w-3 mb-1" />
                          {formatDate(comment.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleApproveComment(comment)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteConfirmation(comment)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                        <p>Aucun commentaire en attente de modération.</p>
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
            {filteredComments.length} commentaire(s) en attente de modération
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDeleteComment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Post Dialog */}
      {selectedPost && (
        <AlertDialog open={isViewPostDialogOpen} onOpenChange={setIsViewPostDialogOpen}>
          <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>{selectedPost.title}</AlertDialogTitle>
              <AlertDialogDescription>
                <Badge className="mb-2">
                  {selectedPost.category}
                </Badge>
                <p className="font-normal text-sm mb-4">
                  Publié le {formatDate(selectedPost.publishDate || selectedPost.updatedAt)} par {selectedPost.author}
                </p>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Résumé</h3>
                  <p>{selectedPost.excerpt}</p>
                </div>
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-semibold mb-2">Contenu</h3>
                  <div className="prose prose-sm max-w-none">
                    <p>{selectedPost.content.substring(0, 300)}...</p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Fermer</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default CommentsModeration;