
import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Mail,
  Phone,
  Filter,
  UserCircle,
  ShoppingCart,
  MapPin
} from "lucide-react";
import { toast } from "sonner";

// Sample customer interface
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  status: "active" | "inactive";
  createdAt: Date;
}

// Sample customer data
const sampleCustomers: Customer[] = [
  {
    id: "cust-001",
    name: "Marie Dupont",
    email: "marie.dupont@example.com",
    phone: "+33 6 12 34 56 78",
    address: "23 Rue des Fleurs",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    totalOrders: 5,
    totalSpent: 289.75,
    lastOrderDate: new Date("2023-05-25"),
    status: "active",
    createdAt: new Date("2022-11-10")
  },
  {
    id: "cust-002",
    name: "Jean Martin",
    email: "jean.martin@example.com",
    phone: "+33 6 23 45 67 89",
    address: "45 Avenue des Arbres",
    city: "Lyon",
    postalCode: "69002",
    country: "France",
    totalOrders: 3,
    totalSpent: 154.50,
    lastOrderDate: new Date("2023-06-02"),
    status: "active",
    createdAt: new Date("2023-01-15")
  },
  {
    id: "cust-003",
    name: "Sophie Bernard",
    email: "sophie.bernard@example.com",
    phone: "+33 6 34 56 78 90",
    address: "12 Boulevard du Parc",
    city: "Marseille",
    postalCode: "13001",
    country: "France",
    totalOrders: 1,
    totalSpent: 45.75,
    lastOrderDate: new Date("2023-05-30"),
    status: "active",
    createdAt: new Date("2023-04-22")
  },
  {
    id: "cust-004",
    name: "Thomas Robert",
    email: "thomas.robert@example.com",
    phone: "+33 6 45 67 89 01",
    address: "8 Rue du Commerce",
    city: "Bordeaux",
    postalCode: "33000",
    country: "France",
    totalOrders: 0,
    totalSpent: 0,
    status: "inactive",
    createdAt: new Date("2023-05-17")
  },
  {
    id: "cust-005",
    name: "Laura Petit",
    email: "laura.petit@example.com",
    phone: "+33 6 56 78 90 12",
    address: "67 Rue des Roses",
    city: "Lille",
    postalCode: "59000",
    country: "France",
    totalOrders: 7,
    totalSpent: 412.30,
    lastOrderDate: new Date("2023-06-05"),
    status: "active",
    createdAt: new Date("2022-09-05")
  }
];

const CustomersManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle customer deletion
  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter(customer => customer.id !== customerId));
    toast.success("Client supprimé", {
      description: "Le client a été supprimé avec succès."
    });
  };

  // Handle sending email
  const handleSendEmail = (email: string) => {
    toast.success("Email préparé", {
      description: `Un email sera envoyé à ${email}.`
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2) + " €";
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Actif</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Inactif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Gérez vos clients et leurs commandes.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un client..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Statut
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Tous les clients</DropdownMenuItem>
                  <DropdownMenuItem>Actifs</DropdownMenuItem>
                  <DropdownMenuItem>Inactifs</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead className="text-right">Commandes</TableHead>
                  <TableHead className="text-right">Total dépensé</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">Client depuis {customer.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.city && (
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {customer.city}, {customer.country}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        {customer.totalOrders}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(customer.status)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(customer.email)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Envoyer un email
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun client trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredCustomers.length} sur {customers.length} clients
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomersManagement;
