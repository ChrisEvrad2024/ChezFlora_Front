/*
* Ce composant devrait être placé dans:
* /src/components/shared/NewsletterSubscription.tsx
*/

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Send, CheckCircle } from "lucide-react";

// Schema de validation
const formSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
});

interface NewsletterSubscriptionProps {
  variant?: "horizontal" | "vertical";
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
}

const NewsletterSubscription = ({
  variant = "horizontal",
  title = "Abonnez-vous à notre newsletter",
  description = "Recevez nos actualités, offres spéciales et conseils botaniques directement dans votre boîte mail.",
  buttonText = "S'abonner",
  className = "",
}: NewsletterSubscriptionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialisation du formulaire
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Gestion de la soumission du formulaire
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stocker l'email dans le localStorage pour simuler une BDD
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      
      // Vérifier si l'email existe déjà
      if (!subscribers.includes(data.email)) {
        subscribers.push(data.email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
        
        toast.success("Inscription réussie", {
          description: "Vous êtes maintenant abonné à notre newsletter.",
        });
      } else {
        toast.info("Déjà inscrit", {
          description: "Vous êtes déjà abonné à notre newsletter.",
        });
      }
      
      // Afficher le message de succès
      setIsSubmitted(true);
      
      // Réinitialiser le formulaire après un certain temps
      setTimeout(() => {
        form.reset();
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error("Erreur lors de l'inscription à la newsletter:", error);
      toast.error("Échec de l'inscription", {
        description: "Une erreur est survenue. Veuillez réessayer plus tard.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu horizontal ou vertical
  if (variant === "horizontal") {
    return (
      <div className={`bg-muted rounded-lg p-6 ${className}`}>
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2 min-w-[280px]">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Votre adresse email"
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
                <Button type="submit" disabled={isSubmitting} className="shrink-0">
                  {isSubmitting ? "En cours..." : buttonText}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span>Merci pour votre inscription!</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variante verticale
  return (
    <div className={`bg-muted rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      
      {!isSubmitted ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Votre adresse email"
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
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "En cours..." : buttonText}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      ) : (
        <div className="flex items-center justify-center p-4 bg-primary/10 text-primary rounded-lg gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Merci pour votre inscription!</span>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscription;