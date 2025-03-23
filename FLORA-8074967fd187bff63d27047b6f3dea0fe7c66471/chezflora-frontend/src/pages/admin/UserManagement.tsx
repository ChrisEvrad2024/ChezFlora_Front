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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye, 
  UserCog,
  Users,
  UserPlus,
  Shield,
  Lock,
  Activity,
  LogOut,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  User,
  Calendar,
  Clock,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ROLES } from "@/services/AuthService";
import { StorageService } from "@/services/StorageService";

// Définition de l'interface pour les utilisateurs
interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'suspended' | 'locked';
  createdAt: string;
  lastLogin?: string;
}

// Définition de l'interface pour les journaux d'audit
interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// Schéma de validation pour l'ajout/modification d'utilisateur
const userFormSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  role: z.string().min(1, "Le rôle est requis"),
  status: z.enum(["active", "suspended", "locked"], {
    required_error: "Le statut est requis",
  }),
  password: z.string().optional(),
});

// Composant principal de gestion des utilisateurs
const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<UserData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [userIdToEdit, setUserIdToEdit] = useState<string | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentUser, isAuthenticated, isSuperAdmin } = useAuth();

  // Configuration du formulaire avec React Hook Form et Zod
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: ROLES.CLIENT,
      status: "active",
      password: "",
    },
  });

  // Charger les données initiales
  useEffect(() => {
    loadUsers();
    loadAuditLogs();
  }, []);

  // Filtrer les utilisateurs selon la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(lowercasedQuery) ||
          user.firstName.toLowerCase().includes(lowercasedQuery) ||
          user.lastName.toLowerCase().includes(lowercasedQuery) ||
          user.role.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  // Chargement des utilisateurs
  const loadUsers = () => {
    setIsLoading(true);
    try {
      // Dans un cas réel, ceci serait un appel à l'API
      const storedUsers = StorageService.getLocalItem("users") || [];
      
      // Convertir au format UserData (en ajoutant le statut si nécessaire)
      const formattedUsers: UserData[] = storedUsers.map((user: any) => ({
        ...user,
        status: user.status || "active", // Statut par défaut
      }));
      
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les journaux d'audit
  const loadAuditLogs = () => {
    try {
      // Dans un cas réel, ceci serait un appel à l'API
      const storedLogs = StorageService.getLocalItem("audit_logs") || [];
      setAuditLogs(storedLogs);
    } catch (error) {
      console.error("Erreur lors du chargement des journaux d'audit:", error);
      toast.error("Impossible de charger les journaux d'audit");
    }
  };

  // Ajout d'une entrée au journal d'audit
  const addAuditLog = (action: string, details: string) => {
    if (!currentUser) return;
    
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1", // Simulé pour la démonstration
    };
    
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    StorageService.setLocalItem("audit_logs", updatedLogs);
  };

  // Ouverture du formulaire d'ajout d'utilisateur
  const handleAddUser = () => {
    setIsEditMode(false);
    setUserIdToEdit(null);
    form.reset({
      email: "",
      firstName: "",
      lastName: "",
      role: ROLES.CLIENT,
      status: "active",
      password: "",
    });
    setIsDialogOpen(true);
  };

  // Ouverture du formulaire d'édition d'utilisateur
  const handleEditUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    
    setIsEditMode(true);
    setUserIdToEdit(userId);
    form.reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      password: "", // Ne pas afficher le mot de passe existant
    });
    setIsDialogOpen(true);
  };

  // Ouverture de la boîte de dialogue de confirmation de suppression
  const handleConfirmDeleteUser = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  // Suppression d'un utilisateur
  const handleDeleteUser = () => {
    if (!userIdToDelete) return;
    
    try {
      // Récupérer les utilisateurs actuels
      const storedUsers = StorageService.getLocalItem("users") || [];
      
      // Filtrer l'utilisateur à supprimer
      const updatedUsers = storedUsers.filter((user: any) => user.id !== userIdToDelete);
      
      // Sauvegarder la liste mise à jour
      StorageService.setLocalItem("users", updatedUsers);
      
      // Mettre à jour l'état
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Journaliser l'action
      const deletedUser = users.find((u) => u.id === userIdToDelete);
      addAuditLog(
        "DELETE_USER",
        `Suppression de l'utilisateur ${deletedUser?.email}`
      );
      
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast.error("Impossible de supprimer l'utilisateur");
    } finally {
      setUserIdToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Soumission du formulaire (ajout ou modification)
  const handleSubmitUser = (values: z.infer<typeof userFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Récupérer les utilisateurs actuels
      const storedUsers = StorageService.getLocalItem("users") || [];
      
      if (isEditMode && userIdToEdit) {
        // Mise à jour d'un utilisateur existant
        const updatedUsers = storedUsers.map((user: any) => {
          if (user.id === userIdToEdit) {
            // Conserver le mot de passe existant si non modifié
            const updatedUser = {
              ...user,
              email: values.email,
              firstName: values.firstName,
              lastName: values.lastName,
              role: values.role,
              status: values.status,
            };
            
            // Mettre à jour le mot de passe seulement s'il est fourni
            if (values.password && values.password.trim() !== "") {
              updatedUser.password = btoa(values.password); // Encodage simple pour la démo
            }
            
            return updatedUser;
          }
          return user;
        });
        
        // Sauvegarder la liste mise à jour
        StorageService.setLocalItem("users", updatedUsers);
        
        // Mettre à jour l'état
        setUsers(updatedUsers);
        
        // Journaliser l'action
        addAuditLog(
          "UPDATE_USER",
          `Modification de l'utilisateur ${values.email} (rôle: ${values.role})`
        );
        
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Vérifier si l'email existe déjà
        const emailExists = storedUsers.some(
          (u: any) => u.email.toLowerCase() === values.email.toLowerCase()
        );
        
        if (emailExists) {
          toast.error("Un utilisateur avec cet email existe déjà");
          setIsSubmitting(false);
          return;
        }
        
        // Ajout d'un nouvel utilisateur
        const newUser = {
          id: `user-${Date.now()}`,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.role,
          status: values.status,
          password: btoa(values.password || "password123"), // Encodage simple pour la démo
          createdAt: new Date().toISOString(),
        };
        
        const updatedUsers = [...storedUsers, newUser];
        
        // Sauvegarder la liste mise à jour
        StorageService.setLocalItem("users", updatedUsers);
        
        // Mettre à jour l'état
        setUsers(updatedUsers);
        
        // Journaliser l'action
        addAuditLog(
          "CREATE_USER",
          `Création de l'utilisateur ${values.email} (rôle: ${values.role})`
        );
        
        toast.success("Utilisateur créé avec succès");
      }
      
      // Fermer le formulaire
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
      toast.error("Impossible de sauvegarder l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suspendre/activer un utilisateur
  const toggleUserStatus = (userId: string, newStatus: 'active' | 'suspended' | 'locked') => {
    try {
      // Récupérer les utilisateurs actuels
      const storedUsers = StorageService.getLocalItem("users") || [];
      
      // Mettre à jour le statut de l'utilisateur
      const updatedUsers = storedUsers.map((user: any) => {
        if (user.id === userId) {
          return { ...user, status: newStatus };
        }
        return user;
      });
      
      // Sauvegarder la liste mise à jour
      StorageService.setLocalItem("users", updatedUsers);
      
      // Mettre à jour l'état
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Journaliser l'action
      const targetUser = users.find((u) => u.id === userId);
      addAuditLog(
        `UPDATE_USER_STATUS`,
        `Changement de statut pour ${targetUser?.email}: ${newStatus}`
      );
      
      toast.success(`Utilisateur ${newStatus === 'active' ? 'activé' : newStatus === 'suspended' ? 'suspendu' : 'verrouillé'} avec succès`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de l'utilisateur:", error);
      toast.error("Impossible de mettre à jour le statut de l'utilisateur");
    }
  };

  // Obtenir le badge de statut d'un utilisateur
  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Actif</Badge>;
      case 'suspended':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Suspendu</Badge>;
      case 'locked':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Verrouillé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Obtenir le badge du rôle d'un utilisateur
  const getUserRoleBadge = (role: string) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Super Admin</Badge>;
      case ROLES.ADMIN:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Admin</Badge>;
      case ROLES.CLIENT:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Client</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Vérifier si l'utilisateur courant peut éditer un autre utilisateur
  const canEditUser = (userRole: string) => {
    // Le super admin peut tout faire
    if (isSuperAdmin()) return true;
    
    // Un admin normal ne peut pas éditer un super admin
    if (userRole === ROLES.SUPER_ADMIN) return false;
    
    // Un admin normal peut éditer un admin ou un client
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs, les rôles et les permissions de l'application.
          </p>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Journal d'audit
          </TabsTrigger>
        </TabsList>

        {/* Onglet Utilisateurs */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un utilisateur..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadUsers}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Chargement des utilisateurs...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getUserRoleBadge(user.role)}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-center">{getUserStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canEditUser(user.role) && (
                                  <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                )}
                                
                                {user.status !== 'active' && (
                                  <DropdownMenuItem onClick={() => toggleUserStatus(user.id, 'active')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activer
                                  </DropdownMenuItem>
                                )}
                                
                                {user.status !== 'suspended' && (
                                  <DropdownMenuItem onClick={() => toggleUserStatus(user.id, 'suspended')}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Suspendre
                                  </DropdownMenuItem>
                                )}
                                
                                {user.status !== 'locked' && (
                                  <DropdownMenuItem onClick={() => toggleUserStatus(user.id, 'locked')}>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Verrouiller
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {canEditUser(user.role) && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleConfirmDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                {filteredUsers.length} utilisateur(s) sur {users.length}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Onglet Journal d'audit */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'audit</CardTitle>
              <CardDescription>
                Historique des actions administratives sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Détails</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDate(log.timestamp)}
                            </div>
                          </TableCell>
                          <TableCell>{log.userName}</TableCell>
                          <TableCell>
                            <div className="font-medium">{log.action}</div>
                          </TableCell>
                          <TableCell className="max-w-sm truncate">
                            {log.details}
                          </TableCell>
                          <TableCell>{log.ipAddress}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Aucune entrée dans le journal d'audit
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogue d'ajout/modification d'utilisateur */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifiez les informations de l'utilisateur ci-dessous."
                : "Remplissez les informations pour créer un nouvel utilisateur."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@exemple.com"
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
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
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
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ROLES.CLIENT}>Client</SelectItem>
                        <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                        {isSuperAdmin() && (
                          <SelectItem value={ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                        <SelectItem value="locked">Verrouillé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isEditMode ? "Nouveau mot de passe (laisser vide pour ne pas modifier)" : "Mot de passe"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Enregistrement..."
                    : isEditMode
                    ? "Mettre à jour"
                    : "Créer l'utilisateur"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;