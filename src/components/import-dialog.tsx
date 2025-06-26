'use client';

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PropertyFormFields } from "./property-form-fields";
import { type Property, type PropertyCategory, type PropertyType, type PropertyStatus } from "@/types";
import { extractPropertyDetails } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileUp } from "lucide-react";
import { ExtractPropertyDetailsOutput } from "@/ai/flows/extract-property-details";

const formSchema = z.object({
  agentName: z.string().min(1, { message: "O nome do corretor/empresa é obrigatório." }),
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
  propertyType: z.enum(['CASA', 'APARTAMENTO', 'OUTRO'], { required_error: "O tipo de imóvel é obrigatório." }),
  category: z.enum(['FRENTE', 'LATERAL', 'FUNDOS', 'DECORADO', 'MOBILIADO', 'COM_VISTA_PARA_O_MAR']).optional().or(z.literal('')),
  status: z.enum(['NOVO_NA_SEMANA', 'ALTERADO', 'VENDIDO_NA_SEMANA', 'VENDIDO_NO_MES'], { required_error: "O status é obrigatório." }),
});

type FormValues = z.infer<typeof formSchema>;

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (data: Omit<Property, 'id'>) => void;
}

export function ImportDialog({ isOpen, onOpenChange, onImport }: ImportDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [extractedData, setExtractedData] = useState<ExtractPropertyDetailsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'NOVO_NA_SEMANA'
    }
  });

  const resetDialog = () => {
    setExtractedData(null);
    form.reset({
      status: 'NOVO_NA_SEMANA',
      agentName: '',
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
      category: '',
    });
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      startTransition(async () => {
        const result = await extractPropertyDetails({ documentDataUri: reader.result as string });
        if (result.success && result.data) {
          setExtractedData(result.data);
          form.reset({
            ...result.data,
            houseNumber: result.data.houseNumber || '',
            lavabos: result.data.lavabos || 0,
            propertyType: result.data.propertyType || undefined,
            status: 'NOVO_NA_SEMANA',
            totalAreaSize: '',
            tags: '',
            category: '',
          });
        } else {
          toast({ variant: "destructive", title: "Erro na Importação", description: result.error });
          onOpenChange(false);
        }
      });
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao ler o arquivo." });
    };
  };

  const handleFormSubmit = (data: FormValues) => {
    const propertyData: Omit<Property, 'id'> = {
      ...data,
      totalAreaSize: Number(data.totalAreaSize) || undefined,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      category: data.category || undefined,
    };
    onImport(propertyData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if(!open) resetDialog();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Importar Imóvel de Documento</DialogTitle>
          <DialogDescription>
            {extractedData ? "Confira os dados extraídos, edite se necessário e salve." : "Selecione um arquivo .docx, .pdf ou imagem para extrair os dados do imóvel."}
          </DialogDescription>
        </DialogHeader>
        {isPending ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Analisando documento... Isso pode levar alguns segundos.</p>
          </div>
        ) : extractedData ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <PropertyFormFields />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Adicionar à Tabela</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-8">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Clique para carregar</span> ou arraste e solte
                </p>
                <p className="text-xs text-muted-foreground">DOCX, PDF ou Imagem</p>
              </div>
              <Input id="file-upload" type="file" className="hidden" accept=".docx,.pdf,image/*" onChange={handleFileChange} />
            </label>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
