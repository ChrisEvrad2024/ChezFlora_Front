
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Flower, Leaf, Heart, Award, Users, Smile } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative h-96 mb-16">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1523294557-3637e1db5cb1?q=80&w=2070')",
              backgroundPosition: "center 30%"
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl font-serif mb-4">Notre Histoire</h1>
              <p className="text-lg md:text-xl">
                Passionnés de fleurs depuis plus de 20 ans, nous mettons notre expertise à votre service pour embellir vos moments importants.
              </p>
            </div>
          </div>
        </div>
        
        {/* Our Story */}
        <div className="container mx-auto px-4 mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif mb-6">Notre Passion</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Fondée en 2003 par Marie et Pierre Dupont, Floralie est née d'une passion profonde pour la beauté des fleurs et leur capacité à transmettre des émotions. Ce qui a commencé comme une petite boutique de quartier s'est transformé en une référence dans le domaine de l'art floral.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              Notre philosophie est simple : nous sélectionnons les plus belles fleurs, travaillons avec des producteurs locaux engagés dans des pratiques durables, et créons des arrangements qui racontent des histoires. Chaque bouquet est une œuvre d'art, conçue avec soin et attention aux détails.
            </p>
            <p className="text-lg text-muted-foreground">
              Aujourd'hui, avec notre équipe de fleuristes passionnés, nous continuons à vous offrir des créations florales exceptionnelles, qu'il s'agisse d'un simple bouquet ou d'un événement important de votre vie.
            </p>
          </div>
        </div>
        
        {/* Values */}
        <div className="bg-muted py-16 mb-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif mb-12 text-center">Nos Valeurs</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card border-none">
                <CardContent className="pt-8 px-6 text-center">
                  <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Leaf size={28} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Durabilité</h3>
                  <p className="text-muted-foreground">
                    Nous privilégions les producteurs locaux et les pratiques respectueuses de l'environnement pour réduire notre empreinte écologique.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-none">
                <CardContent className="pt-8 px-6 text-center">
                  <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Award size={28} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Qualité</h3>
                  <p className="text-muted-foreground">
                    Nous sélectionnons chaque fleur avec soin pour garantir fraîcheur et longévité, et ne proposons que des arrangements dont nous sommes fiers.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-none">
                <CardContent className="pt-8 px-6 text-center">
                  <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Heart size={28} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Passion</h3>
                  <p className="text-muted-foreground">
                    Notre amour pour les fleurs se traduit dans chaque bouquet. Nous croyons que les fleurs ont le pouvoir de transformer les moments ordinaires en occasions spéciales.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Team */}
        <div className="container mx-auto px-4 mb-20">
          <h2 className="text-3xl font-serif mb-12 text-center">Notre Équipe</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: "Marie Dupont", role: "Fondatrice & Directrice Artistique", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" },
              { name: "Pierre Dupont", role: "Co-fondateur & Responsable des Opérations", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" },
              { name: "Sophie Martin", role: "Fleuriste Senior", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" },
              { name: "Thomas Petit", role: "Responsable des Événements", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400" },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4 overflow-hidden rounded-full">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div className="bg-muted py-16 mb-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: <Flower size={28} />, value: "20+", label: "Années d'expérience" },
                { icon: <Smile size={28} />, value: "15000+", label: "Clients satisfaits" },
                { icon: <Users size={28} />, value: "500+", label: "Mariages décorés" },
                { icon: <Award size={28} />, value: "15", label: "Prix d'excellence" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif mb-6">Prêt à découvrir nos créations ?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Que ce soit pour embellir votre quotidien ou pour un événement spécial, notre équipe est là pour vous conseiller et réaliser des créations florales sur mesure.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/catalog">Découvrir notre boutique</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
