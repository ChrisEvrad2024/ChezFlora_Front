import { StorageService } from './StorageService';
import { AuthService } from './AuthService';

// Clés de stockage
const BLOG_POSTS_KEY = 'blog_posts';
const BLOG_COMMENTS_KEY = 'blog_comments';
const SCHEDULED_POSTS_KEY = 'scheduled_posts';

// Statuts possibles d'un article
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived'
};

/**
 * Service de gestion du blog
 */
export class BlogService {
  /**
   * Initialise les données de base du blog si elles n'existent pas déjà
   */
  static initializeBlogData() {
    // Vérifier si les articles du blog existent déjà
    const posts = StorageService.getLocalItem(BLOG_POSTS_KEY);
    
    if (!posts || posts.length === 0) {
      // Articles par défaut pour la démo
      const defaultPosts = [
        {
          id: 1,
          title: "Les tendances florales de l'automne",
          excerpt: "Découvrez les arrangements floraux qui feront sensation cette saison.",
          content: "L'automne est une saison magique pour les compositions florales. Avec ses couleurs chaudes et ses textures riches, cette période offre une palette somptueuse pour créer des arrangements uniques. Les tons ambrés, les rouges profonds et les oranges chaleureux dominent désormais nos créations. N'hésitez pas à intégrer des éléments naturels comme des branches, des baies, ou même des petites citrouilles décoratives pour un effet saisonnier parfait. Les chrysanthèmes, dahlias et roses d'automne sont particulièrement à l'honneur cette année.",
          date: new Date("2023-10-15").toISOString(),
          publishDate: new Date("2023-10-15").toISOString(),
          author: "Sophie Martin",
          authorId: "admin1",
          category: "tendances",
          imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?q=80&w=2070&auto=format&fit=crop",
          tags: ["automne", "tendances", "décoration"],
          status: POST_STATUS.PUBLISHED,
          featured: true,
          viewCount: 124,
          createdAt: new Date("2023-10-10").toISOString(),
          updatedAt: new Date("2023-10-15").toISOString()
        },
        {
          id: 2,
          title: "Comment prendre soin de vos orchidées",
          excerpt: "Nos conseils pour maintenir vos orchidées en pleine santé toute l'année.",
          content: "Les orchidées sont souvent considérées comme difficiles à entretenir, mais avec quelques connaissances de base, elles peuvent fleurir pendant des années. La clé réside dans l'arrosage : contrairement à la croyance populaire, les orchidées ne doivent pas être arrosées fréquemment. Un arrosage hebdomadaire est généralement suffisant, en laissant le substrat sécher complètement entre deux arrosages. Placez votre orchidée dans un endroit lumineux mais sans soleil direct. La température idéale se situe entre 18 et 24°C. N'oubliez pas de fertiliser légèrement une fois par mois pendant la période de croissance.",
          date: new Date("2023-09-28").toISOString(),
          publishDate: new Date("2023-09-28").toISOString(),
          author: "Pierre Dubois",
          authorId: "admin1",
          category: "conseils",
          imageUrl: "https://images.unsplash.com/photo-1610631683255-b88ebc25a24a?q=80&w=2070&auto=format&fit=crop",
          tags: ["orchidées", "entretien", "plantes d'intérieur"],
          status: POST_STATUS.PUBLISHED,
          featured: false,
          viewCount: 87,
          createdAt: new Date("2023-09-20").toISOString(),
          updatedAt: new Date("2023-09-28").toISOString()
        }
      ];
      
      // Enregistrer les articles par défaut
      StorageService.setLocalItem(BLOG_POSTS_KEY, defaultPosts);
      console.log('Articles de blog par défaut initialisés');
    }

    // Initialiser les commentaires
    const comments = StorageService.getLocalItem(BLOG_COMMENTS_KEY);
    
    if (!comments) {
      // Commentaires par défaut
      const defaultComments = {
        1: [
          {
            id: 1,
            postId: 1,
            author: "Marie Dupont",
            content: "Superbe article ! J'adore les compositions avec des chrysanthèmes.",
            date: new Date("2023-10-16").toISOString(),
            approved: true,
            reactions: [
              { type: 'like', count: 3 },
              { type: 'love', count: 1 },
              { type: 'laugh', count: 0 }
            ]
          },
          {
            id: 2,
            postId: 1,
            author: "Paul Renard",
            content: "Merci pour ces conseils, je vais essayer d'incorporer plus d'éléments naturels dans mes compositions.",
            date: new Date("2023-10-17").toISOString(),
            approved: true,
            reactions: [
              { type: 'like', count: 2 },
              { type: 'love', count: 0 },
              { type: 'laugh', count: 0 }
            ]
          }
        ],
        2: [
          {
            id: 3,
            postId: 2,
            author: "Jeanne Martin",
            content: "Mon orchidée a recommencé à fleurir grâce à vos conseils. Merci !",
            date: new Date("2023-09-30").toISOString(),
            approved: true,
            reactions: [
              { type: 'like', count: 4 },
              { type: 'love', count: 2 },
              { type: 'laugh', count: 0 }
            ]
          }
        ]
      };
      
      StorageService.setLocalItem(BLOG_COMMENTS_KEY, defaultComments);
      console.log('Commentaires de blog par défaut initialisés');
    }

    // Initialiser les articles programmés
    if (!StorageService.getLocalItem(SCHEDULED_POSTS_KEY)) {
      StorageService.setLocalItem(SCHEDULED_POSTS_KEY, []);
      console.log('Articles programmés initialisés');
    }
  }

