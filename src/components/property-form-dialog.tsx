'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { PropertyFormFields } from "./property-form-fields";
import { type Property } from "@/types";
import { useEffect } from "react";

const formSchema = z.object({
  agentName: z.string().min(1, { message: "O nome do corretor/empresa é obrigatório." }),
  propertyName: z.string().min(1, { message: "O nome do empreendimento é obrigatório." }),
  bedrooms: z.coerce.number().min(0, "O valor não pode ser negativo."),
  bathrooms: z.coerce.number().min(0, "O valor não pode ser negativo."),
  suites: z.coerce.number().min(0, "O valor não pode ser negativo."),
  areaSize: z.coerce.number().positive("A área privativa deve ser um número positivo."),
  totalAreaSize: z.coerce.number().positive("A área total deve ser um número positivo.").optional().or(z.literal('')),
  price: z.coerce.number().positive("O preço deve ser um número positivo."),
  paymentTerms: z.string().min(1, { message: "As condições de pagamento são obrigatórias." }),
  additionalFeatures: z.string().optional(),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Omit<Property, 'id'>) => void;
  property?: Property | null;
}

export function PropertyFormDialog({ isOpen, onOpenChange, onSubmit, property }: PropertyFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agentName: '',
      propertyName: '',
      bedrooms: 0,
      bathrooms: 0,
      suites: 0,
      areaSize: 0,
      totalAreaSize: '',
      price: 0,
      paymentTerms: '',
      additionalFeatures: '',
      tags: '',
    }
  });

  useEffect(() => {
    if (property) {
      form.reset({
        ...property,
        totalAreaSize: property.totalAreaSize || '',
        tags: property.tags.join(', '),
      });
    } else {
      form.reset({
        agentName: '',
        propertyName: '',
        bedrooms: 0,
        bathrooms: 0,
        suites: 0,
        areaSize: 0,
        totalAreaSize: '',
        price: 0,
        paymentTerms: '',
        additionalFeatures: '',
        tags: '',
      });
    }
  }, [property, form, isOpen]);

  const handleFormSubmit = (data: FormValues) => {
    const propertyData = {
      ...data,
      totalAreaSize: Number(data.totalAreaSize) || undefined,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
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
