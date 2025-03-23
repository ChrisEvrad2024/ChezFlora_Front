import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CartService } from '@/services/CartService';
import { AddressService } from '@/services/AddressService';
import { OrderService } from '@/services/OrderService';
import { AuthService } from '@/services/AuthService';
import { Minus, Plus, X, ShoppingBag, CreditCard, Truck, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

// Schéma de validation du formulaire de commande
const checkoutSchema = z.object({
  shippingAddressId: z.string({
    required_error: "Veuillez sélectionner une adresse de livraison"
  }),
  billingAddressId: z.string({
    required_error: "Veuillez sélectionner une adresse de facturation"
  }),
  paymentMethod: z.enum(["card", "paypal", "bank_transfer"], {
    required_error: "Veuillez sélectionner une méthode de paiement"
  }),
  shippingOption: z.enum(["standard", "express"], {
    required_error: "Veuillez sélectionner une option de livraison"
  }),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

// Fonction utilitaire pour normaliser les données du produit
const normalizeProductData = (item) => {
  if (item.productId) {
    // Nouveau format (structure simplifiée)
    return {
      id: item.productId,
      name: item.productName || "Produit sans nom",
      price: parseFloat(item.productPrice) || 0,
      images: item.productImage ? [item.productImage] : [],
      quantity: item.quantity || 1
    };
  } else if (item.product) {
    // Ancien format (avec objet product complet)
    const product = item.product;
    return {
      id: product.id,
      name: product.name || "Produit sans nom",
      price: parseFloat(product.price) || 0,
      images: Array.isArray(product.images) ? product.images : 
             (product.image ? [product.image] : []),
      quantity: item.quantity || 1
    };
  } else {
    // Format direct (l'item est le produit)
    return {
      id: item.id,
      name: item.name || "Produit sans nom",
      price: parseFloat(item.price) || 0,
      images: Array.isArray(item.images) ? item.images : 
             (item.image ? [item.image] : []),
      quantity: 1
    };
  }
};

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [billingAddresses, setBillingAddresses] = useState<any[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();
  
  // Initialiser le formulaire
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddressId: "",
      billingAddressId: "",
      paymentMethod: "card",
      shippingOption: "standard",
    },
  });
  
  // Charger le panier et les adresses
  useEffect(() => {
    try {
      // Charger les adresses si l'utilisateur est connecté
      if (AuthService.isAuthenticated()) {
        const shipping = AddressService.getAddressesByType("shipping");
        const billing = AddressService.getAddressesByType("billing");
        
        setShippingAddresses(shipping);
        setBillingAddresses(billing);
        
        // Pré-remplir avec les adresses par défaut
        const defaultShipping = AddressService.getDefaultAddress("shipping");
        const defaultBilling = AddressService.getDefaultAddress("billing");
        
        if (defaultShipping) {
          form.setValue("shippingAddressId", defaultShipping.id);
        }
        
        if (defaultBilling) {
          form.setValue("billingAddressId", defaultBilling.id);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors du chargement des données"
      });
    }
  }, [form]);
  
  // Observer les événements de mise à jour du panier
  useEffect(() => {
    const updateCart = () => {
      try {
        const rawCartItems = CartService.getCart();
        const normalizedCartItems = rawCartItems.map(item => ({
          ...item,
          product: normalizeProductData(item.product || item),
        }));
        
        setCartItems(normalizedCartItems);
        setTotalAmount(CartService.getCartTotal());
      } catch (error) {
        console.error("Erreur lors de la mise à jour du panier:", error);
      }
    };
    
    // Appel initial pour charger le panier
    updateCart();
    
    window.addEventListener('cartUpdated', updateCart);
    window.addEventListener('storage', updateCart);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCart);
      window.removeEventListener('storage', updateCart);
    };
  }, []);
  
  // Gérer les changements de quantité
  const handleQuantityChange = (id: string, newQuantity: number) => {
    try {
      CartService.updateCartItemQuantity(id, newQuantity);
      
      // Mettre à jour l'affichage
      const rawCartItems = CartService.getCart();
      const normalizedCartItems = rawCartItems.map(item => ({
        ...item,
        product: normalizeProductData(item.product || item),
      }));
      
      setCartItems(normalizedCartItems);
      setTotalAmount(CartService.getCartTotal());
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
      toast.error("Stock insuffisant", {
        description: error instanceof Error ? error.message : "Quantité indisponible"
      });
    }
  };
  
  // Gérer la suppression d'un article
  const handleRemoveItem = (id: string) => {
    CartService.removeFromCart(id);
    
    // Mettre à jour l'affichage
    const rawCartItems = CartService.getCart();
    const normalizedCartItems = rawCartItems.map(item => ({
      ...item,
      product: normalizeProductData(item.product || item),
    }));
    
    setCartItems(normalizedCartItems);
    setTotalAmount(CartService.getCartTotal());
    
    toast.info("Produit retiré", {
      description: "Le produit a été retiré de votre panier",
      duration: 3000,
    });
  };
  
  // Gérer le passage au checkout
  const proceedToCheckout = () => {
    if (!AuthService.isAuthenticated()) {
      // Rediriger vers la page de connexion
      toast.info("Connexion requise", {
        description: "Veuillez vous connecter pour continuer votre achat"
      });
      navigate("/auth/login", { state: { from: "/cart" } });
      return;
    }
    
    // Vérifier s'il y a au moins une adresse de livraison et de facturation
    if (shippingAddresses.length === 0 || billingAddresses.length === 0) {
      toast.warning("Adresses requises", {
        description: "Veuillez ajouter une adresse de livraison et de facturation avant de continuer"
      });
      navigate("/account/addresses");
      return;
    }
    
    // Ouvrir le dialogue de checkout
    setIsCheckoutOpen(true);
  };
  
  // Gérer la finalisation de la commande
  const handlePlaceOrder = async (data: z.infer<typeof checkoutSchema>) => {
    setIsPlacingOrder(true);
    
    try {
      // Calculer les frais de livraison
      const shippingCost = data.shippingOption === "express" ? 12.90 : 7.90;
      
      // Créer la commande
      const order = OrderService.createOrder({
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        paymentMethod: data.paymentMethod,
        shippingCost
      });
      
      if (order) {
        toast.success("Commande confirmée", {
          description: "Votre commande a été enregistrée avec succès"
        });
        
        // Fermer le dialogue et rediriger vers la page de confirmation
        setIsCheckoutOpen(false);
        navigate(`/account/orders?success=true&orderId=${order.id}`);
      } else {
        toast.error("Échec de la commande", {
          description: "Une erreur est survenue lors de la création de la commande"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la commande"
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  // Calculer le coût de livraison
  const getShippingCost = () => {
    const shippingOption = form.watch("shippingOption");
    return shippingOption === "express" ? 12.90 : 7.90;
  };
  
  // Afficher le libellé de la méthode de paiement
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card": return "Carte bancaire";
      case "paypal": return "PayPal";
      case "bank_transfer": return "Virement bancaire";
      default: return method;
    }
  };
  
  // Obtenir les informations d'une adresse pour l'affichage
  const getAddressInfo = (addressId: string, addresses: any[]) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (!address) return null;
    
    return `${address.firstName} ${address.lastName}, ${address.addressLine1}, ${address.postalCode} ${address.city}`;
  };
  
  // S'assurer que les images du produit sont toujours accessibles
  const getProductImage = (item: any) => {
    const product = item.product || item;
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return '/placeholder.svg';
  };
  
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen">
        <div className="section-container">
          <h1 className="text-3xl font-serif mb-8">Votre Panier</h1>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex justify-center items-center p-6 bg-muted rounded-full mb-6">
                <ShoppingBag size={32} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-serif mb-4">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-8">Ajoutez des produits à votre panier pour continuer vos achats.</p>
              <Link to="/catalog" className="btn-primary inline-flex">
                Continuer mes achats
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-background rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left py-4 px-6">Produit</th>
                        <th className="text-center py-4 px-2">Quantité</th>
                        <th className="text-right py-4 px-6">Prix</th>
                        <th className="text-right py-4 px-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => {
                        const product = item.product || item;
                        return (
                          <tr key={product.id} className="border-t border-border">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <Link to={`/product/${product.id}`} className="w-20 h-20 rounded-md overflow-hidden bg-muted">
                                  <img 
                                    src={getProductImage(item)}
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                  />
                                </Link>
                                <div>
                                  <Link to={`/product/${product.id}`} className="font-medium hover:text-primary transition-colors">
                                    {product.name}
                                  </Link>
                                  <p className="text-muted-foreground text-sm mt-1">{parseFloat(product.price).toFixed(2)} € / unité</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center justify-center">
                                <button 
                                  className="border border-border rounded-l-md p-2 hover:bg-muted transition-colors"
                                  onClick={() => handleQuantityChange(product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={14} />
                                </button>
                                <div className="border-t border-b border-border px-4 py-1.5 flex items-center justify-center min-w-[40px]">
                                  {item.quantity}
                                </div>
                                <button 
                                  className="border border-border rounded-r-md p-2 hover:bg-muted transition-colors"
                                  onClick={() => handleQuantityChange(product.id, item.quantity + 1)}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right font-medium">
                              {(parseFloat(product.price) * item.quantity).toFixed(2)} €
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button 
                                className="text-muted-foreground hover:text-destructive p-2 transition-colors rounded-full hover:bg-muted"
                                onClick={() => handleRemoveItem(product.id)}
                                aria-label="Supprimer"
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-background rounded-lg border border-border p-6">
                  <h2 className="text-xl font-serif mb-6">Récapitulatif</h2>
                  
                  <div className="space-y-4 border-b border-border pb-6 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium">{totalAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className="font-medium">à partir de 7.90 €</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-8">
                    <span className="text-lg">Total estimé</span>
                    <span className="text-lg font-medium">{(totalAmount + 7.9).toFixed(2)} €</span>
                  </div>
                  
                  <button 
                    className="btn-primary w-full"
                    onClick={proceedToCheckout}
                  >
                    Passer au paiement
                  </button>
                  
                  <div className="mt-6">
                    <Link 
                      to="/catalog" 
                      className="text-primary hover:underline text-sm flex justify-center"
                    >
                      Continuer vos achats
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finaliser votre commande</DialogTitle>
            <DialogDescription>
              Veuillez remplir les informations nécessaires pour valider votre commande.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePlaceOrder)} className="space-y-6">
              {/* Shipping Address */}
              <FormField
                control={form.control}
                name="shippingAddressId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse de livraison</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isPlacingOrder}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une adresse" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingAddresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.nickname} - {address.firstName} {address.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                    {shippingAddresses.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <Link to="/account/addresses" className="text-primary hover:underline">
                          Ajouter une adresse de livraison
                        </Link>
                      </p>
                    )}
                    {field.value && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {getAddressInfo(field.value, shippingAddresses)}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              
              {/* Billing Address */}
              <FormField
                control={form.control}
                name="billingAddressId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse de facturation</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isPlacingOrder}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une adresse" />
                        </SelectTrigger>
                        <SelectContent>
                          {billingAddresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.nickname} - {address.firstName} {address.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                    {billingAddresses.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <Link to="/account/addresses" className="text-primary hover:underline">
                          Ajouter une adresse de facturation
                        </Link>
                      </p>
                    )}
                    {field.value && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {getAddressInfo(field.value, billingAddresses)}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              
              {/* Shipping Options */}
              <FormField
                control={form.control}
                name="shippingOption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option de livraison</FormLabel>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Card className={`cursor-pointer hover:border-primary ${field.value === 'standard' ? 'border-primary' : ''}`}
                        onClick={() => form.setValue('shippingOption', 'standard')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Truck className="mr-2 h-4 w-4 text-primary" />
                            Standard
                          </CardTitle>
                          <CardDescription>
                            Livraison en 3-5 jours
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <span className="font-bold">7.90 €</span>
                        </CardFooter>
                      </Card>
                      
                      <Card className={`cursor-pointer hover:border-primary ${field.value === 'express' ? 'border-primary' : ''}`}
                        onClick={() => form.setValue('shippingOption', 'express')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Truck className="mr-2 h-4 w-4 text-primary" />
                            Express
                          </CardTitle>
                          <CardDescription>
                            Livraison en 24-48h
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <span className="font-bold">12.90 €</span>
                        </CardFooter>
                      </Card>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Méthode de paiement</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div>
                          <RadioGroupItem
                            value="card"
                            id="payment-card"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="payment-card"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <CreditCard className="mb-3 h-6 w-6" />
                            Carte bancaire
                          </Label>
                        </div>
                        
                        <div>
                          <RadioGroupItem
                            value="paypal"
                            id="payment-paypal"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="payment-paypal"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7.7 10.7C7.1 10.7 6.6 10.85 6.2 11.05C5.8 11.25 5.5 11.55 5.3 11.9C5.1 12.25 5 12.7 5 13.2C5 13.7 5.1 14.15 5.3 14.5C5.5 14.85 5.8 15.15 6.2 15.35C6.6 15.55 7.1 15.7 7.7 15.7C8.3 15.7 8.8 15.55 9.2 15.35C9.6 15.15 9.9 14.85 10.1 14.5C10.3 14.15 10.4 13.7 10.4 13.2C10.4 12.7 10.3 12.25 10.1 11.9C9.9 11.55 9.6 11.25 9.2 11.05C8.8 10.85 8.3 10.7 7.7 10.7Z" fill="currentColor"/>
                              <path d="M17.7 10.7C17.1 10.7 16.6 10.85 16.2 11.05C15.8 11.25 15.5 11.55 15.3 11.9C15.1 12.25 15 12.7 15 13.2C15 13.7 15.1 14.15 15.3 14.5C15.5 14.85 15.8 15.15 16.2 15.35C16.6 15.55 17.1 15.7 17.7 15.7C18.3 15.7 18.8 15.55 19.2 15.35C19.6 15.15 19.9 14.85 20.1 14.5C20.3 14.15 20.4 13.7 20.4 13.2C20.4 12.7 20.3 12.25 20.1 11.9C19.9 11.55 19.6 11.25 19.2 11.05C18.8 10.85 18.3 10.7 17.7 10.7Z" fill="currentColor"/>
                              <path d="M19.3 5H13.9C13.4 5 13 5.2 12.8 5.6L11.1 9H12.6L14.1 6H19L16.7 11H13.5L9.3 19.7C9.1 20.1 8.7 20.3 8.2 20.3H5.8L4 23H5.5L7.2 20.3H11.8L16 11.7C16.2 11.3 16.6 11.1 17.1 11.1H20.8L24 5H19.3Z" fill="currentColor"/>
                            </svg>
                            PayPal
                          </Label>
                        </div>
                        
                        <div>
                          <RadioGroupItem
                            value="bank_transfer"
                            id="payment-bank"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="payment-bank"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4 10V17H20V10H4Z" fill="currentColor"/>
                              <path d="M2 7H22L12 3L2 7Z" fill="currentColor"/>
                              <path d="M4 18H20V20H4V18Z" fill="currentColor"/>
                            </svg>
                            Virement
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Credit Card Details (conditionally shown) */}
              {form.watch("paymentMethod") === "card" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Numéro de carte</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="4111 1111 1111 1111" 
                            {...field} 
                            disabled={isPlacingOrder}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'expiration</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MM/AA" 
                            {...field} 
                            disabled={isPlacingOrder}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardCvc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVC</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123" 
                            {...field} 
                            disabled={isPlacingOrder}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Order Summary */}
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Récapitulatif de la commande</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{totalAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison ({form.watch("shippingOption") === "express" ? "Express" : "Standard"})</span>
                    <span>{getShippingCost().toFixed(2)} €</span>
                  </div>
                  <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{(totalAmount + getShippingCost()).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCheckoutOpen(false)}
                  disabled={isPlacingOrder}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isPlacingOrder}
                  className="gap-2"
                >
                  {isPlacingOrder ? (
                    "Traitement en cours..."
                  ) : (
                    <>
                      Confirmer la commande
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default Cart;

// Helper component for RadioGroup
const Label = ({ className, ...props }) => (
  <label className={className} {...props} />
);