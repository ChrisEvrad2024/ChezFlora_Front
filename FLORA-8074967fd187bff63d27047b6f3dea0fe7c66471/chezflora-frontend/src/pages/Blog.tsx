
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Calendar, User, Tag, ArrowLeft, SortAsc, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  getAllBlogPosts, 
  getBlogPostById, 
  getAllTags,
  getBlogPostsByTag,
  sortBlogPosts
} from "@/lib/blog";
import { BlogPost } from "@/types/blog";

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const postId = searchParams.get("id");
  const tagParam = searchParams.get("tag");
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'date' | 'popularity' | 'title'>('date');
  
  // Get all blog posts and tags
  const allPosts = getAllBlogPosts();
  const allTags = getAllTags();
  
  // Filter posts based on category, tag, and search query
  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesTag = activeTag === "" || post.tags?.some(tag => tag.toLowerCase() === activeTag.toLowerCase());
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesTag && matchesSearch;
  });
  
  // Sort the filtered posts
  const sortedPosts = sortBlogPosts(filteredPosts, sortOrder);

  // Handle view post detail
  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post);
    setSearchParams({ id: post.id.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load post from URL parameter
  useEffect(() => {
    if (postId) {
      const post = getBlogPostById(Number(postId));
      if (post) {
        setSelectedPost(post);
      } else {
        // If post not found, clear the URL param
        setSearchParams({});
      }
    }
  }, [postId, setSearchParams]);
  
  // Handle tag filter from URL
  useEffect(() => {
    if (tagParam) {
      setActiveTag(tagParam);
    }
  }, [tagParam]);

  // Handle back to posts list
  const handleBackToPosts = () => {
    setSelectedPost(null);
    setActiveTag("");
    setSearchParams({});
  };
  
  // Handle filtering by tag
  const handleTagFilter = (tag: string) => {
    setActiveTag(tag);
    setSearchParams({ tag });
    setSelectedPost(null);
  };
  
  // Handle clearing tag filter
  const handleClearTagFilter = () => {
    setActiveTag("");
    setSearchParams({});
  };
  
  // Handle sort order change
  const handleSortChange = (sortBy: 'date' | 'popularity' | 'title') => {
    setSortOrder(sortBy);
  };

  // Format date to French locale
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-16 container mx-auto px-4">
        {selectedPost ? (
          // Single blog post view
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={handleBackToPosts}
              className="mb-6 flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Retour aux articles
            </Button>
            
            <div className="rounded-lg overflow-hidden mb-8">
              <img 
                src={selectedPost.imageUrl} 
                alt={selectedPost.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
            
            <div className="mb-8">
              <h1 className="text-4xl font-serif mb-4">{selectedPost.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{formatDate(selectedPost.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={16} />
                  <span>{selectedPost.author}</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {selectedPost.category}
                </Badge>
              </div>
              
              <p className="text-lg font-medium mb-6">{selectedPost.excerpt}</p>
              
              <div className="prose prose-stone max-w-none">
                <p className="whitespace-pre-line">{selectedPost.content}</p>
              </div>
            </div>
            
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={16} />
                  <span className="font-medium">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        handleTagFilter(tag);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Blog posts list view
          <>
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-serif mb-4">Notre Blog</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Découvrez nos articles sur l'univers des fleurs, des conseils d'entretien et les dernières tendances florales.
              </p>
            </div>
            
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un article..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto justify-end">
                  {activeTag && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearTagFilter}
                      className="flex items-center gap-1"
                    >
                      <Tag size={14} />
                      {activeTag} ×
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Filter size={14} />
                        Filtrer par tags
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                      {allTags.map((tag) => (
                        <DropdownMenuItem 
                          key={tag} 
                          onClick={() => handleTagFilter(tag)}
                          className="capitalize"
                        >
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <SortAsc size={14} />
                        Trier
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleSortChange('date')}
                        className={sortOrder === 'date' ? 'bg-accent' : ''}
                      >
                        Date de publication
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleSortChange('popularity')}
                        className={sortOrder === 'popularity' ? 'bg-accent' : ''}
                      >
                        Popularité
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleSortChange('title')}
                        className={sortOrder === 'title' ? 'bg-accent' : ''}
                      >
                        Titre
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
              <div className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="conseils">Conseils</TabsTrigger>
                  <TabsTrigger value="tendances">Tendances</TabsTrigger>
                  <TabsTrigger value="evenements">Événements</TabsTrigger>
                  <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value={activeCategory} className="mt-8">
                {activeTag && (
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      <p className="text-lg font-medium">
                        Articles tagués: <span className="font-bold capitalize">{activeTag}</span>
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClearTagFilter}>
                      Supprimer le filtre
                    </Button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden h-full flex flex-col">
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
                                  handleTagFilter(tag);
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
                          onClick={() => handleViewPost(post)}
                        >
                          Lire l'article
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                  {sortedPosts.length === 0 && (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-muted-foreground">Aucun article trouvé pour cette recherche.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            {filteredPosts.length > 0 && filteredPosts.length < allPosts.length && (
              <div className="mt-10 text-center">
                <Button onClick={() => {
                  setActiveCategory("all");
                  setActiveTag("");
                  setSearchQuery("");
                  setSearchParams({});
                }}>
                  Voir tous les articles
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPage;
