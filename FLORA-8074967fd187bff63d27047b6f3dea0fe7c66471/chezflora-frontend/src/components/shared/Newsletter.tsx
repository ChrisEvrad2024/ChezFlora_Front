import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Mail, ArrowRight, Check } from "lucide-react";

// Schéma de validation pour l'email
const newsletterFormSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

interface NewsletterProps {
  variant?: "default" | "footer";
}

const Newsletter = ({ variant = "default" }: NewsletterProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialiser le formulaire
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (data: NewsletterFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans une application réelle, vous appelleriez votre API ici
      // await api.subscribeToNewsletter(data.email);
      
      // Simuler une réponse réussie
      setIsSuccess(true);
      
      toast.success("Abonnement réussi", {
        description: "Vous êtes maintenant abonné à notre newsletter",
      });
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setIsSuccess(false);
        form.reset();
      }, 3000);
    } catch (error) {
      toast.error("Échec de l'abonnement", {
        description: "Veuillez réessayer ultérieurement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "footer") {
    return (
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium">Notre Newsletter</h3>
        <p className="text-sm text-muted-foreground">
          Restez informé de nos dernières créations florales et promotions
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Votre email"
                        className="pl-10"
                        disabled={isSubmitting || isSuccess}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              variant="default" 
              className="w-full"
              disabled={isSubmitting || isSuccess}
            >
              {isSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Abonné
                </>
              ) : isSubmitting ? (
                "Abonnement..."
              ) : (
                "S'abonner"
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-serif mb-4">Restez informé</h2>
            <p className="text-muted-foreground mb-4">
              Abonnez-vous à notre newsletter pour recevoir nos dernières créations florales, 
              conseils d'entretien et offres exclusives. Nous promettons de ne pas surcharger 
              votre boîte de réception.
            </p>
          </div>
          
          <div className="bg-card border shadow-sm rounded-lg p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Votre adresse email"
                              className="pl-10"
                              disabled={isSubmitting || isSuccess}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    size="default"
                    disabled={isSubmitting || isSuccess}
                    className="transition-all"
                  >
                    {isSuccess ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Abonné
                      </>
                    ) : isSubmitting ? (
                      "Abonnement..."
                    ) : (
                      <>
                        S'abonner
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  En vous abonnant, vous acceptez de recevoir des emails de notre part. 
                  Vous pouvez vous désabonner à tout moment.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;