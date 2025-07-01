'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { type Property, type PropertyStatus, type PropertyType } from '@/types';
import { PageHeader } from './page-header';
import { PropertyTable } from './property-table';
import { PropertyFormDialog } from './property-form-dialog';
import { ImportDialog } from './import-dialog';
import { ShareDialog } from './share-dialog';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv, exportToWord, exportToJson } from '@/lib/export';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';
import { PropertyDetailsDialog } from './property-details-dialog';
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
import { useAuth } from '@/context/auth-context';

const LOCAL_STORAGE_KEY = 'exclusivity-list';
const SHARED_LISTS_KEY = 'shared-property-lists';
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
        propertyType: 'APARTAMENTO',
        status: 'NOVO_NA_SEMANA',
        neighborhood: 'Centro',
        categories: ['FR', 'VM'],
        tags: ['alto padrão', 'vista mar', 'Centro', 'Imóveis Litoral', 'APARTAMENTO', 'NOVO_NA_SEMANA', 'FR', 'VM'],
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
        propertyType: 'CASA',
        status: 'DISPONIVEL',
        neighborhood: 'Norte',
        categories: ['M'],
        tags: ['luxo', 'beira mar', 'Norte', 'Praia Imóveis', 'CASA', 'DISPONIVEL', 'M'],
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
        propertyType: 'APARTAMENTO',
        status: 'ALTERADO',
        neighborhood: 'Sul',
        categories: ['L'],
        tags: ['novo', 'investimento', 'Sul', 'Imóveis Litoral', 'APARTAMENTO', 'ALTERADO', 'L'],
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
        propertyType: 'LOTE',
        status: 'DISPONIVEL',
        neighborhood: 'Oeste',
        categories: [],
        tags: ['terreno', 'oportunidade', 'Oeste', 'Praia Imóveis', 'LOTE', 'DISPONIVEL'],
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
        propertyType: 'APARTAMENTO',
        status: 'VENDIDO_NA_SEMANA',
        neighborhood: 'Centro',
        categories: ['FR', 'VM', 'MD'],
        tags: ['luxo', 'cobertura', 'vista mar', 'Centro', 'Imóveis Litoral', 'APARTAMENTO', 'VENDIDO_NA_SEMANA', 'FR', 'VM', 'MD'],
        extraMaterialLink: 'https://placehold.co/600x400.png',
    },
];

const STATUS_LABELS: Record<PropertyStatus, string> = {
    DISPONIVEL: 'Disponível',
    NOVO_NA_SEMANA: 'Novo na Semana',
    ALTERADO: 'Alterado',
    VENDIDO_NA_SEMANA: 'Vendido na Semana',
    VENDIDO_NO_MES: 'Vendido no Mês',
};

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
    CASA: 'Casa',
    APARTAMENTO: 'Apartamento',
    LOTE: 'Lote',
    OUTRO: 'Outro',
}

export function PageClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const { user, logout } = useAuth();
  
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');

  const jsonImportRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedProperties = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProperties && storedProperties !== '[]' && JSON.parse(storedProperties).length > 0) {
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
    if (user) { // Only save if user is logged in
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(properties));
      } catch (error) {
        console.error("Failed to save properties to local storage", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar as alterações." });
      }
    }
  }, [properties, user, toast]);

  const addOrUpdateTags = (data: Omit<Property, 'id'>): string[] => {
    let baseTags = data.tags || [];
    const fieldsToTag = [data.neighborhood, data.agencyName, data.propertyType, data.status];
    
    fieldsToTag.forEach(field => {
        if (field && !baseTags.includes(field)) {
            baseTags.push(field);
        }
    });

    if (data.categories) {
      baseTags = [...baseTags, ...data.categories];
    }
    
    // Return a unique set of tags
    return [...new Set(baseTags)];
  };

  const addProperty = (data: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      id: new Date().toISOString(),
      ...data,
      tags: addOrUpdateTags(data),
    };
    setProperties(prev => [newProperty, ...prev]);
    toast({ title: "Sucesso!", description: `Imóvel "${data.propertyName}" adicionado.` });
  };
  
  const addMultipleProperties = (newPropertiesData: Omit<Property, 'id'>[]) => {
    const newProperties: Property[] = newPropertiesData.map((data, index) => ({
      id: `${new Date().toISOString()}-${index}`,
      ...data,
      tags: addOrUpdateTags(data),
    }));
  
    setProperties(prev => [...newProperties, ...prev]);
    toast({ title: "Sucesso!", description: `${newProperties.length} imóvel${newProperties.length > 1 ? 'is' : ''} importado${newProperties.length > 1 ? 's' : ''}.` });
  };

  const updateProperty = (data: Omit<Property, 'id'>, id: string) => {
    const updatedProperty = { ...data, id, tags: addOrUpdateTags(data) };
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

  const handleViewDetailsClick = (property: Property) => {
    setViewingProperty(property);
  };
  
  const handleAddClick = () => {
    setEditingProperty(null);
    setAddEditDialogOpen(true);
  };
  
  const handleExportJson = () => {
    exportToJson(properties);
    toast({ title: "Sucesso!", description: "Backup JSON exportado." });
  };

  const handleImportJsonClick = () => {
    jsonImportRef.current?.click();
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File could not be read.");
        }
        const data = JSON.parse(text);

        if (Array.isArray(data) && (data.length === 0 || (data[0].id && data[0].propertyName))) {
          setProperties(data);
          toast({ title: "Sucesso!", description: `${data.length} imóvel${data.length > 1 ? 's' : ''} importado${data.length > 1 ? 's' : ''} do backup.` });
        } else {
          throw new Error("Invalid JSON format for properties.");
        }
      } catch (error) {
        console.error("Failed to import JSON:", error);
        toast({ variant: "destructive", title: "Erro na Importação", description: "O arquivo de backup parece ser inválido ou está corrompido." });
      } finally {
        if (event.target) {
            event.target.value = '';
        }
      }
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao ler o arquivo." });
    };
    reader.readAsText(file);
  };

  const handleShare = () => {
    try {
      const shareId = Date.now().toString(36) + Math.random().toString(36).slice(2);
      const storedShares = localStorage.getItem(SHARED_LISTS_KEY);
      const shares = storedShares ? JSON.parse(storedShares) : {};
      shares[shareId] = properties;
      localStorage.setItem(SHARED_LISTS_KEY, JSON.stringify(shares));
      
      const url = `${window.location.origin}/share/${shareId}`;
      setGeneratedShareUrl(url);
      setShareDialogOpen(true);
    } catch (error) {
      console.error("Failed to create share link", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar o link de compartilhamento." });
    }
  };

  const allNeighborhoods = useMemo(() => [...new Set(properties.map(p => p.neighborhood).filter((n): n is string => !!n))].sort(), [properties]);
  const allCategories = useMemo(() => [...new Set(properties.flatMap(p => p.categories || []))].sort(), [properties]);
  const allPropertyTypes = useMemo(() => [...new Set(properties.map(p => p.propertyType))].sort(), [properties]);
  const allStatuses = useMemo(() => [...new Set(properties.map(p => p.status))].sort(), [properties]);
  const allAgencies = useMemo(() => [...new Set(properties.map(p => p.agencyName).filter((a): a is string => !!a))].sort(), [properties]);

  
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

  const FilterSection = ({ title, tags, displayMap, onToggle }: { title: string, tags: string[], displayMap?: Record<string, string>, onToggle: (tag: string) => void}) => {
    if (tags.length === 0) return null;
    return (
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant={activeTags.includes(tag) ? "default" : "secondary"}
              onClick={() => onToggle(tag)}
              className="cursor-pointer transition-all hover:shadow-md"
            >
              {displayMap ? displayMap[tag] : tag}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-body">
      <div className="flex flex-col gap-6">
        <PageHeader 
          user={user}
          onLogout={logout}
          onAdd={handleAddClick}
          onImportDoc={() => setImportDialogOpen(true)}
          onImportJson={handleImportJsonClick}
          onExportCsv={() => exportToCsv(properties)}
          onExportWord={() => exportToWord(properties)}
          onExportJson={handleExportJson}
          onClearAll={() => setClearConfirmOpen(true)}
          onShare={handleShare}
          hasProperties={properties.length > 0}
        />

        {properties.length > 0 && (
          <Card>
            <CardHeader className='pb-4'>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <FilterSection title="Status" tags={allStatuses} displayMap={STATUS_LABELS} onToggle={toggleTagFilter} />
                  <FilterSection title="Bairro" tags={allNeighborhoods} onToggle={toggleTagFilter} />
                  <FilterSection title="Imobiliária" tags={allAgencies} onToggle={toggleTagFilter} />
                  <FilterSection title="Tipo de Imóvel" tags={allPropertyTypes} displayMap={PROPERTY_TYPE_LABELS} onToggle={toggleTagFilter} />
                  <FilterSection title="Categorias" tags={allCategories} onToggle={toggleTagFilter} />
                </div>
                {activeTags.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTags([])}>
                      <X className="h-4 w-4 mr-1"/>
                      Limpar Filtros
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        <main>
          <PropertyTable 
            properties={sortedProperties}
            onEdit={handleEditClick}
            onDelete={deleteProperty}
            onViewDetails={handleViewDetailsClick}
            requestSort={requestSort}
            sortConfig={sortConfig}
          />
        </main>
      </div>
      
      <input
        type="file"
        ref={jsonImportRef}
        accept=".json"
        className="hidden"
        onChange={handleJsonFileChange}
      />

      <AlertDialog open={isClearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar toda a tabela?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita e irá remover todos os {properties.length} imóveis da lista. Recomendamos fazer um backup antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="outline" onClick={() => {
                handleExportJson();
                toast({ title: "Backup Criado", description: "Seu backup foi salvo. Você pode limpar a tabela agora." });
            }}>
              Fazer Backup (JSON)
            </Button>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                  setProperties([]);
                  toast({ title: "Tabela Limpa", description: "Todos os imóveis foram removidos." });
              }}
            >
              Sim, limpar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <ShareDialog 
        isOpen={isShareDialogOpen}
        onOpenChange={setShareDialogOpen}
        url={generatedShareUrl}
      />

      <PropertyDetailsDialog
        isOpen={!!viewingProperty}
        onOpenChange={(open) => {
          if (!open) setViewingProperty(null);
        }}
        property={viewingProperty}
      />
    </div>
  );
}
