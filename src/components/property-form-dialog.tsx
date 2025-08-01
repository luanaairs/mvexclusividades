'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { PropertyFormFields } from "./property-form-fields";
import { type Property, type PropertyCategory } from "@/types";
import { useEffect } from "react";

const formSchema = z.object({
  brokerName: z.string().min(1, { message: "O nome do corretor é obrigatório." }),
  agencyName: z.string().optional(),
  propertyName: z.string().min(1, { message: "O nome do empreendimento é obrigatório." }),
  houseNumber: z.string().min(1, { message: "O número é obrigatório." }),
  bedrooms: z.coerce.number().min(0, "O valor não pode ser negativo."),
  bathrooms: z.coerce.number().min(0, "O valor não pode ser negativo."),
  suites: z.coerce.number().min(0, "O valor não pode ser negativo."),
  lavabos: z.coerce.number().min(0, "O valor não pode ser negativo."),
  areaSize: z.coerce.number().positive("A área privativa deve ser um número positivo."),
  totalAreaSize: z.coerce.number().positive("A área total deve ser um número positivo.").optional().or(z.literal('')),
  price: z.coerce.number().positive("O preço deve ser um número positivo."),
  paymentTerms: z.string().min(1, { message: "As condições de pagamento são obrigatórias." }),
  additionalFeatures: z.string().optional(),
  tags: z.string().optional(),
  propertyType: z.enum(['CASA', 'APARTAMENTO', 'LOTE', 'OUTRO'], { required_error: "O tipo de imóvel é obrigatório." }),
  categories: z.array(z.enum(['FR', 'L', 'FU', 'M', 'MD', 'VM'])).optional(),
  status: z.enum(['DISPONIVEL', 'NOVO_NA_SEMANA', 'ALTERADO', 'VENDIDO_NA_SEMANA', 'VENDIDO_NO_MES'], { required_error: "O status é obrigatório." }),
  brokerContact: z.string().optional(),
  photoDriveLink: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
  extraMaterialLink: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
});


type FormValues = z.infer<typeof formSchema>;

interface PropertyFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Omit<Property, 'id'>) => void;
  property?: Property | null;
}

const defaultValues: FormValues = {
    brokerName: '',
    agencyName: '',
    propertyName: '',
    houseNumber: '',
    bedrooms: 0,
    bathrooms: 0,
    suites: 0,
    lavabos: 0,
    areaSize: 0,
    totalAreaSize: '',
    price: 0,
    paymentTerms: '',
    additionalFeatures: '',
    tags: '',
    propertyType: 'APARTAMENTO',
    categories: [],
    status: 'DISPONIVEL',
    brokerContact: '',
    photoDriveLink: '',
    extraMaterialLink: '',
    address: '',
    neighborhood: ''
};

export function PropertyFormDialog({ isOpen, onOpenChange, onSubmit, property }: PropertyFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });

  useEffect(() => {
    if (isOpen) {
      if (property) {
        form.reset({
          ...property,
          totalAreaSize: property.totalAreaSize || '',
          tags: property.tags.join(', '),
          categories: property.categories || [],
          brokerContact: property.brokerContact || '',
          photoDriveLink: property.photoDriveLink || '',
          extraMaterialLink: property.extraMaterialLink || '',
          address: property.address || '',
          neighborhood: property.neighborhood || '',
          agencyName: property.agencyName || '',
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [property, form, isOpen]);

  const handleFormSubmit = (data: FormValues) => {
    const propertyData: Omit<Property, 'id'> = {
      ...data,
      totalAreaSize: Number(data.totalAreaSize) || undefined,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      categories: data.categories as PropertyCategory[] || undefined,
      brokerContact: data.brokerContact || undefined,
      photoDriveLink: data.photoDriveLink || undefined,
      extraMaterialLink: data.extraMaterialLink || undefined,
      address: data.address || undefined,
      neighborhood: data.neighborhood || undefined,
      agencyName: data.agencyName || undefined,
    };
    onSubmit(propertyData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{property ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <PropertyFormFields />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">{property ? 'Salvar Alterações' : 'Adicionar Imóvel'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
