/*
* Cette page devrait être placée dans:
* /src/pages/admin/NewsletterManagement.tsx
*/

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search,
  Trash2, 
  MoreVertical, 
  Mail,
  Plus,
  Download,
  MailOpen,
  Users,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { NewsletterService } from "@/services/NewsletterService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Schema de validation pour l'ajout d'un abonné
const subscriberFormSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
});

// Schema de validation pour l'envoi d'une newsletter
const newsletterFormSchema = z.object({
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  content: z.string().min(20, "Le contenu doit contenir au moins 20 caractères"),
  testEmail: z.string().email("Veuillez entrer une adresse email valide").optional(),
});

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("subscribers");

  // Initialiser le formulaire d'ajout d'abonné
  const form = useForm<z.infer<typeof subscriberFormSchema>>({
    resolver: zodResolver(subscriberFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Initialiser le formulaire de composition de newsletter
  const newsletterForm = useForm<z.infer<typeof newsletterFormSchema>>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      subject: "",
      content: "",
      testEmail: "",
    },
  });

  // Charger les abonnés
  useEffect(() => {
    loadSubscribers();
  }, []);

  // Filtrer les abonnés quand la recherche change
  useEffect(() => {
    filterSubscribers();
  }, [subscribers, searchQuery]);

  // Charger les abonnés
  const loadSubscribers = () => {
    try {
      const allSubscribers = NewsletterService.getAllSubscribers();
      setSubscribers(allSubscribers);
    } catch (error) {
      console.error("Erreur lors du chargement des abonnés:", error);
      toast.error("Erreur", {
        description: "Impossible de charger la liste des abonnés",
      });
    }
  };

  // Filtrer les abonnés
  const filterSubscribers = () => {
    if (!searchQuery) {
      setFilteredSubscribers(subscribers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = subscribers.filter(email => 
      email.toLowerCase().includes(query)
    );
    setFilteredSubscribers(filtered);
  };

  // Préparer la suppression d'un abonné
  const confirmDeleteSubscriber = (email: string) => {
    setSubscriberToDelete(email);
    setIsDeleteDialogOpen(true);
  };

  // Exécuter la suppression d'un abonné
  const executeDeleteSubscriber = () => {
    if (!subscriberToDelete) return;

    try {
      const success = NewsletterService.removeSubscriber(subscriberToDelete);
      
      if (success) {
        // Mettre à jour la liste locale
        setSubscribers(subscribers.filter(email => email !== subscriberToDelete));
        
        toast.success("Abonné supprimé", {
          description: "L'abonné a été supprimé avec succès",
        });
      } else {
        toast.error("Échec de la suppression", {
          description: "L'abonné n'a pas pu être supprimé",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression de l'abonné",
      });
    } finally {
      setSubscriberToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Exporter la liste des abonnés
  const exportSubscribers = () => {
    try {
      const csv = NewsletterService.exportSubscribersCSV();
      
      // Créer un Blob pour le téléchargement
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Export réussi", {
        description: "La liste des abonnés a été exportée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Échec de l'export", {
        description: "Une erreur est survenue lors de l'export de la liste",
      });
    }
  };

  // Ajouter un abonné
  const handleAddSubscriber = (data: z.infer<typeof subscriberFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      const success = NewsletterService.addSubscriber(data.email);
      
      if (success) {
        // Mettre à jour la liste locale
        loadSubscribers();
        
        toast.success("Abonné ajouté", {
          description: "L'abonné a été ajouté avec succès",
        });
        
        // Fermer le dialogue
        setIsAddDialogOpen(false);
        form.reset();
      } else {
        toast.info("Déjà inscrit", {
          description: "Cet email est déjà abonné à la newsletter",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error("Échec de l'ajout", {
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'ajout de l'abonné",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Envoyer une newsletter (simulation)
  const handleSendNewsletter = (data: z.infer<typeof newsletterFormSchema>) => {
    setIsSending(true);
    
    try {
      // Simulation d'envoi
      setTimeout(() => {
        toast.success("Newsletter envoyée", {
          description: `La newsletter a été envoyée à ${subscribers.length} abonnés.`,
        });
        
        // Fermer le dialogue
        setIsComposeDialogOpen(false);
        newsletterForm.reset();
        setIsSending(false);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Échec de l'envoi", {
        description: "Une erreur est survenue lors de l'envoi de la newsletter",
      });
      setIsSending(false);
    }
  };

  // Envoyer un test
  const handleSendTest = () => {
    const email = newsletterForm.watch("testEmail");
    const subject = newsletterForm.watch("subject");
    
    if (!email) {
      toast.error("Email manquant", {
        description: "Veuillez entrer une adresse email pour le test",
      });
      return;
    }
    
    if (!subject) {
      toast.error("Sujet manquant", {
        description: "Veuillez entrer un sujet pour la newsletter",
      });
      return;
    }
    
    // Simulation d'envoi de test
    toast.info("Envoi de test", {
      description: `Un email de test est envoyé à ${email}...`,
    });
    
    setTimeout(() => {
      toast.success("Test envoyé", {
        description: `Un email de test a été envoyé à ${email}.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter</h1>
          <p className="text-muted-foreground">Gérez les abonnés et envoyez des newsletters.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSubscribers}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button variant="default" onClick={() => setIsComposeDialogOpen(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Nouvelle newsletter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscribers">Abonnés</TabsTrigger>
          <TabsTrigger value="history">Historique d'envois</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscribers" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un abonné..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un abonné
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSubscribers.length === 0 ? (
                <div className="text-center py-8">
                  <MailOpen className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                  <h3 className="font-medium text-lg mb-1">Aucun abonné trouvé</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "Aucun abonné ne correspond à votre recherche" 
                      : "Commencez à collecter des abonnés pour votre newsletter"}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un abonné
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscribers.map((email) => (
                        <TableRow key={email}>
                          <TableCell className="font-medium">{email}</TableCell>
                          <TableCell>
                            {/* Nous n'avons pas la date réelle, donc nous affichons la date actuelle */}
                            {new Date().toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => confirmDeleteSubscriber(email)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Total: {subscribers.length} abonné{subscribers.length !== 1 ? "s" : ""}</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des newsletters</CardTitle>
              <CardDescription>
                Consultez vos newsletters précédentes et leurs statistiques.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                <h3 className="font-medium text-lg mb-1">Aucune newsletter envoyée</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore envoyé de newsletter.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setIsComposeDialogOpen(true)}
                  className="mt-4"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Créer une newsletter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogue de suppression d'abonné */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet abonné ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteSubscriber}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue d'ajout d'abonné */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un abonné</DialogTitle>
            <DialogDescription>
              Ajoutez manuellement un abonné à votre newsletter.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddSubscriber)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="john.doe@example.com"
                          className="pl-10"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Ajout en cours..." : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de composition de newsletter */}
      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Créer une newsletter</DialogTitle>
            <DialogDescription>
              Composez votre newsletter et envoyez-la à vos {subscribers.length} abonnés.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newsletterForm}>
            <form onSubmit={newsletterForm.handleSubmit(handleSendNewsletter)} className="space-y-4">
              <FormField
                control={newsletterForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sujet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sujet de la newsletter"
                        disabled={isSending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newsletterForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contenu de la newsletter..."
                        className="min-h-[200px]"
                        disabled={isSending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border rounded-md p-4 bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Tester avant l'envoi</h4>
                <div className="flex gap-2">
                  <FormField
                    control={newsletterForm.control}
                    name="testEmail"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Entrez votre email pour un test"
                            disabled={isSending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleSendTest}
                    disabled={isSending}
                  >
                    Envoyer un test
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsComposeDialogOpen(false)}
                  disabled={isSending}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSending || subscribers.length === 0}
                >
                  {isSending ? "Envoi en cours..." : `Envoyer à ${subscribers.length} abonnés`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsletterManagement;