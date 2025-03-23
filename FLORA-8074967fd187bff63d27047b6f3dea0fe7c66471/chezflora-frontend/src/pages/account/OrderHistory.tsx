import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Package, 
  TruckIcon, 
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  CheckCheck
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OrderService, ORDER_STATUS } from "@/services/OrderService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { toast } from "sonner";

const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check for order success message
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  
  // Clear URL parameters after showing success message
  useEffect(() => {
    if (success === 'true' && orderId) {
      // Show success toast
      toast.success("Commande confirmée", {
        description: `Votre commande #${orderId.slice(-8)} a été enregistrée avec succès`
      });
      
      // Clear URL parameters
      navigate('/account/orders', { replace: true });
    }
  }, [success, orderId, navigate]);
  
  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);
  
  // Load orders from service
  const loadOrders = () => {
    setIsLoading(true);
    try {
      const userOrders = OrderService.getUserOrders();
      
      // Sort by date (newest first)
      const sortedOrders = userOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Erreur", {
        description: "Impossible de charger vos commandes"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter orders based on active tab
  const filteredOrders = activeTab === "all" 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  // Format date to French locale
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  // Prepare order cancellation
  const prepareOrderCancel = (order) => {
    // Check if order can be cancelled
    if (order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.PROCESSING) {
      toast.error("Annulation impossible", {
        description: "Cette commande ne peut plus être annulée"
      });
      return;
    }
    
    setOrderToCancel(order);
    setIsCancelDialogOpen(true);
  };
  
  // Execute order cancellation
  const executeCancelOrder = () => {
    if (!orderToCancel) return;
    
    setIsCancelling(true);
    
    try {
      const cancelled = OrderService.cancelOrder(
        orderToCancel.id, 
        "Annulation à la demande du client"
      );
      
      if (cancelled) {
        // Reload orders to reflect changes
        loadOrders();
        
        toast.success("Commande annulée", {
          description: "Votre commande a été annulée avec succès"
        });
      } else {
        toast.error("Échec de l'annulation", {
          description: "La commande n'a pas pu être annulée"
        });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'annulation"
      });
    } finally {
      setIsCancelling(false);
      setIsCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  // Status mapping for displaying appropriate UI
  const statusConfig = {
    [ORDER_STATUS.PENDING]: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="h-4 w-4" />
    },
    [ORDER_STATUS.PROCESSING]: {
      label: "En cours de traitement",
      color: "bg-blue-100 text-blue-800",
      icon: <Clock className="h-4 w-4" />
    },
    [ORDER_STATUS.SHIPPED]: {
      label: "Expédiée",
      color: "bg-purple-100 text-purple-800",
      icon: <TruckIcon className="h-4 w-4" />
    },
    [ORDER_STATUS.DELIVERED]: {
      label: "Livrée",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-4 w-4" />
    },
    [ORDER_STATUS.CANCELLED]: {
      label: "Annulée",
      color: "bg-red-100 text-red-800",
      icon: <AlertCircle className="h-4 w-4" />
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-serif">Mes commandes</h1>
          <p className="text-muted-foreground">
            Consultez et suivez l'historique de vos commandes.
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif">Mes commandes</h1>
        <p className="text-muted-foreground">
          Consultez et suivez l'historique de vos commandes.
        </p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Toutes ({orders.length})</TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.PROCESSING}>
            En cours ({orders.filter(o => o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.PROCESSING).length})
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.SHIPPED}>
            Expédiées ({orders.filter(o => o.status === ORDER_STATUS.SHIPPED).length})
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.DELIVERED}>
            Livrées ({orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length})
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.CANCELLED}>
            Annulées ({orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-base">Commande #{order.id.slice(-8)}</CardTitle>
                      <CardDescription>
                        {formatDate(order.createdAt)} • {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <Badge 
                        variant="outline"
                        className={`${statusConfig[order.status].color} flex gap-1 items-center`}
                      >
                        {statusConfig[order.status].icon}
                        {statusConfig[order.status].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  {/* Order items */}
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.price.toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Order summary and actions */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Total: {order.total.toFixed(2)} €</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dont frais de livraison: {order.shippingCost.toFixed(2)} €
                      </p>
                      
                      {order.status === ORDER_STATUS.SHIPPED && (
                        <p className="text-xs text-primary flex items-center mt-1">
                          <TruckIcon className="h-3 w-3 mr-1" />
                          Livraison prévue dans 2-3 jours
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm">
                        Détails
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      
                      {/* Bouton d'annulation conditionnel */}
                      {(order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PROCESSING) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => prepareOrderCancel(order)}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucune commande trouvée</h3>
                <p className="text-muted-foreground mt-1 text-center">
                  Vous n'avez pas encore de commandes dans cette catégorie.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/catalog">Commencer vos achats</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Confirmation d'annulation */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeCancelOrder}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? "Annulation en cours..." : "Confirmer l'annulation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderHistory;