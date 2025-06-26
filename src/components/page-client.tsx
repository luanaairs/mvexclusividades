'use client';

import { useState, useEffect, useMemo } from 'react';
import { type Property } from '@/types';
import { PageHeader } from './page-header';
import { PropertyTable } from './property-table';
import { PropertyFormDialog } from './property-form-dialog';
import { ImportDialog } from './import-dialog';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv, exportToWord } from '@/lib/export';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'exclusivity-list';
type SortableKeys = 'price' | 'areaSize' | 'bedrooms' | 'bathrooms';

const mockProperties: Property[] = [
  {
    id: 'mock-1',
    brokerName: 'Carlos Pereira',
    agencyName: 'Imóveis Litoral',
    propertyName: 'Edifício Vista Mar',
    houseNumber: '101',
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    lavabos: 1,
    areaSize: 120,
    price: 1200000,
    paymentTerms: 'Entrada de 20% + Financiamento',
    additionalFeatures: 'Piscina e academia no prédio.',
    tags: ['alto padrão', 'vista mar', 'Centro', 'Imóveis Litoral'],
    categories: ['FR', 'VM'],
    propertyType: 'APARTAMENTO',
    status: 'NOVO_NA_SEMANA',
    neighborhood: 'Centro',
    brokerContact: 'carlos.p@email.com',
    photoDriveLink: 'https://placehold.co/600x400.png',
    address: 'Av. Beira Mar, 123'
  },
  {
    id: 'mock-2',
    brokerName: 'Ana Souza',
    agencyName: 'Praia Imóveis',
    propertyName: 'Casa de Veraneio',
    houseNumber: '50',
    bedrooms: 4,
    bathrooms: 3,
    suites: 2,
    lavabos: 0,
    areaSize: 250,
    totalAreaSize: 400,
    price: 2500000,
    paymentTerms: 'À vista com 10% de desconto',
    additionalFeatures: 'Amplo jardim com churrasqueira.',
    tags: ['luxo', 'beira mar', 'Norte', 'Praia Imóveis'],
    categories: ['M'],
    propertyType: 'CASA',
    status: 'DISPONIVEL',
    neighborhood: 'Norte',
    brokerContact: 'ana.s@email.com',
  },
  {
    id: 'mock-3',
    brokerName: 'Carlos Pereira',
    agencyName: 'Imóveis Litoral',
    propertyName: 'Residencial das Flores',
    houseNumber: 'A-12',
    bedrooms: 2,
    bathrooms: 1,
    suites: 1,
    lavabos: 1,
    areaSize: 85,
    price: 850000,
    paymentTerms: 'Sinal + parcelas mensais',
    additionalFeatures: 'Salão de festas e playground.',
    tags: ['novo', 'investimento', 'Sul', 'Imóveis Litoral'],
    categories: ['L'],
    propertyType: 'APARTAMENTO',
    status: 'ALTERADO',
    neighborhood: 'Sul'
  },
  {
    id: 'mock-4',
    brokerName: 'Fernanda Lima',
    agencyName: 'Praia Imóveis',
    propertyName: 'Loteamento Sol Poente',
    houseNumber: 'Quadra C, Lote 15',
    bedrooms: 0,
    bathrooms: 0,
    suites: 0,
    lavabos: 0,
    areaSize: 500,
    price: 450000,
    paymentTerms: 'Financiamento direto com a construtora',
    additionalFeatures: 'Pronto para construir.',
    tags: ['terreno', 'oportunidade', 'Oeste', 'Praia Imóveis'],
    categories: [],
    propertyType: 'LOTE',
    status: 'DISPONIVEL',
    neighborhood: 'Oeste'
  },
  {
    id: 'mock-5',
    brokerName: 'Carlos Pereira',
    agencyName: 'Imóveis Litoral',
    propertyName: 'Cobertura Duplex',
    houseNumber: '2001',
    bedrooms: 5,
    bathrooms: 5,
    suites: 5,
    lavabos: 2,
    areaSize: 350,
    price: 5000000,
    paymentTerms: 'Entrada de 30% + Financiamento',
    additionalFeatures: 'Piscina privativa, vista panorâmica.',
    tags: ['luxo', 'cobertura', 'vista mar', 'Centro', 'Imóveis Litoral'],
    categories: ['FR', 'VM', 'MD'],
    propertyType: 'APARTAMENTO',
    status: 'VENDIDO_NA_SEMANA',
    neighborhood: 'Centro'
  },
];