  // ==================== Articles du blog ====================

  /**
   * Récupère tous les articles du blog
   * @param {boolean} includeAll Si true, inclut tous les articles, sinon seulement ceux publiés
   * @returns {Array} Liste des articles
   */
  static getAllPosts(includeAll = false) {
    const posts = StorageService.getLocalItem(BLOG_POSTS_KEY) || [];
    
    if (includeAll) {
      return posts;
    }
    
    // Filtrer pour n'avoir que les articles publiés
    return posts.filter(post => post.status === POST_STATUS.PUBLISHED);
  }

  /**
   * Récupère un article par son ID
   * @param {number} id ID de l'article
   * @param {boolean} incrementView Si true, incrémente le compteur de vues
   * @returns {Object|null} Article ou null si non trouvé
   */
  static getPostById(id, incrementView = false) {
    const posts = this.getAllPosts(true);
    const postIndex = posts.findIndex(post => post.id === Number(id));
    
    if (postIndex === -1) return null;
    
    // Incrémenter le compteur de vues si demandé
    if (incrementView) {
      posts[postIndex].viewCount = (posts[postIndex].viewCount || 0) + 1;
      StorageService.setLocalItem(BLOG_POSTS_KEY, posts);
    }
    
    return posts[postIndex];
  }

  /**
   * Récupère les articles par statut
   * @param {string} status Statut des articles à récupérer
   * @returns {Array} Articles filtrés par statut
   */
  static getPostsByStatus(status) {
    const posts = this.getAllPosts(true);
    return posts.filter(post => post.status === status);
  }

  /**
   * Récupère les articles par catégorie
   * @param {string} category Catégorie des articles
   * @returns {Array} Articles filtrés par catégorie
   */
  static getPostsByCategory(category) {
    const posts = this.getAllPosts();
    return posts.filter(post => post.category === category);
  }

  /**
   * Récupère les articles par tag
   * @param {string} tag Tag à rechercher
   * @returns {Array} Articles ayant ce tag
   */
  static getPostsByTag(tag) {
    const posts = this.getAllPosts();
    return posts.filter(post => 
      post.tags && post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  /**
   * Récupère les articles les plus récents
   * @param {number} count Nombre d'articles à récupérer
   * @returns {Array} Articles récents
   */
  static getRecentPosts(count = 3) {
    const posts = this.getAllPosts();
    
    // Trier par date de publication (plus récent d'abord)
    return posts
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, count);
  }

  /**
   * Récupère les articles populaires
   * @param {number} count Nombre d'articles à récupérer
   * @returns {Array} Articles populaires
   */
  static getPopularPosts(count = 3) {
    const posts = this.getAllPosts();
    
    // Trier par nombre de vues
    return posts
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, count);
  }

