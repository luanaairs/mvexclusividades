'use client';

import { useState } from 'react';
import { type Property } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Home } from "lucide-react";
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
import { Card, CardContent } from './ui/card';

interface PropertyTableProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
}

export function PropertyTable({ properties, onEdit, onDelete }: PropertyTableProps) {
  const [deleteCandidate, setDeleteCandidate] = useState<Property | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  if (properties.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center p-16">
          <Home className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-2xl font-semibold font-headline">Nenhum imóvel na lista</h3>
          <p className="text-muted-foreground">Comece adicionando um imóvel manualmente ou importando de um documento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Corretor/Empresa</TableHead>
              <TableHead>Empreendimento</TableHead>
              <TableHead className="text-center">Q/B/S</TableHead>
              <TableHead className="text-center">Área (m²)</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.agentName}</TableCell>
                <TableCell>{property.propertyName}</TableCell>
                <TableCell className="text-center">{`${property.bedrooms}/${property.bathrooms}/${property.suites}`}</TableCell>
                <TableCell className="text-center">{property.areaSize}{property.totalAreaSize ? ` / ${property.totalAreaSize}`: ''}</TableCell>
                <TableCell>{formatCurrency(property.price)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {property.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(property)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteCandidate(property)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      <AlertDialog open={!!deleteCandidate} onOpenChange={(isOpen) => !isOpen && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o imóvel
              <span className="font-bold"> "{deleteCandidate?.propertyName}" </span>
              da sua lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteCandidate) {
                  onDelete(deleteCandidate.id);
                  setDeleteCandidate(null);
                }
              }}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
