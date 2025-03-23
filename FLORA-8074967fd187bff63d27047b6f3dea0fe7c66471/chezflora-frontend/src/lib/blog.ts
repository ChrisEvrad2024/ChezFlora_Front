import { BlogPost, BlogComment, BlogCommentReaction } from "@/types/blog";

// Sample blog posts data - in a real app this would come from an API
export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Les tendances florales de l'automne",
    excerpt: "Découvrez les arrangements floraux qui feront sensation cette saison.",
    content: "L'automne est une saison magique pour les compositions florales. Avec ses couleurs chaudes et ses textures riches, cette période offre une palette somptueuse pour créer des arrangements uniques. Les tons ambrés, les rouges profonds et les oranges chaleureux dominent désormais nos créations. N'hésitez pas à intégrer des éléments naturels comme des branches, des baies, ou même des petites citrouilles décoratives pour un effet saisonnier parfait. Les chrysanthèmes, dahlias et roses d'automne sont particulièrement à l'honneur cette année.",
    date: "15 octobre 2023",
    author: "Sophie Martin",
    category: "tendances",
    imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?q=80&w=2070&auto=format&fit=crop",
    tags: ["automne", "tendances", "décoration"],
    comments: [
      {
        id: 1,
        postId: 1,
        author: "Marie Dupont",
        content: "Superbe article ! J'adore les compositions avec des chrysanthèmes.",
        date: "16 octobre 2023"
      },
      {
        id: 2,
        postId: 1,
        author: "Paul Renard",
        content: "Merci pour ces conseils, je vais essayer d'incorporer plus d'éléments naturels dans mes compositions.",
        date: "17 octobre 2023"
      }
    ],
    featured: true
  },
  {
    id: 2,
    title: "Comment prendre soin de vos orchidées",
    excerpt: "Nos conseils pour maintenir vos orchidées en pleine santé toute l'année.",
    content: "Les orchidées sont souvent considérées comme difficiles à entretenir, mais avec quelques connaissances de base, elles peuvent fleurir pendant des années. La clé réside dans l'arrosage : contrairement à la croyance populaire, les orchidées ne doivent pas être arrosées fréquemment. Un arrosage hebdomadaire est généralement suffisant, en laissant le substrat sécher complètement entre deux arrosages. Placez votre orchidée dans un endroit lumineux mais sans soleil direct. La température idéale se situe entre 18 et 24°C. N'oubliez pas de fertiliser légèrement une fois par mois pendant la période de croissance.",
    date: "28 septembre 2023",
    author: "Pierre Dubois",
    category: "conseils",
    imageUrl: "https://images.unsplash.com/photo-1610631683255-b88ebc25a24a?q=80&w=2070&auto=format&fit=crop",
    tags: ["orchidées", "entretien", "plantes d'intérieur"],
    comments: [
      {
        id: 3,
        postId: 2,
        author: "Jeanne Martin",
        content: "Mon orchidée a recommencé à fleurir grâce à vos conseils. Merci !",
        date: "30 septembre 2023"
      }
    ]
  },
  {
    id: 3,
    title: "Les fleurs de mariage parfaites pour chaque saison",
    excerpt: "Guide complet pour choisir les fleurs idéales selon la saison de votre mariage.",
    content: "Choisir les fleurs de votre mariage en fonction de la saison présente de nombreux avantages : elles seront non seulement plus fraîches et plus belles, mais aussi plus abordables. Au printemps, optez pour des pivoines, tulipes et renoncules. L'été offre une abondance de choix avec les roses, tournesols et hortensias. L'automne invite les dahlias, chrysanthèmes et roses d'automne dans vos bouquets. Et même en hiver, vous pouvez créer des arrangements magnifiques avec des amaryllis, des camélias ou des branches givrées. N'oubliez pas que le style de votre mariage est aussi important que la saison pour déterminer vos choix floraux.",
    date: "5 septembre 2023",
    author: "Marie Laurent",
    category: "evenements",
    imageUrl: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=2070&auto=format&fit=crop",
    tags: ["mariage", "saisonnier", "bouquets"]
  },
  {
    id: 4,
    title: "Plantes d'intérieur : purifiez votre air naturellement",
    excerpt: "Les meilleures plantes pour améliorer la qualité de l'air dans votre maison.",
    content: "Les plantes d'intérieur ne sont pas seulement esthétiques, elles contribuent aussi à purifier l'air que nous respirons. Le lierre commun est excellent pour éliminer les formaldéhydes, tandis que le spathiphyllum (ou fleur de lune) combat le benzène et le trichloréthylène. L'aloe vera, facile à entretenir, libère de l'oxygène pendant la nuit et absorbe le formaldéhyde et le benzène. Le ficus elastica (ou caoutchouc) est particulièrement efficace contre les moisissures de l'air. Pour un effet optimal, prévoyez au moins une plante tous les 10m² et entretenez-les régulièrement pour qu'elles restent en bonne santé.",
    date: "20 août 2023",
    author: "Thomas Petit",
    category: "conseils",
    imageUrl: "https://images.unsplash.com/photo-1502808566587-893971fa72ed?q=80&w=2071&auto=format&fit=crop",
    tags: ["plantes d'intérieur", "purification", "bien-être"]
  },
  {
    id: 5,
    title: "Histoire des arrangements floraux japonais",
    excerpt: "L'art de l'Ikebana et son influence sur le design floral moderne.",
    content: "L'Ikebana, l'art japonais de l'arrangement floral, remonte au VIe siècle et était initialement pratiqué dans les temples bouddhistes. Contrairement aux compositions occidentales qui se concentrent sur l'abondance et la couleur, l'Ikebana met l'accent sur la ligne, la forme et l'espace. Chaque arrangement est considéré comme une méditation en action, où l'asymétrie et la simplicité sont valorisées. Les trois lignes principales représentent traditionnellement le ciel, la terre et l'humanité. Aujourd'hui, l'influence de l'Ikebana est visible dans le minimalisme du design floral contemporain, où l'on apprécie de plus en plus la beauté d'une seule tige ou d'un arrangement épuré.",
    date: "10 août 2023",
    author: "Sophie Martin",
    category: "inspiration",
    imageUrl: "https://images.unsplash.com/photo-1605928061221-5ad10c3c47cd?q=80&w=2073&auto=format&fit=crop",
    tags: ["ikebana", "japon", "histoire", "minimalisme"]
  },
  {
    id: 6,
    title: "Les fleurs comestibles à cultiver chez soi",
    excerpt: "Guide pour cultiver et utiliser des fleurs comestibles dans vos plats.",
    content: "Les fleurs comestibles ajoutent couleur, saveur et élégance à vos plats. Parmi les plus faciles à cultiver chez soi, on trouve la capucine (saveur poivrée), la bourrache (goût de concombre), le souci (substitut de safran) et la violette (parfaite pour les desserts). Assurez-vous toujours que vos fleurs sont cultivées sans pesticides ni produits chimiques. La plupart de ces fleurs peuvent être semées directement en pleine terre au printemps et nécessitent peu d'entretien. Pour les conserver, vous pouvez les faire sécher, les cristalliser dans du sucre ou les congeler dans des glaçons pour décorer vos boissons estivales. N'oubliez pas de n'utiliser que le pétale pour la plupart des fleurs, car les pistils et étamines peuvent être amers.",
    date: "1 août 2023",
    author: "Pierre Dubois",
    category: "conseils",
    imageUrl: "https://images.unsplash.com/photo-1478826162506-15896353da95?q=80&w=2070&auto=format&fit=crop",
    tags: ["fleurs comestibles", "cuisine", "jardinage"]
  }
];

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getBlogPostById(id: number): BlogPost | undefined {
  const post = blogPosts.find(post => post.id === id);
  
  // Increment view count when a post is accessed
  if (post) {
    post.viewCount = (post.viewCount || 0) + 1;
  }
  
  return post;
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category);
}

