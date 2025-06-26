'use client';

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Property, type PropertyCategory, type PropertyType, type PropertyStatus } from "@/types";
import { extractPropertyDetails } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileUp, Trash2 } from "lucide-react";
import { type ExtractPropertyDetailsOutput, type PropertyDetails } from "@/ai/flows/extract-property-details";
import { ScrollArea } from "./ui/scroll-area";

const propertySchema = z.object({
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

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (data: Omit<Property, 'id'>[]) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTAMENTO', label: 'Apartamento' },
  { value: 'CASA', label: 'Casa' },
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
  const [extractedData, setExtractedData] = useState<ExtractPropertyDetailsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      properties: []
    }
  });
  
  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "properties"
  });

  const resetDialog = () => {
    setExtractedData(null);
    form.reset({ properties: [] });
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      startTransition(async () => {
        const result = await extractPropertyDetails({ documentDataUri: reader.result as string });
        if (result.success && result.data && result.data.properties) {
          if (result.data.properties.length === 0) {
              toast({ variant: "default", title: "Nenhum imóvel encontrado", description: "Não foi possível identificar imóveis no documento." });
              return;
          }
          setExtractedData(result.data);
          const formattedProperties = result.data.properties.map((p: PropertyDetails) => ({
            agentName: p.agentName || '',
            propertyName: p.propertyName || '',
            houseNumber: p.houseNumber || '',
            bedrooms: p.bedrooms ?? 0,
            bathrooms: p.bathrooms ?? 0,
            suites: p.suites ?? 0,
            lavabos: p.lavabos ?? 0,
            areaSize: p.areaSize ?? 0,
            totalAreaSize: '',
            price: p.price ?? 0,
            paymentTerms: p.paymentTerms || '',
            additionalFeatures: p.additionalFeatures || '',
            tags: '',
            propertyType: p.propertyType || 'OUTRO',
            category: p.category || '',
            status: 'NOVO_NA_SEMANA' as PropertyStatus,
            brokerContact: p.brokerContact || '',
            photoDriveLink: p.photoDriveLink || '',
            extraMaterialLink: p.extraMaterialLink || '',
            address: p.address || '',
            neighborhood: p.neighborhood || '',
          }));
          form.reset({ properties: formattedProperties });
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
      category: p.category as PropertyCategory || undefined,
      brokerContact: p.brokerContact || undefined,
      photoDriveLink: p.photoDriveLink || undefined,
      extraMaterialLink: p.extraMaterialLink || undefined,
      address: p.address || undefined,
      neighborhood: p.neighborhood || undefined,
    }));
    onImport(propertiesData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if(!open) resetDialog();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle>Importar Imóveis de Documento</DialogTitle>
          <DialogDescription>
            {extractedData ? "Confira os dados extraídos, edite se necessário e adicione à sua lista." : "Selecione um arquivo .docx, .pdf ou imagem para extrair os dados dos imóveis."}
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
              <ScrollArea className="h-[60vh] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Empreendimento</TableHead>
                      <TableHead className="w-[80px]">Nº</TableHead>
                      <TableHead className="w-[100px]">Preço (R$)</TableHead>
                      <TableHead className="w-[80px]">Quartos</TableHead>
                      <TableHead className="w-[80px]">Suítes</TableHead>
                      <TableHead className="w-[100px]">Área (m²)</TableHead>
                      <TableHead className="w-[150px]">Tipo</TableHead>
                      <TableHead className="w-[150px]">Status</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField control={form.control} name={`properties.${index}.propertyName`} render={({ field }) => ( <Input {...field} /> )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`properties.${index}.houseNumber`} render={({ field }) => ( <Input {...field} /> )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`properties.${index}.price`} render={({ field }) => ( <Input type="number" {...field} /> )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`properties.${index}.bedrooms`} render={({ field }) => ( <Input type="number" {...field} /> )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`properties.${index}.suites`} render={({ field }) => ( <Input type="number" {...field} /> )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`properties.${index}.areaSize`} render={({ field }) => ( <Input type="number" {...field} /> )} />
                        </TableCell>
                        <TableCell>
                           <FormField
                              control={form.control}
                              name={`properties.${index}.propertyType`}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {PROPERTY_TYPES.map(type => (
                                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                        </TableCell>
                         <TableCell>
                           <FormField
                              control={form.control}
                              name={`properties.${index}.status`}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {STATUSES.map(stat => (
                                      <SelectItem key={stat.value} value={stat.value}>{stat.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                        </TableCell>
                        <TableCell>
                           <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <DialogFooter className="mt-6 pt-4 border-t">
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
                <p className="text-xs text-muted-foreground">DOCX, PDF ou Imagem (com um ou mais imóveis)</p>
              </div>
              <Input id="file-upload" type="file" className="hidden" accept=".docx,.pdf,image/*" onChange={handleFileChange} />
            </label>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
