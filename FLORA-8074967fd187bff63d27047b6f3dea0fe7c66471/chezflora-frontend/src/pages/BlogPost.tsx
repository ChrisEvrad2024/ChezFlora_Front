
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  MessageCircle, 
  Share, 
  Facebook, 
  Twitter, 
  Linkedin,
  ThumbsUp,
  Heart,
  Smile,
  Reply,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  getBlogPostById, 
  addCommentToPost, 
  getCommentsForPost,
  addReactionToComment 
} from "@/lib/blog";
import { BlogPost, BlogComment } from "@/types/blog";
import { toast } from "sonner";
import { getAllProducts, getProductsByCategory } from "@/lib/data";
import ProductCard from "@/components/shared/ProductCard";

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const blogPost = getBlogPostById(Number(id));
      if (blogPost) {
        setPost(blogPost);
        setComments(getCommentsForPost(Number(id)));
        document.title = `${blogPost.title} | Floral Paradise Blog`;
        
        // Get related products based on blog category
        const products = blogPost.category === "conseils" 
          ? getProductsByCategory("plantes") 
          : getAllProducts().slice(0, 3);
        setRelatedProducts(products);
      } else {
        navigate("/blog");
      }
    }
    setIsLoading(false);
  }, [id, navigate]);

  const handleBackToBlog = () => {
    navigate("/blog");
  };

  // Format date to French locale
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Share post
  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    if (!post) return;
    
    const url = window.location.href;
    const title = post.title;
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Submit comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentName.trim() || !commentContent.trim() || !id) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newComment = addCommentToPost(
        Number(id),
        commentName,
        commentContent,
        replyingTo || undefined,
        commentEmail || undefined
      );
      
      if (newComment) {
        // Refresh comments from the source
        setComments(getCommentsForPost(Number(id)));
        
        // Reset form
        setCommentName("");
        setCommentEmail("");
        setCommentContent("");
        setReplyingTo(null);
        
        toast.success("Votre commentaire a été ajouté avec succès !");
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
    if (!id) return;
    
    const success = addReactionToComment(Number(id), commentId, reactionType);
    if (success) {
      // Refresh comments
      setComments(getCommentsForPost(Number(id)));
      toast.success("Merci pour votre réaction !");
    }
  };

  // Start replying to a comment
  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    
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

  // Render a single comment
  const renderComment = (comment: BlogComment) => (
    <div key={comment.id} className="p-4 bg-muted/20 rounded-lg border border-border/50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{comment.author}</h4>
        <span className="text-xs text-muted-foreground">
          {formatDate(comment.date)}
        </span>
      </div>
      <p className="text-sm mb-3">{comment.content}</p>
      
      {/* Comment actions */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex gap-3">
          {comment.reactions?.map((reaction) => (
            <button 
              key={reaction.type}
              onClick={() => handleReaction(comment.id, reaction.type as "like" | "love" | "laugh")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
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
        >
          <Reply size={14} />
          <span>Répondre</span>
        </button>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 mt-4 border-l-2 border-border/50 space-y-4">
          {comment.replies.map(reply => (
            <div key={reply.id} className="p-3 bg-background rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium text-sm">{reply.author}</h5>
                <span className="text-xs text-muted-foreground">
                  {formatDate(reply.date)}
                </span>
              </div>
              <p className="text-sm">{reply.content}</p>
              
              {/* Reply actions */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex gap-3">
                  {reply.reactions?.map((reaction) => (
                    <button 
                      key={reaction.type}
                      onClick={() => handleReaction(reply.id, reaction.type as "like" | "love" | "laugh")}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Chargement de l'article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            L'article que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={handleBackToBlog}>
            Retour au blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={handleBackToBlog}
            className="mb-6 flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Retour au blog
          </Button>
          
          <div className="rounded-lg overflow-hidden mb-8">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
          
          <div className="mb-8">
            <h1 className="text-4xl font-serif mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{post.viewCount || 1} vues</span>
              </div>
              <Badge variant="outline" className="ml-auto capitalize">
                {post.category}
              </Badge>
            </div>
            
            <p className="text-lg font-medium mb-6">{post.excerpt}</p>
            
            <div className="prose prose-stone max-w-none">
              <p className="whitespace-pre-line">{post.content}</p>
            </div>
          </div>
          
          {/* Social Sharing Section */}
          <div className="my-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted/20 rounded-lg border">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-medium mb-1">Partager cet article</h3>
              <p className="text-sm text-muted-foreground">Si vous avez aimé cet article, partagez-le !</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-[#3b5998] text-white hover:bg-[#3b5998]/90"
                onClick={() => handleShare('facebook')}
              >
                <Facebook size={18} />
                <span className="sr-only">Partager sur Facebook</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90"
                onClick={() => handleShare('twitter')}
              >
                <Twitter size={18} />
                <span className="sr-only">Partager sur Twitter</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="bg-[#0077B5] text-white hover:bg-[#0077B5]/90"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin size={18} />
                <span className="sr-only">Partager sur LinkedIn</span>
              </Button>
            </div>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} />
                <span className="font-medium">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <section className="mt-12 pt-6 border-t">
              <h2 className="text-2xl font-serif mb-6">Articles en relation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
          
          {/* Comments Section */}
          <div className="mt-12">
            <Separator className="my-8" />
            
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle size={20} />
              <h2 className="text-2xl font-serif">Commentaires</h2>
              <span className="text-muted-foreground ml-2">
                ({comments.length})
              </span>
            </div>
            
            {comments.length > 0 ? (
              <div className="space-y-6 mb-10">
                {comments.map(renderComment)}
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
                    Vous répondez à un commentaire
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
                    placeholder="Votre commentaire..."
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
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPostPage;
