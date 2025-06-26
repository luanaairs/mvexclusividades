'use client';

import { useState } from 'react';
import { type Property, type PropertyStatus, type PropertyCategory } from "@/types";
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
import { Edit, Trash2, Home, ArrowUp, ArrowDown, ChevronsUpDown, BedDouble, Bath, CarFront, SquareStack } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

type SortableKeys = 'price' | 'areaSize' | 'bedrooms' | 'bathrooms';

interface PropertyTableProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  requestSort: (key: SortableKeys) => void;
  sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatPropertyType = (type: string) => {
    const lower = type.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const renderStatusBadge = (status: PropertyStatus) => {
  switch (status) {
    case 'DISPONIVEL':
      return <Badge variant="outline">Disponível</Badge>;
    case 'NOVO_NA_SEMANA':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Novo</Badge>;
    case 'ALTERADO':
      return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black">Alterado</Badge>;
    case 'VENDIDO_NA_SEMANA':
    case 'VENDIDO_NO_MES':
      return <Badge variant="destructive">Vendido</Badge>;
    default:
      const exhaustiveCheck: never = status;
      return null;
  }
};

const categoryMap: Record<PropertyCategory, string> = {
    'FR': 'Frente',
    'L': 'Lateral',
    'FU': 'Fundos',
    'M': 'Mobiliado',
    'MD': 'Decorado',
    'VM': 'Vista p/ Mar'
};

const formatCategory = (category: PropertyCategory) => {
    return categoryMap[category] || category;
}

export function PropertyTable({ properties, onEdit, onDelete, requestSort, sortConfig }: PropertyTableProps) {
  const [deleteCandidate, setDeleteCandidate] = useState<Property | null>(null);

  const getSortIcon = (name: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== name) {
      return <ChevronsUpDown className="h-4 w-4 ml-2 opacity-30" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="h-4 w-4 ml-2" />;
    }
    return <ArrowDown className="h-4 w-4 ml-2" />;
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
      {/* Desktop View */}
      <div className="hidden md:block">
        <Card className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Empreendimento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" onClick={() => requestSort('bedrooms')}>
                    Q/B/S/L
                    {getSortIcon('bedrooms')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" onClick={() => requestSort('areaSize')}>
                    Área (m²)
                    {getSortIcon('areaSize')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('price')}>
                    Preço
                    {getSortIcon('price')}
                  </Button>
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow 
                  key={property.id} 
                  className={cn((property.status === 'VENDIDO_NA_SEMANA' || property.status === 'VENDIDO_NO_MES') && 'line-through text-muted-foreground/80')}
                >
                  <TableCell>{renderStatusBadge(property.status)}</TableCell>
                  <TableCell className="font-medium">{property.propertyName} - {property.houseNumber}</TableCell>
                  <TableCell>{formatPropertyType(property.propertyType)}</TableCell>
                  <TableCell className="text-center">{`${property.bedrooms}/${property.bathrooms}/${property.suites}/${property.lavabos}`}</TableCell>
                  <TableCell className="text-center">{property.areaSize}{property.totalAreaSize ? ` / ${property.totalAreaSize}`: ''}</TableCell>
                  <TableCell>{formatCurrency(property.price)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {property.categories?.map((cat) => <Badge key={cat} variant="outline">{formatCategory(cat)}</Badge>)}
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
      </div>

      {/* Mobile View */}
      <div className="md:hidden mt-4 space-y-4">
        {properties.map((property) => (
            <Card key={property.id} className={cn((property.status === 'VENDIDO_NA_SEMANA' || property.status === 'VENDIDO_NO_MES') && 'opacity-60')}>
              <CardHeader>
                  <div className="flex justify-between items-start">
                      <div>
                          <CardTitle className={cn("text-lg", (property.status === 'VENDIDO_NA_SEMANA' || property.status === 'VENDIDO_NO_MES') && 'line-through')}>
                            {property.propertyName} - {property.houseNumber}
                          </CardTitle>
                          <CardDescription>{formatPropertyType(property.propertyType)}</CardDescription>
                      </div>
                      {renderStatusBadge(property.status)}
                  </div>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className={cn("text-2xl font-bold text-primary", (property.status === 'VENDIDO_NA_SEMANA' || property.status === 'VENDIDO_NO_MES') && 'line-through')}>
                      {formatCurrency(property.price)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><BedDouble className="h-4 w-4" /> <span>{property.bedrooms} Quartos</span></div>
                      <div className="flex items-center gap-2"><Bath className="h-4 w-4" /> <span>{property.bathrooms} Banheiros</span></div>
                      <div className="flex items-center gap-2"><CarFront className="h-4 w-4" /> <span>{property.suites} Suítes</span></div>
                      <div className="flex items-center gap-2"><SquareStack className="h-4 w-4" /> <span>{property.areaSize}m²</span></div>
                  </div>
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {property.categories?.map((cat) => <Badge key={cat} variant="outline">{formatCategory(cat)}</Badge>)}
                    {property.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(property)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteCandidate(property)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                </Button>
              </CardFooter>
            </Card>
        ))}
      </div>
      
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
