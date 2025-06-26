'use client';

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PropertyCategory, type PropertyType, type PropertyStatus } from "@/types";
import { Separator } from "./ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTAMENTO', label: 'Apartamento' },
  { value: 'CASA', label: 'Casa' },
  { value: 'LOTE', label: 'Lote' },
  { value: 'OUTRO', label: 'Outro' },
];

const CATEGORIES: { value: PropertyCategory; label: string }[] = [
    { value: 'FR', label: 'FR' },
    { value: 'L', label: 'L' },
    { value: 'FU', label: 'FU' },
    { value: 'M', label: 'M' },
    { value: 'MD', label: 'MD' },
    { value: 'VM', label: 'VM' },
];

const STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'NOVO_NA_SEMANA', label: 'Novo na Semana (Verde)' },
  { value: 'ALTERADO', label: 'Alterado (Amarelo)' },
  { value: 'VENDIDO_NA_SEMANA', label: 'Vendido na Semana (Vermelho)' },
  { value: 'VENDIDO_NO_MES', label: 'Vendido no Mês (Vermelho)' },
];


export function PropertyFormFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="brokerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Corretor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="agencyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Imobiliária (será usado como tag)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Imobiliária Sol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <FormField
              control={control}
              name="propertyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Empreendimento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Edifício Sol Nascente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="houseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº da Casa/Apto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 md:col-span-2">
            <FormField
              control={control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quartos</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banheiros</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="suites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suítes</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lavabos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lavabos</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <FormField
              control={control}
              name="areaSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Privativa (m²)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="120" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="totalAreaSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Total (m²)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="180" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="750000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Condições de Pagamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 20% de entrada + financiamento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Classificação</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Imóvel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="categories"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Categorias (serão usadas como tags)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between",
                                    !field.value?.length && "text-muted-foreground"
                                )}
                                >
                                {field.value?.length
                                    ? field.value.join(", ")
                                    : "Selecione categorias"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <div className="p-2 space-y-1">
                                    {CATEGORIES.map((category) => (
                                        <FormItem key={category.value} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(category.value)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...(field.value || []), category.value])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== category.value
                                                            )
                                                        )
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {category.label}
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status do imóvel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUSES.map(stat => (
                        <SelectItem key={stat.value} value={stat.value}>{stat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
      </div>
      
      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações Opcionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: Rua das Flores, 123" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="neighborhood"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bairro (será usado como tag)</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: Centro" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <FormField
                control={control}
                name="brokerContact"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Contato do Corretor</FormLabel>
                    <FormControl>
                    <Input placeholder="Telefone ou e-mail" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name="photoDriveLink"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Link de Fotos (Drive)</FormLabel>
                    <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name="extraMaterialLink"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel>Link de Material Extra</FormLabel>
                    <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name="additionalFeatures"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel>Características Adicionais</FormLabel>
                    <FormControl>
                    <Textarea placeholder="Descreva outras características do imóvel..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name="tags"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel>Tags Adicionais (separadas por vírgula)</FormLabel>
                    <FormControl>
                    <Input placeholder="Ex: alto padrão, investimento" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
      </div>
    </div>
  );
}
