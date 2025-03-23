import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Truck, 
  Package, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CalendarIcon,
  Eye,
  Download,
  Send,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import { OrderService, ORDER_STATUS } from "@/services/OrderService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";

// Types
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface StatusHistory {
  status: string;
  date: string;
  comment: string;
}

interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistory[];
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Chargement initial des commandes
  useEffect(() => {
    loadOrders();
  }, []);

  // Filtrage des commandes
  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, dateFilter, minAmount, maxAmount]);

  // Charger les commandes depuis le service
  const loadOrders = () => {
    setIsLoading(true);
    try {
      const allOrders = OrderService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      toast.error("Erreur", {
        description: "Impossible de charger les commandes"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les commandes
  const filterOrders = () => {
    let result = [...orders];
    
    // Filtrer par statut
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filtrer par recherche (ID, nom client)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.toLowerCase().includes(query) ||
        order.shippingAddress.city.toLowerCase().includes(query)
      );
    }
    
    // Filtrer par date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === filterDate.getTime();
      });
    }
    
    // Filtrer par montant minimum
    if (minAmount) {
      const min = parseFloat(minAmount);
      result = result.filter(order => order.total >= min);
    }
    
    // Filtrer par montant maximum
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      result = result.filter(order => order.total <= max);
    }
    
    setFilteredOrders(result);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFilter(undefined);
    setMinAmount("");
    setMaxAmount("");
    setIsFilterOpen(false);
  };

  // Afficher les détails d'une commande
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Afficher le dialogue de mise à jour de statut
  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusComment("");
    setIsStatusDialogOpen(true);
  };

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setIsUpdatingStatus(true);
    
    try {
      const updatedOrder = OrderService.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        statusComment
      );
      
      if (updatedOrder) {
        // Mettre à jour la liste des commandes
        loadOrders();
        
        toast.success("Statut mis à jour", {
          description: `La commande ${selectedOrder.id.slice(-6)} est maintenant ${getStatusLabel(newStatus)}`
        });
        
        setIsStatusDialogOpen(false);
      } else {
        toast.error("Échec de la mise à jour", {
          description: "Le statut n'a pas pu être mis à jour"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour du statut"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Confirmer l'annulation d'une commande
  const confirmCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelDialogOpen(true);
  };

  // Annuler une commande
  const cancelOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      const cancelled = OrderService.cancelOrder(
        selectedOrder.id,
        "Commande annulée par l'administrateur"
      );
      
      if (cancelled) {
        // Mettre à jour la liste des commandes
        loadOrders();
        
        toast.success("Commande annulée", {
          description: `La commande ${selectedOrder.id.slice(-6)} a été annulée`
        });
        
        setIsCancelDialogOpen(false);
      } else {
        toast.error("Échec de l'annulation", {
          description: "La commande n'a pas pu être annulée"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'annulation de la commande"
      });
    }
  };

  // Générer une facture (fonction fictive pour l'instant)
  const generateInvoice = (order: Order) => {
    toast.success("Facture générée", {
      description: `La facture pour la commande ${order.id.slice(-6)} a été générée`
    });
    // Dans une implémentation réelle, cette fonction générerait un PDF
  };

  // Formater les dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Obtenir le libellé d'un statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING: return "En attente";
      case ORDER_STATUS.PROCESSING: return "En traitement";
      case ORDER_STATUS.SHIPPED: return "Expédiée";
      case ORDER_STATUS.DELIVERED: return "Livrée";
      case ORDER_STATUS.CANCELLED: return "Annulée";
      default: return status;
    }
  };

  // Obtenir l'icône et la couleur d'un statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        );
      case ORDER_STATUS.PROCESSING:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Package className="h-3 w-3" />
            En traitement
          </Badge>
        );
      case ORDER_STATUS.SHIPPED:
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Expédiée
          </Badge>
        );
      case ORDER_STATUS.DELIVERED:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Livrée
          </Badge>
        );
      case ORDER_STATUS.CANCELLED:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Annulée
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Obtenir le mode de paiement
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card": return "Carte bancaire";
      case "paypal": return "PayPal";
      case "bank_transfer": return "Virement bancaire";
      default: return method;
    }
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted-foreground">Chargement des commandes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">Gérez et suivez les commandes des clients.</p>
        </div>
        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtres avancés
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filtres</h4>
                
                <div className="space-y-2">
                  <label className="text-sm" htmlFor="date-filter">Date de commande</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, 'PPP', { locale: fr }) : "Choisir une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm" htmlFor="min-amount">Montant min</label>
                    <Input
                      id="min-amount"
                      type="number"
                      placeholder="0"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm" htmlFor="max-amount">Montant max</label>
                    <Input
                      id="max-amount"
                      type="number"
                      placeholder="1000"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                  <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                    Appliquer
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => loadOrders()}>
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Actualiser les commandes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une commande..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value={ORDER_STATUS.PENDING}>En attente</SelectItem>
                  <SelectItem value={ORDER_STATUS.PROCESSING}>En traitement</SelectItem>
                  <SelectItem value={ORDER_STATUS.SHIPPED}>Expédiée</SelectItem>
                  <SelectItem value={ORDER_STATUS.DELIVERED}>Livrée</SelectItem>
                  <SelectItem value={ORDER_STATUS.CANCELLED}>Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.slice(-6)}</TableCell>
                      <TableCell>
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        <div className="text-xs text-muted-foreground">
                          {order.shippingAddress.city}, {order.shippingAddress.country}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-center">{order.items.length}</TableCell>
                      <TableCell className="text-right font-medium">{order.total.toFixed(2)} €</TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(order)}>
                              <Truck className="h-4 w-4 mr-2" />
                              Modifier statut
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generateInvoice(order)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Générer facture
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmCancelOrder(order)}
                              disabled={order.status === ORDER_STATUS.CANCELLED || order.status === ORDER_STATUS.DELIVERED}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Annuler commande
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8 mb-2 opacity-50" />
                        <p>Aucune commande trouvée</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredOrders.length} sur {orders.length} commandes
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialogue de détails de commande */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[725px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Commande #{selectedOrder?.id.slice(-6)}
            </DialogTitle>
            <DialogDescription>
              Passée le {selectedOrder ? formatDate(selectedOrder.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Statut de la commande */}
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <Button variant="outline" onClick={() => handleStatusUpdate(selectedOrder)}>
                  Modifier statut
                </Button>
              </div>
              
              {/* Informations client */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Client</h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md">
                  <div>
                    <p className="font-medium">
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">Paiement: {getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
                    <p className="text-sm text-muted-foreground">
                      Mise à jour le {formatDate(selectedOrder.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Adresses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Adresse de livraison</h4>
                  <div className="bg-muted/30 p-3 rounded-md text-sm space-y-1">
                    <p className="font-medium">
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                    </p>
                    <p>{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                    <p>{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    <p className="pt-1">{selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Adresse de facturation</h4>
                  <div className="bg-muted/30 p-3 rounded-md text-sm space-y-1">
                    <p className="font-medium">
                      {selectedOrder.billingAddress.firstName} {selectedOrder.billingAddress.lastName}
                    </p>
                    <p>{selectedOrder.billingAddress.addressLine1}</p>
                    {selectedOrder.billingAddress.addressLine2 && <p>{selectedOrder.billingAddress.addressLine2}</p>}
                    <p>{selectedOrder.billingAddress.postalCode} {selectedOrder.billingAddress.city}</p>
                    <p>{selectedOrder.billingAddress.country}</p>
                    <p className="pt-1">{selectedOrder.billingAddress.phone}</p>
                  </div>
                </div>
              </div>
              
              {/* Articles commandés */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Articles commandés</h4>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-center">Quantité</TableHead>
                        <TableHead className="text-right">Prix unitaire</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.price.toFixed(2)} €</TableCell>
                          <TableCell className="text-right font-medium">
                            {(item.price * item.quantity).toFixed(2)} €
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Résumé des coûts */}
              <div className="bg-muted/30 p-4 rounded-md">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{selectedOrder.subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de livraison</span>
                    <span>{selectedOrder.shippingCost.toFixed(2)} €</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between font-bold">
                    <span>Total</span>
                    <span>{selectedOrder.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              
              {/* Historique des statuts */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Historique</h4>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 border-l-2 border-primary/30 pl-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                        {entry.status === ORDER_STATUS.PENDING && <Clock className="h-3 w-3 text-primary" />}
                        {entry.status === ORDER_STATUS.PROCESSING && <Package className="h-3 w-3 text-primary" />}
                        {entry.status === ORDER_STATUS.SHIPPED && <Truck className="h-3 w-3 text-primary" />}
                        {entry.status === ORDER_STATUS.DELIVERED && <CheckCircle className="h-3 w-3 text-primary" />}
                        {entry.status === ORDER_STATUS.CANCELLED && <XCircle className="h-3 w-3 text-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{getStatusLabel(entry.status)}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        {entry.comment && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => generateInvoice(selectedOrder)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Générer facture
                  </Button>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer un email
                  </Button>
                </div>
                {selectedOrder.status !== ORDER_STATUS.CANCELLED && selectedOrder.status !== ORDER_STATUS.DELIVERED && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsDetailsOpen(false);
                      confirmCancelOrder(selectedOrder);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Annuler la commande
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de mise à jour de statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut de la commande</DialogTitle>
            <DialogDescription>
              Commande #{selectedOrder?.id.slice(-6)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut de la commande</label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ORDER_STATUS.PENDING}>En attente</SelectItem>
                  <SelectItem value={ORDER_STATUS.PROCESSING}>En traitement</SelectItem>
                  <SelectItem value={ORDER_STATUS.SHIPPED}>Expédiée</SelectItem>
                  <SelectItem value={ORDER_STATUS.DELIVERED}>Livrée</SelectItem>
                  <SelectItem value={ORDER_STATUS.CANCELLED}>Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaire (optionnel)</label>
              <Textarea
                placeholder="Ajoutez un commentaire sur la mise à jour du statut"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                disabled={isUpdatingStatus}
              />
            </div>
            
            {newStatus === ORDER_STATUS.CANCELLED && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Attention !</p>
                  <p>L'annulation d'une commande est irréversible et entraînera le remboursement du client.</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} disabled={isUpdatingStatus}>
              Annuler
            </Button>
            <Button 
              onClick={updateOrderStatus} 
              disabled={isUpdatingStatus || !newStatus || newStatus === selectedOrder?.status}
            >
              {isUpdatingStatus ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation d'annulation */}
      <AlertDialog 
        open={isCancelDialogOpen} 
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler la commande #{selectedOrder?.id.slice(-6)} ?
              <br /><br />
              Cette action est irréversible et entraînera le retour des articles en stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={cancelOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersManagement;