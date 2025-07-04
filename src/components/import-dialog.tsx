'use client';

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Property, type PropertyCategory, type PropertyType, type PropertyStatus, type OcrOutput } from "@/types";
import { performOcr } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileUp, Trash2, PlusCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const propertySchema = z.object({
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
  categories: z.string().optional(),
  status: z.enum(['DISPONIVEL', 'NOVO_NA_SEMANA', 'ALTERADO', 'VENDIDO_NA_SEMANA', 'VENDIDO_NO_MES'], { required_error: "O status é obrigatório." }),
  brokerContact: z.string().optional(),
  photoDriveLink: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
  extraMaterialLink: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
});

const formSchema = z.object({
  properties: z.array(propertySchema)
});

type FormValues = z.infer<typeof formSchema>;

const defaultPropertyValues: FormValues['properties'][number] = {
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
  propertyType: 'APARTAMENTO' as PropertyType,
  categories: '',
  status: 'DISPONIVEL' as PropertyStatus,
  brokerContact: '',
  photoDriveLink: '',
  extraMaterialLink: '',
  address: '',
  neighborhood: '',
};


interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (data: Omit<Property, 'id'>[]) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTAMENTO', label: 'Apartamento' },
  { value: 'CASA', label: 'Casa' },
  { value: 'LOTE', label: 'Lote' },
  { value: 'OUTRO', label: 'Outro' },
];

const STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'NOVO_NA_SEMANA', label: 'Novo na Semana' },
  { value: 'ALTERADO', label: 'Alterado' },
  { value: 'VENDIDO_NA_SEMANA', label: 'Vendido na Semana' },
  { value: 'VENDIDO_NO_MES', label: 'Vendido no Mês' },
];


export function ImportDialog({ isOpen, onOpenChange, onImport }: ImportDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [ocrText, setOcrText] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      properties: []
    }
  });
  
  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "properties"
  });

  const resetDialog = () => {
    setOcrText(null);
    form.reset({ properties: [] });
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      startTransition(async () => {
        const result = await performOcr({ documentDataUri: reader.result as string });
        if (result.success && result.data) {
          setOcrText(result.data.text);
          append(defaultPropertyValues, { shouldFocus: false });
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
    const propertiesData: Omit<Property, 'id'>[] = data.properties.map(p => ({
      ...p,
      totalAreaSize: Number(p.totalAreaSize) || undefined,
      tags: p.tags ? p.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      categories: p.categories ? p.categories.split(',').map(tag => tag.trim().toUpperCase() as PropertyCategory).filter(Boolean) : [],
      brokerContact: p.brokerContact || undefined,
      photoDriveLink: p.photoDriveLink || undefined,
      extraMaterialLink: p.extraMaterialLink || undefined,
      address: p.address || undefined,
      neighborhood: p.neighborhood || undefined,
      agencyName: p.agencyName || undefined,
    }));
    onImport(propertiesData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if(!open) resetDialog();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importar Imóveis de Documento</DialogTitle>
          <DialogDescription>
            {ocrText ? "Copie as informações do texto extraído para os cartões de imóveis." : "Selecione um arquivo .docx, .pdf ou imagem para extrair o texto com OCR."}
          </DialogDescription>
        </DialogHeader>
        {isPending ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Extraindo texto do documento...</p>
          </div>
        ) : ocrText !== null ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                 <div className="flex flex-col">
                    <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Texto Extraído (OCR)</h3>
                    <ScrollArea className="border rounded-md p-2 flex-grow">
                        <pre className="text-xs whitespace-pre-wrap font-sans">{ocrText}</pre>
                    </ScrollArea>
                </div>
                <div className="flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                         <h3 className="font-semibold text-sm text-muted-foreground">Imóveis para Adicionar</h3>
                         <Button type="button" size="sm" variant="outline" onClick={() => append(defaultPropertyValues)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </div>
                  <ScrollArea className="border rounded-md p-1 md:p-2 flex-grow">
                    <div className="space-y-4 p-1">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="relative">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
                                <CardTitle className="text-base">Imóvel {index + 1}</CardTitle>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                                    <FormField control={form.control} name={`properties.${index}.propertyName`} render={({ field }) => ( <FormItem><FormLabel>Empreendimento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name={`properties.${index}.houseNumber`} render={({ field }) => ( <FormItem><FormLabel>Nº</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name={`properties.${index}.price`} render={({ field }) => ( <FormItem><FormLabel>Preço</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name={`properties.${index}.bedrooms`} render={({ field }) => ( <FormItem><FormLabel>Quartos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name={`properties.${index}.suites`} render={({ field }) => ( <FormItem><FormLabel>Suítes</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name={`properties.${index}.bathrooms`} render={({ field }) => ( <FormItem><FormLabel>Banheiros</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name={`properties.${index}.areaSize`} render={({ field }) => ( <FormItem><FormLabel>Área Priv.</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name={`properties.${index}.propertyType`} render={({ field }) => (
                                        <FormItem><FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {PROPERTY_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                                        </SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`properties.${index}.status`} render={({ field }) => (
                                        <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {STATUSES.map(stat => (<SelectItem key={stat.value} value={stat.value}>{stat.label}</SelectItem>))}
                                        </SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`properties.${index}.brokerName`} render={({ field }) => ( <FormItem className="sm:col-span-2 md:col-span-1"><FormLabel>Corretor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                     <FormField control={form.control} name={`properties.${index}.paymentTerms`} render={({ field }) => ( <FormItem className="sm:col-span-2"><FormLabel>Cond. Pagamento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter className="mt-6 pt-4 border-t flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={fields.length === 0}>Adicionar {fields.length} Imóve{fields.length > 1 ? 'is' : 'l'} à Tabela</Button>
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
