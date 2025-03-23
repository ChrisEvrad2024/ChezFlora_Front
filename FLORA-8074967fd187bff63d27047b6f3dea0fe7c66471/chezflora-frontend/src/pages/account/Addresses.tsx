import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, MoreVertical, PenLine, Trash2, MapPin, Home, Building, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddressService } from "@/services/AddressService";

// Type d'adresse
type Address = {
  id: string;
  nickname: string;
  type: "shipping" | "billing";
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

// Schéma de validation du formulaire
const addressFormSchema = z.object({
  nickname: z.string().min(1, "Le nom est requis"),
  type: z.enum(["shipping", "billing"]),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  addressLine1: z.string().min(1, "L'adresse est requise"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "La ville est requise"),
  postalCode: z.string().min(1, "Le code postal est requis"),
  country: z.string().min(1, "Le pays est requis"),
  phone: z.string().min(1, "Le téléphone est requis"),
  isDefault: z.boolean().default(false),
});

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les adresses lors du montage du composant
  useEffect(() => {
    loadAddresses();
  }, []);
  
  // Charger les adresses depuis le service
  const loadAddresses = () => {
    setIsLoading(true);
    try {
      const userAddresses = AddressService.getUserAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      console.error("Erreur lors du chargement des adresses:", error);
      toast.error("Erreur", {
        description: "Impossible de charger vos adresses"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize the form
  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      nickname: "",
      type: "shipping",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "France",
      phone: "",
      isDefault: false,
    },
  });

  // Open dialog for adding a new address
  const handleAddAddress = () => {
    form.reset({
      nickname: "",
      type: "shipping",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "France",
      phone: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setOpenDialog(true);
  };

  // Open dialog for editing an existing address
  const handleEditAddress = (address: Address) => {
    form.reset({
      nickname: address.nickname,
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setOpenDialog(true);
  };

  // Préparer suppression d'adresse
  const confirmDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId);
    setIsDeleteDialogOpen(true);
  };
  
  // Exécuter suppression d'adresse
  const executeDeleteAddress = () => {
    if (!addressToDelete) return;
    
    try {
      const success = AddressService.deleteAddress(addressToDelete);
      
      if (success) {
        // Mettre à jour la liste locale
        setAddresses(addresses.filter(addr => addr.id !== addressToDelete));
        
        toast.success("Adresse supprimée", {
          description: "L'adresse a été supprimée avec succès"
        });
      } else {
        toast.error("Échec de la suppression", {
          description: "L'adresse n'a pas pu être supprimée"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'adresse:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression de l'adresse"
      });
    } finally {
      setAddressToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof addressFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (editingAddress) {
        // Update existing address
        const updatedAddress = AddressService.updateAddress(editingAddress.id, data);
        
        if (updatedAddress) {
          // Mettre à jour la liste locale
          setAddresses(addresses.map(addr => 
            addr.id === updatedAddress.id ? updatedAddress : addr
          ));
          
          toast.success("Adresse mise à jour", {
            description: "Vos modifications ont été enregistrées"
          });
        } else {
          toast.error("Échec de la mise à jour", {
            description: "L'adresse n'a pas pu être mise à jour"
          });
        }
      } else {
        // Add new address
        const newAddress = AddressService.addAddress(data);
        
        if (newAddress) {
          // Ajouter à la liste locale
          setAddresses([...addresses, newAddress]);
          
          toast.success("Adresse ajoutée", {
            description: "La nouvelle adresse a été ajoutée avec succès"
          });
        } else {
          toast.error("Échec de l'ajout", {
            description: "L'adresse n'a pas pu être ajoutée"
          });
        }
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'adresse:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement de l'adresse"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set address as default
  const setDefaultAddress = (addressId: string) => {
    try {
      const success = AddressService.setDefaultAddress(addressId);
      
      if (success) {
        // Reload addresses to get the updated default status
        loadAddresses();
        
        toast.success("Adresse par défaut définie", {
          description: "Cette adresse sera utilisée par défaut"
        });
      } else {
        toast.error("Échec de l'opération", {
          description: "Impossible de définir cette adresse comme adresse par défaut"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la définition de l'adresse par défaut:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue"
      });
    }
  };

  // Get shipping and billing addresses
  const shippingAddresses = addresses.filter((addr) => addr.type === "shipping");
  const billingAddresses = addresses.filter((addr) => addr.type === "billing");

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement de vos adresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes adresses</h1>
        <p className="text-muted-foreground">
          Gérez vos adresses de livraison et de facturation.
        </p>
      </div>

      {/* Shipping Addresses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Adresses de livraison</h2>
          <Button size="sm" onClick={handleAddAddress}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une adresse
          </Button>
        </div>

        {shippingAddresses.length === 0 ? (
          <Alert>
            <AlertDescription>
              Vous n'avez pas encore ajouté d'adresse de livraison.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shippingAddresses.map((address) => (
              <AddressCard 
                key={address.id} 
                address={address} 
                onEdit={() => handleEditAddress(address)}
                onDelete={() => confirmDeleteAddress(address.id)}
                onSetDefault={() => setDefaultAddress(address.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Billing Addresses */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Adresses de facturation</h2>
          <Button size="sm" onClick={handleAddAddress} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une adresse
          </Button>
        </div>

        {billingAddresses.length === 0 ? (
          <Alert>
            <AlertDescription>
              Vous n'avez pas encore ajouté d'adresse de facturation.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {billingAddresses.map((address) => (
              <AddressCard 
                key={address.id} 
                address={address} 
                onEdit={() => handleEditAddress(address)}
                onDelete={() => confirmDeleteAddress(address.id)}
                onSetDefault={() => setDefaultAddress(address.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Address Form Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Modifier l'adresse" : "Ajouter une adresse"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? "Modifiez les informations de l'adresse ci-dessous." 
                : "Remplissez les informations pour ajouter une nouvelle adresse."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'adresse</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Domicile, Bureau..." 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'adresse</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="shipping">Livraison</SelectItem>
                        <SelectItem value="billing">Facturation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complément d'adresse</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Adresse par défaut</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Définir comme adresse par défaut pour ce type
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? "Enregistrement..." 
                    : (editingAddress ? "Mettre à jour" : "Ajouter")
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette adresse ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteAddress}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Address Card Component
const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete,
  onSetDefault
}: { 
  address: Address; 
  onEdit: () => void; 
  onDelete: () => void;
  onSetDefault: () => void;
}) => {
  // Icône selon le type et le nom de l'adresse
  const getAddressIcon = () => {
    const nickname = address.nickname.toLowerCase();
    if (nickname.includes("domicile") || nickname.includes("maison")) {
      return <Home className="h-5 w-5 text-blue-500" />;
    } else if (nickname.includes("bureau") || nickname.includes("travail")) {
      return <Building className="h-5 w-5 text-green-500" />;
    } else {
      return <MapPin className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className={address.isDefault ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getAddressIcon()}
            <CardTitle className="text-base">{address.nickname}</CardTitle>
            {address.isDefault && (
              <div className="flex items-center bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
                <Star className="h-3 w-3 mr-1" />
                Par défaut
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <PenLine className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              {!address.isDefault && (
                <DropdownMenuItem onClick={onSetDefault}>
                  <Star className="h-4 w-4 mr-2" />
                  Définir par défaut
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-1">
          <p className="font-medium">{address.firstName} {address.lastName}</p>
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>{address.postalCode} {address.city}</p>
          <p>{address.country}</p>
          <p className="pt-1">{address.phone}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
          Modifier
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Addresses;