export function getRecentBlogPosts(count: number = 3): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

export function getPopularBlogPosts(count: number = 3): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, count);
}

export function getFeaturedBlogPosts(count: number = 3): BlogPost[] {
  return [...blogPosts]
    .filter(post => post.featured)
    .slice(0, count);
}

export function searchBlogPosts(query: string): BlogPost[] {
  const lowercaseQuery = query.toLowerCase();
  return blogPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) || 
    post.excerpt.toLowerCase().includes(lowercaseQuery) || 
    post.content?.toLowerCase().includes(lowercaseQuery) ||
    post.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => 
    post.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): string[] {
  const tagsSet = new Set<string>();
  
  blogPosts.forEach(post => {
    post.tags?.forEach(tag => {
      tagsSet.add(tag.toLowerCase());
    });
  });
  
  return Array.from(tagsSet);
}

export function sortBlogPosts(posts: BlogPost[], sortBy: 'date' | 'popularity' | 'title'): BlogPost[] {
  const sortedPosts = [...posts];
  
  switch (sortBy) {
    case 'date':
      return sortedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case 'popularity':
      return sortedPosts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    case 'title':
      return sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sortedPosts;
  }
}

// Comments functions
export function getCommentsForPost(postId: number): BlogComment[] {
  const post = getBlogPostById(postId);
  
  // Get only top-level comments (no parentId)
  const comments = post?.comments?.filter(comment => !comment.parentId) || [];
  
  // Add replies to each comment
  comments.forEach(comment => {
    comment.replies = post?.comments?.filter(reply => reply.parentId === comment.id) || [];
  });
  
  return comments;
}

export function addCommentToPost(
  postId: number, 
  author: string, 
  content: string, 
  parentId?: number,
  email?: string
): BlogComment | null {
  const post = blogPosts.find(p => p.id === postId);
  
  if (!post) return null;
  
  if (!post.comments) {
    post.comments = [];
  }
  
  const newComment: BlogComment = {
    id: Date.now(),
    postId,
    author,
    content,
    date: new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    parentId,
    email,
    reactions: [
      { type: 'like', count: 0 },
      { type: 'love', count: 0 },
      { type: 'laugh', count: 0 }
    ]
  };
  
  post.comments.push(newComment);
  return newComment;
}

export function addReactionToComment(
  postId: number,
  commentId: number,
  reactionType: "like" | "love" | "laugh"
): boolean {
  const post = blogPosts.find(p => p.id === postId);
  if (!post || !post.comments) return false;
  
  const comment = post.comments.find(c => c.id === commentId);
  if (!comment) return false;
  
  if (!comment.reactions) {
    comment.reactions = [
      { type: 'like', count: 0 },
      { type: 'love', count: 0 },
      { type: 'laugh', count: 0 }
    ];
  }
  
  const reaction = comment.reactions.find(r => r.type === reactionType);
  if (reaction) {
    reaction.count += 1;
    return true;
  }
  
  return false;
}
