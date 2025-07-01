'use client';

import { type Property } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, FileText, BedSingle, BedDouble, Bath, SquareStack, DollarSign } from "lucide-react";

interface PropertyDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  property: Property | null;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const statusLabels: Record<Property['status'], string> = {
  DISPONIVEL: 'Disponível',
  NOVO_NA_SEMANA: 'Novo na Semana',
  ALTERADO: 'Alterado',
  VENDIDO_NA_SEMANA: 'Vendido na Semana',
  VENDIDO_NO_MES: 'Vendido no Mês',
};

const getStatusVariant = (status: Property['status']): 'destructive' | 'secondary' | 'outline' | 'default' => {
    switch (status) {
        case 'VENDIDO_NA_SEMANA':
        case 'VENDIDO_NO_MES':
            return 'destructive';
        case 'NOVO_NA_SEMANA':
            return 'default'; // will be green
        case 'ALTERADO':
            return 'secondary'; // will be yellow
        case 'DISPONIVEL':
            return 'outline';
        default:
            return 'outline';
    }
}

const getStatusClass = (status: Property['status']): string => {
    switch (status) {
        case 'NOVO_NA_SEMANA':
            return 'bg-green-500 hover:bg-green-600';
        case 'ALTERADO':
            return 'bg-yellow-500 hover:bg-yellow-600 text-black';
        default:
            return '';
    }
}


export function PropertyDetailsDialog({ isOpen, onOpenChange, property }: PropertyDetailsDialogProps) {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{property.propertyName} - {property.houseNumber}</DialogTitle>
          <DialogDescription>
            {property.address && `${property.address}, `}{property.neighborhood}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary"/>
                    <span className="font-semibold text-lg">{formatCurrency(property.price)}</span>
                </div>
                 <div className="flex items-center gap-2 sm:justify-end">
                    <Badge variant={getStatusVariant(property.status)} className={getStatusClass(property.status)}>{statusLabels[property.status]}</Badge>
                </div>
            </div>

            <Separator />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/50">
                    <BedSingle className="h-6 w-6 text-muted-foreground" />
                    <span className="font-bold">{property.bedrooms}</span>
                    <span className="text-xs text-muted-foreground">Quartos</span>
                </div>
                 <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/50">
                    <Bath className="h-6 w-6 text-muted-foreground" />
                    <span className="font-bold">{property.bathrooms}</span>
                    <span className="text-xs text-muted-foreground">Banheiros</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/50">
                    <BedDouble className="h-6 w-6 text-muted-foreground" />
                    <span className="font-bold">{property.suites}</span>
                    <span className="text-xs text-muted-foreground">Suítes</span>
                </div>
                 <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/50">
                    <SquareStack className="h-6 w-6 text-muted-foreground" />
                    <span className="font-bold">{property.areaSize}m²</span>
                    <span className="text-xs text-muted-foreground">Área Priv.</span>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold">Detalhes do Imóvel</h4>
                <p><span className="font-medium">Tipo:</span> {property.propertyType}</p>
                {property.totalAreaSize && <p><span className="font-medium">Área Total:</span> {property.totalAreaSize}m²</p>}
                <p><span className="font-medium">Lavabos:</span> {property.lavabos}</p>
                {property.additionalFeatures && <p><span className="font-medium">Características Adicionais:</span> {property.additionalFeatures}</p>}
            </div>

            <Separator />

             <div className="space-y-2">
                <h4 className="font-semibold">Informações de Contato e Venda</h4>
                <p><span className="font-medium">Corretor:</span> {property.brokerName}</p>
                {property.agencyName && <p><span className="font-medium">Imobiliária:</span> {property.agencyName}</p>}
                {property.brokerContact && <p><span className="font-medium">Contato do Corretor:</span> {property.brokerContact}</p>}
                <p><span className="font-medium">Condições de Pagamento:</span> {property.paymentTerms}</p>
            </div>
            
            <Separator />
            
            <div>
                 <h4 className="font-semibold mb-2">Tags & Categorias</h4>
                 <div className="flex flex-wrap gap-2">
                    {property.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            </div>

        </div>
        <DialogFooter className="sm:justify-start gap-2 border-t pt-4">
          {property.photoDriveLink && (
            <Button asChild variant="outline">
              <a href={property.photoDriveLink} target="_blank" rel="noopener noreferrer">
                <Camera className="mr-2 h-4 w-4" /> Ver Fotos
              </a>
            </Button>
          )}
          {property.extraMaterialLink && (
            <Button asChild variant="outline">
              <a href={property.extraMaterialLink} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" /> Material Extra
              </a>
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
