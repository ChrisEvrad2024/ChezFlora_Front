
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentBlogPosts } from "@/lib/blog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, User, Eye, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FeaturedPosts() {
  const navigate = useNavigate();
  const recentPosts = getRecentBlogPosts(3);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  const handleReadMore = (postId: number) => {
    navigate(`/blog/${postId}`);
  };
  
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif mb-3">Notre Blog</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos derniers articles sur l'univers des fleurs et des plantes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden h-full flex flex-col group">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                />
              </div>
              <CardHeader className="flex-grow">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>{post.author}</span>
                  </div>
                  {post.viewCount && (
                    <div className="flex items-center gap-1">
                      <Eye size={12} />
                      <span>{post.viewCount} vues</span>
                    </div>
                  )}
                </div>
                <CardTitle className="font-serif group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-2 capitalize">
                    {post.category}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors"
                  onClick={() => handleReadMore(post.id)}
                >
                  <span>Lire l'article</span>
                  <ArrowRight size={16} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button onClick={() => navigate("/blog")} variant="default" className="group">
            <span>Voir tous les articles</span>
            <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
