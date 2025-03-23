
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Clock, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types/product";

interface LowStockProductsProps {
  products: Product[];
}

export function LowStockProductsCard({ products }: LowStockProductsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
              Stock de produits faibles
            </CardTitle>
            <CardDescription>
              Produits nécessitant un réapprovisionnement
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            Commander
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || '-'}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">{product.stock}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  Aucun produit en stock faible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface PendingQuoteRequest {
  id: string;
  customer: string;
  date: string;
  type: string;
  status: string;
}

interface PendingQuoteRequestsProps {
  quotes: PendingQuoteRequest[];
}

export function PendingQuoteRequestsCard({ quotes }: PendingQuoteRequestsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Demandes de devis en attente
            </CardTitle>
            <CardDescription>
              Demandes de devis à traiter
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{quote.id}</TableCell>
                <TableCell>{quote.customer}</TableCell>
                <TableCell>{quote.type}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="mr-2">
                    Traiter
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function AdminNotifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">Stock faible pour 3 produits</p>
              <p className="text-sm text-muted-foreground">Il y a 2 heures</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Nouvelle demande de devis</p>
              <p className="text-sm text-muted-foreground">Il y a 3 heures</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