export function PageClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedProperties = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProperties && storedProperties !== '[]') {
        setProperties(JSON.parse(storedProperties));
      } else {
        setProperties(mockProperties);
      }
    } catch (error) {
      console.error("Failed to load properties from local storage", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados salvos." });
      setProperties(mockProperties);
    }
  }, [toast]);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(properties));
      } catch (error) {
        console.error("Failed to save properties to local storage", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar as alterações." });
      }
    }
  }, [properties, isClient, toast]);

  const addProperty = (data: Omit<Property, 'id'>) => {
    const tags = data.tags || [];
    if (data.neighborhood && !tags.includes(data.neighborhood)) {
        tags.push(data.neighborhood);
    }
    if (data.agencyName && !tags.includes(data.agencyName)) {
      tags.push(data.agencyName);
    }
    
    const newProperty: Property = {
      id: new Date().toISOString(),
      ...data,
      tags,
    };
    setProperties(prev => [newProperty, ...prev]);
    toast({ title: "Sucesso!", description: `Imóvel "${data.propertyName}" adicionado.` });
  };
  
  const addMultipleProperties = (newPropertiesData: Omit<Property, 'id'>[]) => {
    const newProperties: Property[] = newPropertiesData.map((data, index) => {
      const tags = data.tags || [];
      if (data.neighborhood && !tags.includes(data.neighborhood)) {
          tags.push(data.neighborhood);
      }
      if (data.agencyName && !tags.includes(data.agencyName)) {
        tags.push(data.agencyName);
      }
      return {
        id: `${new Date().toISOString()}-${index}`,
        ...data,
        tags,
      };
    });
  
    setProperties(prev => [...newProperties, ...prev]);
    toast({ title: "Sucesso!", description: `${newProperties.length} imóvel${newProperties.length > 1 ? 'is' : ''} importado${newProperties.length > 1 ? 's' : ''}.` });
  };

  const updateProperty = (data: Omit<Property, 'id'>, id: string) => {
    const tags = data.tags || [];
    if (data.neighborhood && !tags.includes(data.neighborhood)) {
        tags.push(data.neighborhood);
    }
    if (data.agencyName && !tags.includes(data.agencyName)) {
      tags.push(data.agencyName);
    }
    const updatedProperty = { ...data, id, tags };
    setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
    toast({ title: "Sucesso!", description: `Imóvel "${data.propertyName}" atualizado.` });
    setEditingProperty(null);
  };
  
  const deleteProperty = (id: string) => {
    const propertyName = properties.find(p => p.id === id)?.propertyName;
    setProperties(prev => prev.filter(p => p.id !== id));
    toast({ title: "Sucesso!", description: `Imóvel "${propertyName}" excluído.` });
  };
  
  const handleEditClick = (property: Property) => {
    setEditingProperty(property);
    setAddEditDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setEditingProperty(null);
    setAddEditDialogOpen(true);
  };

  const allTags = useMemo(() => {
    return [...new Set(properties.flatMap(p => p.tags))].sort();
  }, [properties]);
  
  const toggleTagFilter = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredProperties = useMemo(() => {
    if (activeTags.length === 0) return properties;
    return properties.filter(p => activeTags.every(tag => p.tags.includes(tag)));
  }, [properties, activeTags]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProperties = useMemo(() => {
    let sortableItems = [...filteredProperties];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? 0;
        const bValue = b[sortConfig.key] ?? 0;
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProperties, sortConfig]);


  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-body">
      <div className="flex flex-col gap-6">
        <PageHeader 
          onAdd={handleAddClick}
          onImport={() => setImportDialogOpen(true)}
          onExportCsv={() => exportToCsv(properties)}
          onExportWord={() => exportToWord(properties)}
          hasProperties={properties.length > 0}
        />

        {properties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              {allTags.length > 0 ? (
                 <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={activeTags.includes(tag) ? "default" : "secondary"}
                      onClick={() => toggleTagFilter(tag)}
                      className="cursor-pointer transition-all hover:shadow-md"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {activeTags.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setActiveTags([])}>
                      <X className="h-4 w-4 mr-1"/>
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma tag foi adicionada aos imóveis ainda.</p>
              )}
            </CardContent>
          </Card>
        )}

        <main>
          <PropertyTable 
            properties={sortedProperties}
            onEdit={handleEditClick}
            onDelete={deleteProperty}
            requestSort={requestSort}
            sortConfig={sortConfig}
          />
        </main>
      </div>

      <PropertyFormDialog
        isOpen={isAddEditDialogOpen}
        onOpenChange={setAddEditDialogOpen}
        onSubmit={(data) => {
          if (editingProperty) {
            updateProperty(data, editingProperty.id);
          } else {
            addProperty(data);
          }
        }}
        property={editingProperty}
      />

      <ImportDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={addMultipleProperties}
      />
    </div>
  );
}