  /**
   * Récupère les articles mis en avant
   * @param {number} count Nombre d'articles à récupérer
   * @returns {Array} Articles mis en avant
   */
  static getFeaturedPosts(count = 3) {
    const posts = this.getAllPosts();
    
    // Filtrer les articles mis en avant
    return posts
      .filter(post => post.featured)
      .slice(0, count);
  }

  /**
   * Crée un nouvel article
   * @param {Object} postData Données de l'article
   * @returns {Object} Article créé
   */
  static createPost(postData) {
    const posts = this.getAllPosts(true);
    
    // Générer un nouvel ID
    const newId = posts.length > 0 
      ? Math.max(...posts.map(post => post.id)) + 1 
      : 1;
    
    // Récupérer l'utilisateur courant pour l'auteur
    const currentUser = AuthService.getCurrentUser();
    
    // Créer le nouvel article
    const newPost = {
      id: newId,
      title: postData.title || 'Sans titre',
      excerpt: postData.excerpt || '',
      content: postData.content || '',
      date: new Date().toISOString(),
      publishDate: postData.status === POST_STATUS.PUBLISHED 
        ? new Date().toISOString() 
        : null,
      author: currentUser 
        ? `${currentUser.firstName} ${currentUser.lastName}` 
        : postData.authorName || 'Auteur inconnu',
      authorId: currentUser ? currentUser.id : postData.authorId,
      category: postData.category || 'Non classé',
      imageUrl: postData.imageUrl || '',
      tags: postData.tags || [],
      status: postData.status || POST_STATUS.DRAFT,
      featured: postData.featured || false,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Si l'article est programmé, l'ajouter à la liste des programmations
    if (postData.status === POST_STATUS.SCHEDULED && postData.scheduledDate) {
      const scheduledDate = new Date(postData.scheduledDate);
      if (scheduledDate > new Date()) {
        const scheduledPosts = StorageService.getLocalItem(SCHEDULED_POSTS_KEY) || [];
        scheduledPosts.push({
          postId: newId,
          scheduledDate: scheduledDate.toISOString()
        });
        StorageService.setLocalItem(SCHEDULED_POSTS_KEY, scheduledPosts);
      }
    }
    
    // Ajouter l'article à la liste
    posts.push(newPost);
    StorageService.setLocalItem(BLOG_POSTS_KEY, posts);
    
    return newPost;
  }

  /**
   * Met à jour un article existant
   * @param {number} id ID de l'article
   * @param {Object} postData Nouvelles données
   * @returns {Object|null} Article mis à jour ou null si non trouvé
   */
  static updatePost(id, postData) {
    const posts = this.getAllPosts(true);
    const postIndex = posts.findIndex(post => post.id === Number(id));
    
    if (postIndex === -1) return null;
    
    // Si le statut change vers 'publié', définir la date de publication
    if (postData.status === POST_STATUS.PUBLISHED && 
        posts[postIndex].status !== POST_STATUS.PUBLISHED) {
      postData.publishDate = new Date().toISOString();
    }
    
    // Si l'article est programmé, mettre à jour la liste des programmations
    if (postData.status === POST_STATUS.SCHEDULED && postData.scheduledDate) {
      const scheduledDate = new Date(postData.scheduledDate);
      if (scheduledDate > new Date()) {
        const scheduledPosts = StorageService.getLocalItem(SCHEDULED_POSTS_KEY) || [];
        
        // Supprimer toute programmation existante pour cet article
        const filteredScheduled = scheduledPosts.filter(item => item.postId !== Number(id));
        
        // Ajouter la nouvelle programmation
        filteredScheduled.push({
          postId: Number(id),
          scheduledDate: scheduledDate.toISOString()
        });
        
        StorageService.setLocalItem(SCHEDULED_POSTS_KEY, filteredScheduled);
      }
    } else if (posts[postIndex].status === POST_STATUS.SCHEDULED) {
      // Si l'article n'est plus programmé, supprimer de la liste des programmations
      const scheduledPosts = StorageService.getLocalItem(SCHEDULED_POSTS_KEY) || [];
      const filteredScheduled = scheduledPosts.filter(item => item.postId !== Number(id));
      StorageService.setLocalItem(SCHEDULED_POSTS_KEY, filteredScheduled);
    }
    
    // Mettre à jour l'article
    const updatedPost = {
      ...posts[postIndex],
      ...postData,
      id: Number(id), // Garantir que l'ID reste le même
      updatedAt: new Date().toISOString()
    };
    
    posts[postIndex] = updatedPost;
    StorageService.setLocalItem(BLOG_POSTS_KEY, posts);
    
    return updatedPost;
  }

  /**
   * Supprime un article
   * @param {number} id ID de l'article
   * @returns {boolean} Succès ou échec
   */
  static deletePost(id) {
    const posts = this.getAllPosts(true);
    const numericId = Number(id);
    const newPosts = posts.filter(post => post.id !== numericId);
    
    // Vérifier si un article a été supprimé
    if (newPosts.length === posts.length) return false;
    
    // Supprimer les commentaires associés
    const comments = StorageService.getLocalItem(BLOG_COMMENTS_KEY) || {};
    delete comments[numericId];
    
    // Supprimer de la liste des programmations
    const scheduledPosts = StorageService.getLocalItem(SCHEDULED_POSTS_KEY) || [];
    const filteredScheduled = scheduledPosts.filter(item => item.postId !== numericId);
    
    // Sauvegarder les changements
    StorageService.setLocalItem(BLOG_POSTS_KEY, newPosts);
    StorageService.setLocalItem(BLOG_COMMENTS_KEY, comments);
    StorageService.setLocalItem(SCHEDULED_POSTS_KEY, filteredScheduled);
    
    return true;
  }

  /**
   * Programme la publication d'un article
   * @param {number} id ID de l'article
   * @param {Date|string} scheduledDate Date de publication programmée
   * @returns {Object|null} Article mis à jour ou null si non trouvé
   */
  static schedulePost(id, scheduledDate) {
    const dateObj = typeof scheduledDate === 'string' 
      ? new Date(scheduledDate) 
      : scheduledDate;
    
    // Vérifier que la date est future
    if (dateObj <= new Date()) {
      throw new Error("La date de programmation doit être dans le futur");
    }
    
    return this.updatePost(id, {
      status: POST_STATUS.SCHEDULED,
      scheduledDate: dateObj.toISOString()
    });
  }

  /**
   * Recherche des articles
   * @param {string} query Terme de recherche
   * @returns {Array} Articles correspondants
   */
  static searchPosts(query) {
    if (!query) return this.getAllPosts();
    
    const posts = this.getAllPosts();
    const searchTerm = query.toLowerCase();
    
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.author.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }

  /**
   * Vérifie et publie les articles programmés dont la date est passée
   * Cette méthode devrait être appelée à intervalle régulier
   * @returns {number} Nombre d'articles publiés
   */
  static publishScheduledPosts() {
    const scheduledPosts = StorageService.getLocalItem(SCHEDULED_POSTS_KEY) || [];
    const now = new Date();
    let publishedCount = 0;


    const handleSavePost = (formData) => {
        try {
          let newPost;
          
          if (editingPost) {
            // Mise à jour d'un article existant
            newPost = {
              id: parseInt(editingPost.id),
              title: formData.title,
              excerpt: formData.excerpt,
              content: formData.content,
              category: formData.category,
              tags: formData.tags,
              status: formData.status,
              imageUrl: formData.imageUrl,
              featured: formData.featured,
              author: formData.authorName,
              date: formData.publishDate instanceof Date 
                ? formData.publishDate.toISOString() 
                : new Date().toISOString()
            };
            
            // Mettre à jour la liste locale
            setPosts(posts.map(p => p.id === newPost.id ? newPost : p));
            
            toast.success("Article mis à jour", {
              description: "Les modifications ont été enregistrées avec succès"
            });
          } else {
            // Création d'un nouvel article
            newPost = {
              id: Date.now(), // Utiliser timestamp comme ID temporaire
              title: formData.title,
              excerpt: formData.excerpt,
              content: formData.content,
              category: formData.category,
              tags: formData.tags,
              status: formData.status,
              imageUrl: formData.imageUrl,
              featured: formData.featured || false,
              author: formData.authorName,
              date: new Date().toISOString()
            };
            
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
    
    // Filtrer les articles dont la date de publication est passée
    const toPublish = scheduledPosts.filter(item => new Date(item.scheduledDate) <= now);
    
    // Publier chaque article
    toPublish.forEach(item => {
      const post = this.getPostById(item.postId);
      if (post && post.status === POST_STATUS.SCHEDULED) {
        this.updatePost(item.postId, {
          status: POST_STATUS.PUBLISHED,
          publishDate: now.toISOString()
        });
        publishedCount++;
      }
    });
    
    // Mettre à jour la liste des programmations
    const remainingScheduled = scheduledPosts.filter(item => new Date(item.scheduledDate) > now);
    StorageService.setLocalItem(SCHEDULED_POSTS_KEY, remainingScheduled);
    
    return publishedCount;
  }

  // ==================== Gestion des commentaires ====================

  /**
   * Récupère tous les commentaires d'un article
   * @param {number} postId ID de l'article
   * @param {boolean} onlyApproved Si true, ne retourne que les commentaires approuvés
   * @returns {Array} Commentaires de l'article
   */
  static getComments(postId, onlyApproved = true) {
    const comments = StorageService.getLocalItem(BLOG_COMMENTS_KEY) || {};
    const postComments = comments[postId] || [];
    
    if (onlyApproved) {
      return postComments.filter(comment => comment.approved);
    }
    
    return postComments;
  }

  /**
   * Récupère tous les commentaires en attente de modération
   * @returns {Array} Commentaires en attente
   */
  static getPendingComments() {
    const allComments = StorageService.getLocalItem(BLOG_COMMENTS_KEY) || {};
    const pendingComments = [];
    
    // Parcourir tous les commentaires
    Object.keys(allComments).forEach(postId => {
      const postComments = allComments[postId] || [];
      const pending = postComments.filter(comment => !comment.approved);
      
      // Ajouter le postId aux commentaires pour identification
      pending.forEach(comment => {
        pendingComments.push({
          ...comment,
          postId: Number(postId)
        });
      });
    });
    
    return pendingComments;
  }

  /**
   * Ajoute un commentaire à un article
   * @param {number} postId ID de l'article
   * @param {string} author Nom de l'auteur
   * @param {string} content Contenu du commentaire
   * @param {Object} options Options supplémentaires
   * @returns {Object|null} Commentaire ajouté ou null si échec
   */
  static addComment(postId, author, content, options = {}) {
    // Vérifier si l'article existe
    const post = this.getPostById(postId);
    if (!post) return null;
    
    const comments = StorageService.getLocalItem(BLOG_COMMENTS_KEY) || {};
    const postComments = comments[postId] || [];
    
    // Générer un ID pour le commentaire
    const commentId = postComments.length > 0 
      ? Math.max(...postComments.map(c => c.id)) + 1 
      : 1;
    
    // Déterminer si le commentaire doit être approuvé automatiquement
    const needsApproval = options.needsApproval !== undefined 
      ? options.needsApproval 
      : true;
    
    // Créer le commentaire
    const newComment = {
      id: commentId,
      postId: Number(postId),
      author: author,
      content: content,
      date: new Date().toISOString(),
      approved: !needsApproval,
      parentId: options.parentId || null,
      email: options.email || null,
      reactions: [
        { type: 'like', count: 0 },
        { type: 'love', count: 0 },
        { type: 'laugh', count: 0 }
      ]
    };
    
    // Ajouter le commentaire
    postComments.push(newComment);
    comments[postId] = postComments;
    
    StorageService.setLocalItem(BLOG_COMMENTS_KEY, comments);
    
    return newComment;
  }

  /**
   * Approuve un commentaire
   * @param {number} postId ID de l'article
   * @param {number} commentId ID du commentaire
   * @returns {boolean} Succès ou échec
   */
  static approveComment(postId, commentId) {
    const comments = StorageService.getLocalItem(BLOG_COMMENTS_KEY) || {};
    const postComments = comments[postId] || [];
    
    const commentIndex = postComments.findIndex(c => c.id === Number(commentId));
    if (commentIndex === -1) return false;
    
    // Approuver le commentaire
    postComments[commentIndex].approved = true;
    comments[postId] = postComments;
    
    StorageService.setLocalItem(BLOG_COMMENTS_KEY, comments);
    
    return true;
  }

  /**
   * Supprime un commentaire
   * @param {number} postId ID de l'article
   * @param {number} commentId ID du commentaire
   * @returns {boolean} Succès ou échec
   */
  static deleteComment(postId, commentId) {
    const comments = StorageService.getLocalItem(BLOG_COMMENTS_KEY) || {};
    const postComments = comments[postId] || [];
    
    // Filtrer pour supprimer le commentaire
    const newComments = postComments.filter(c => c.id !== Number(commentId));
    
    // Vérifier qu'un commentaire a été supprimé
    if (newComments.length === postComments.length) return false;
    
    comments[postId] = newComments;
    StorageService.setLocalItem(BLOG_COMMENTS_KEY, comments);
    
    return true;
  }

  /**
   * Ajoute une réaction à un commentaire
   * @param {number} postId ID de l'article
   * @param {number} commentId ID du commentaire
   * @param {string} reactionType Type de réaction
   * @returns {boolean} Succès ou échec
   */
  static addReaction(postId, commentId, reactionType) {
    const comments = StorageService.getLocalItem(BLOG_COMMENTS_KEY) || {};
    const postComments = comments[postId] || [];
    
    const commentIndex = postComments.findIndex(c => c.id === Number(commentId));
    if (commentIndex === -1) return false;
    
    // Trouver et incrémenter la réaction
    const comment = postComments[commentIndex];
    const reactionIndex = comment.reactions.findIndex(r => r.type === reactionType);
    
    if (reactionIndex === -1) return false;
    
    comment.reactions[reactionIndex].count++;
    comments[postId] = postComments;
    
    StorageService.setLocalItem(BLOG_COMMENTS_KEY, comments);
    
    return true;
  }

  // ==================== Utilitaires ====================

  /**
   * Récupère tous les tags utilisés dans les articles
   * @returns {Array} Liste des tags uniques
   */
  static getAllTags() {
    const posts = this.getAllPosts();
    const tags = new Set();
    
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => tags.add(tag.toLowerCase()));
      }
    });
    
    return Array.from(tags);
  }

  /**
   * Récupère toutes les catégories utilisées dans les articles
   * @returns {Array} Liste des catégories uniques
   */
  static getAllCategories() {
    const posts = this.getAllPosts();
    const categories = new Set();
    
    posts.forEach(post => {
      if (post.category) {
        categories.add(post.category);
      }
    });
    
    return Array.from(categories);
  }

  /**
   * Trie les articles selon différents critères
   * @param {Array} posts Liste d'articles à trier
   * @param {string} sortBy Critère de tri
   * @returns {Array} Articles triés
   */
  static sortPosts(posts, sortBy = 'date') {
    const sortedPosts = [...posts];
    
    switch (sortBy) {
      case 'date':
        return sortedPosts.sort((a, b) => new Date(b.publishDate || b.date) - new Date(a.publishDate || a.date));
      case 'title':
        return sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
      case 'views':
        return sortedPosts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case 'comments':
        const comments = StorageService.getLocalItem(BLOG_COMMENTS_KEY) || {};
        return sortedPosts.sort((a, b) => {
          const aComments = comments[a.id] || [];
          const bComments = comments[b.id] || [];
          return bComments.length - aComments.length;
        });
      default:
        return sortedPosts;
    }
  }
}