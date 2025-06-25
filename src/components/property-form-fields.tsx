'use client';

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PropertyFormFields() {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      <FormField
        control={control}
        name="agentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Corretor/Empresa</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Imobiliária Exemplo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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
      <div className="grid grid-cols-3 gap-4">
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
      </div>
      <div className="grid grid-cols-2 gap-4">
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
          <FormItem>
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
          <FormItem>
            <FormLabel>Condições de Pagamento</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 20% de entrada + financiamento" {...field} />
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
            <FormLabel>Tags (separadas por vírgula)</FormLabel>
            <FormControl>
              <Input placeholder="Ex: alto padrão, vista mar, novo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
