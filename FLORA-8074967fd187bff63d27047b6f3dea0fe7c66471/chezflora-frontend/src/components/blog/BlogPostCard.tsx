
import { BlogPost } from "@/types/blog";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BlogPostCardProps {
  post: BlogPost;
  onTagClick?: (tag: string) => void;
  onViewPost?: (post: BlogPost) => void;
}

export const BlogPostCard = ({ post, onTagClick, onViewPost }: BlogPostCardProps) => {
  const navigate = useNavigate();
  
  // Format date to French locale
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  const handleViewPost = () => {
    if (onViewPost) {
      onViewPost(post);
    } else {
      navigate(`/blog/${post.id}`);
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-56 overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
          <Badge variant="outline" className="capitalize">
            {post.category}
          </Badge>
        </div>
        <CardTitle className="font-serif">{post.title}</CardTitle>
        <CardDescription>Par {post.author}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{post.excerpt}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) {
                    onTagClick(tag);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <User size={12} />
          {post.viewCount || 0} vues
        </div>
        <Button 
          variant="ghost"
          onClick={handleViewPost}
        >
          Lire l'article
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
