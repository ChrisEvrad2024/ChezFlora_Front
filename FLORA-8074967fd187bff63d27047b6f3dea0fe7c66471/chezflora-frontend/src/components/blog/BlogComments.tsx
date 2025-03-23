// src/components/blog/BlogComments.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  ThumbsUp, 
  Heart, 
  Smile, 
  Reply, 
  X,
  AlertTriangle
} from "lucide-react";
import { BlogService } from "@/services/BlogService";
import { BlogComment } from "@/types/blog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BlogCommentsProps {
  postId: number;
  initialComments?: BlogComment[];
}

const BlogComments: React.FC<BlogCommentsProps> = ({ 
  postId, 
  initialComments = [] 
}) => {
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // Charger les commentaires à partir du service
  useEffect(() => {
    const loadedComments = BlogService.getComments(postId);
    if (loadedComments.length > 0) {
      setComments(loadedComments);
    }
  }, [postId]);

  // Format date to French locale
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Submit comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentName.trim() || !commentContent.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newComment = BlogService.addComment(
        postId,
        commentName,
        commentContent,
        commentEmail,
        replyingTo || undefined
      );
      
      if (newComment) {
        // Actualiser les commentaires
        const updatedComments = BlogService.getComments(postId);
        setComments(updatedComments);
        
        // Réinitialiser le formulaire
        setCommentName("");
        setCommentEmail("");
        setCommentContent("");
        setReplyingTo(null);
        
        toast.success(replyingTo 
          ? "Votre réponse a été ajoutée avec succès !" 
          : "Votre commentaire a été ajouté avec succès !"
        );
      } else {
        toast.error("Une erreur est survenue lors de l'ajout du commentaire.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Une erreur est survenue lors de l'ajout du commentaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reaction to comment
  const handleReaction = (commentId: number, reactionType: "like" | "love" | "laugh") => {
    const success = BlogService.addReaction(postId, commentId, reactionType);
    
    if (success) {
      // Refresh comments
      const updatedComments = BlogService.getComments(postId);
      setComments(updatedComments);
      toast.success("Merci pour votre réaction !");
    } else {
      toast.error("Impossible d'ajouter votre réaction.");
    }
  };

  // Start replying to a comment
  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    
    // Clear form in case there was content
    setCommentContent("");
    
    // Scroll to comment form
    const formElement = document.getElementById('comment-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Get parent comment info for reply context
  const getParentComment = (parentId: number | undefined) => {
    if (!parentId) return null;
    return comments.find(c => c.id === parentId);
  };

  // Organize comments and replies
  const organizedComments = comments.filter(comment => !comment.parentId);

  // Render a single comment
  const renderComment = (comment: BlogComment) => {
    // Get all replies for this comment
    const replies = comments.filter(c => c.parentId === comment.id);
    
    return (
      <div key={comment.id} className="p-4 bg-muted/20 rounded-lg border border-border/50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">{comment.author}</h4>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.date)}
          </span>
        </div>
        <p className="text-sm mb-3 whitespace-pre-line">{comment.content}</p>
        
        {/* Comment actions */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex gap-3">
            {comment.reactions?.map((reaction) => (
              <button 
                key={reaction.type}
                onClick={() => handleReaction(comment.id, reaction.type as "like" | "love" | "laugh")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Réagir avec ${reaction.type}`}
                title={`Réagir avec ${reaction.type}`}
              >
                {reaction.type === 'like' && <ThumbsUp size={14} />}
                {reaction.type === 'love' && <Heart size={14} />}
                {reaction.type === 'laugh' && <Smile size={14} />}
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => handleReply(comment.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            aria-label="Répondre à ce commentaire"
          >
            <Reply size={14} />
            <span>Répondre</span>
          </button>
        </div>
        
        {/* Replies */}
        {replies.length > 0 && (
          <div className="pl-4 mt-4 border-l-2 border-border/50 space-y-4">
            {replies.map(reply => (
              <div key={reply.id} className="p-3 bg-background rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">{reply.author}</h5>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(reply.date)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-line">{reply.content}</p>
                
                {/* Reply actions */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex gap-3">
                    {reply.reactions?.map((reaction) => (
                      <button 
                        key={reaction.type}
                        onClick={() => handleReaction(reply.id, reaction.type as "like" | "love" | "laugh")}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`Réagir avec ${reaction.type}`}
                        title={`Réagir avec ${reaction.type}`}
                      >
                        {reaction.type === 'like' && <ThumbsUp size={14} />}
                        {reaction.type === 'love' && <Heart size={14} />}
                        {reaction.type === 'laugh' && <Smile size={14} />}
                        <span>{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <Separator className="my-8" />
      
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} />
        <h2 className="text-2xl font-serif">Commentaires</h2>
        <span className="text-muted-foreground ml-2">
          ({organizedComments.length})
        </span>
      </div>
      
      {/* Display login alert */}
      {showLoginAlert && (
        <Alert className="mb-6 bg-muted/30">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="flex items-center justify-between">
            <span>Connectez-vous pour gérer vos commentaires.</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLoginAlert(false)}
              className="p-0 h-8 w-8"
            >
              <X size={16} />
              <span className="sr-only">Fermer</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {organizedComments.length > 0 ? (
        <div className="space-y-6 mb-10">
          {organizedComments.map(renderComment)}
        </div>
      ) : (
        <div className="text-center my-10 p-6 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">
            Soyez le premier à commenter cet article !
          </p>
        </div>
      )}
      
      {/* Add Comment Form */}
      <div className="mt-8" id="comment-form">
        <h3 className="text-xl font-serif mb-4">
          {replyingTo 
            ? "Répondre à un commentaire" 
            : "Laisser un commentaire"
          }
        </h3>
        
        {replyingTo && (
          <div className="mb-4 flex items-center justify-between bg-muted/30 p-3 rounded-md">
            <p className="text-sm">
              Vous répondez à <strong>{getParentComment(replyingTo)?.author || "un commentaire"}</strong>
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={cancelReply} 
              className="text-muted-foreground"
            >
              Annuler
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Votre nom"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email (optionnel)
              </label>
              <Input
                id="email"
                type="email"
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                placeholder="Votre email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Commentaire <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="comment"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={replyingTo 
                ? "Écrivez votre réponse..." 
                : "Partagez votre opinion sur cet article..."
              }
              rows={4}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? "Envoi en cours..." 
              : replyingTo 
                ? "Publier la réponse" 
                : "Publier le commentaire"
            }
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BlogComments;