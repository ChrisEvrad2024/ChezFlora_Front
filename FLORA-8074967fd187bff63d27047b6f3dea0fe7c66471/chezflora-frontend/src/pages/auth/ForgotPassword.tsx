import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

// Define form schema
const formSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Vérifier si l'email existe dans notre base d'utilisateurs
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some((user: any) => user.email.toLowerCase() === data.email.toLowerCase());
      
      // Peu importe si l'utilisateur existe ou non, nous montrons le même message pour des raisons de sécurité
      setTimeout(() => {
        setIsSubmitted(true);
        
        // Pour cette démo, on affiche un toast de réussite seulement si l'email existe
        if (userExists) {
          toast.success("Email envoyé", {
            description: "Consultez votre boîte de réception pour réinitialiser votre mot de passe",
          });
        }
      }, 1000);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Échec de l'envoi", {
        description: "Une erreur s'est produite. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      description="Entrez votre adresse email pour recevoir un lien de réinitialisation."
      backLink={{ href: "/auth/login", label: "Retour à la connexion" }}
    >
      {!isSubmitted ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="votre@email.fr" 
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-6 pt-2 text-center">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Vérifiez votre email</h3>
            <p className="text-muted-foreground">
              Si un compte existe avec l'adresse {form.getValues().email}, vous recevrez un email contenant les instructions pour réinitialiser votre mot de passe.
            </p>
          </div>
          
          <Button variant="outline" asChild className="mt-4">
            <Link to="/auth/login" className="w-full flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Retour à la connexion
            </Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;