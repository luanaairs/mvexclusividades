
'use client';

import { useState, useEffect, useMemo, useRef, useTransition } from 'react';
import { type Property, type PropertyStatus, type PropertyType, type PropertyCategory } from '@/types';
import { PageHeader } from './page-header';
import { PropertyTable } from './property-table';
import { PropertyFormDialog } from './property-form-dialog';
import { ImportDialog } from './import-dialog';
import { useToast } from '@/hooks/use-toast';
import { exportToJson } from '@/lib/export';
import { Badge } from './ui/badge';
import { Button, buttonVariants } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Loader2 } from 'lucide-react';
import { PropertyDetailsDialog } from './property-details-dialog';
import { ShareDialog } from './share-dialog';
import { useAuth } from '@/context/auth-context';
import { createShareLink } from '@/app/actions';
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

type SortableKeys = 'price' | 'areaSize' | 'bedrooms' | 'bathrooms';

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

const CATEGORY_LABELS: Record<PropertyCategory, string> = {
    FR: 'FR',
    L: 'L',
    FU: 'FU',
    M: 'M',
    MD: 'MD',
    VM: 'VM'
};


export function PageClient() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isSharing, startSharingTransition] = useTransition();

  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);
  
  const jsonImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load properties from localStorage on mount
  useEffect(() => {
    if (!user || !isClient) return;

    const key = `mvbroker_properties_${user.uid}`;
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedProperties = JSON.parse(savedData);
        if(Array.isArray(parsedProperties)) {
            setProperties(parsedProperties);
        } else {
            throw new Error("Invalid data structure in localStorage");
        }
      }
    } catch (error) {
      console.error("Failed to load or parse localStorage data:", error);
      setProperties([]);
      toast({ variant: 'destructive', title: "Erro nos Dados Locais", description: "Os dados salvos localmente foram redefinidos por estarem corrompidos."});
    }
  }, [user, isClient, toast]);

  // Save properties to localStorage whenever they change
  useEffect(() => {
    if (user && isClient) {
      const key = `mvbroker_properties_${user.uid}`;
      localStorage.setItem(key, JSON.stringify(properties));
    }
  }, [properties, user, isClient]);

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
    return [...new Set(baseTags)];
  };

  const addProperty = (data: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      id: new Date().toISOString(),
      ...data,
      tags: addOrUpdateTags(data),
    };
    setProperties(currentProperties => [newProperty, ...currentProperties]);
    toast({ title: "Sucesso!", description: `Imóvel "${data.propertyName}" adicionado.` });
  };
  
  const addMultipleProperties = (newPropertiesData: Omit<Property, 'id'>[]) => {
    const newProperties: Property[] = newPropertiesData.map((data, index) => ({
      id: `${new Date().toISOString()}-${index}`,
      ...data,
      tags: addOrUpdateTags(data),
    }));
    setProperties(currentProperties => [...newProperties, ...currentProperties]);
    toast({ title: "Sucesso!", description: `${newProperties.length} imóvel${newProperties.length > 1 ? 'is' : ''} importado${newProperties.length > 1 ? 's' : ''}.` });
  };

  const updateProperty = (data: Omit<Property, 'id'>, id: string) => {
    const updatedProperty = { ...data, id, tags: addOrUpdateTags(data) };
    setProperties(currentProperties => currentProperties.map(p => p.id === id ? updatedProperty : p));
    toast({ title: "Sucesso!", description: `Imóvel "${data.propertyName}" atualizado.` });
    setEditingProperty(null);
  };
  
  const deleteProperty = (id: string) => {
    const propertyName = properties.find(p => p.id === id)?.propertyName;
    setProperties(currentProperties => currentProperties.filter(p => p.id !== id));
    toast({ title: "Sucesso!", description: `Imóvel "${propertyName}" excluído.` });
  };
  
  const handleExportJson = () => {
    exportToJson(properties, 'meus_imoveis');
    toast({ title: "Sucesso!", description: "Backup JSON exportado." });
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read.");
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
            const combinedProperties = [...data, ...properties];
            const uniqueProperties = Array.from(new Map(combinedProperties.map(p => [p.id, p])).values());
            setProperties(uniqueProperties);
            toast({ title: "Sucesso!", description: `Imóveis importados do backup para a tabela atual.` });
        } else {
            throw new Error("Invalid JSON format for properties.");
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Erro na Importação", description: "O arquivo de backup parece ser inválido ou está corrompido." });
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };
  
  const handleShare = () => {
    const listName = window.prompt("Digite um nome para a lista compartilhada:", "Minha Lista de Imóveis");
    if (!listName || !listName.trim()) {
        toast({ variant: 'destructive', title: 'Ação cancelada', description: 'O nome da lista é obrigatório para compartilhar.' });
        return;
    }
    
    if (!user || !user.uid) {
        toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Você precisa estar logado para compartilhar. Por favor, faça o login novamente.' });
        return;
    }

    startSharingTransition(async () => {
        const result = await createShareLink(user.uid, properties, listName);
        if (result.success && result.url) {
            setShareUrl(result.url);
            setIsShareDialogOpen(true);
        } else {
            toast({ variant: 'destructive', title: 'Erro ao compartilhar', description: result.error });
        }
    });
  };

  const handleClearList = () => {
    setProperties([]);
    setIsClearConfirmOpen(false);
    toast({ title: "Lista Limpa!", description: "Todos os imóveis foram removidos da sua visualização local." });
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
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProperties, sortConfig]);

  const allNeighborhoods = useMemo(() => [...new Set(properties.map(p => p.neighborhood).filter((n): n is string => !!n))].sort(), [properties]);
  const allCategories = useMemo(() => [...new Set(properties.flatMap(p => p.categories || []))].sort() as PropertyCategory[], [properties]);
  const allPropertyTypes = useMemo(() => [...new Set(properties.map(p => p.propertyType))].sort(), [properties]);
  const allStatuses = useMemo(() => [...new Set(properties.map(p => p.status))].sort(), [properties]);
  const allAgencies = useMemo(() => [...new Set(properties.map(p => p.agencyName).filter((a): a is string => !!a))].sort(), [properties]);

  const FilterSection = ({ title, tags, displayMap, onToggle }: { title: string, tags: string[], displayMap?: Record<string, string>, onToggle: (tag: string) => void}) => {
    if (tags.length === 0) return null;
    return (
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(tag => (
            <Badge key={tag} variant={activeTags.includes(tag) ? "default" : "secondary"} onClick={() => onToggle(tag)} className="cursor-pointer">
              {displayMap ? displayMap[tag] : tag}
            </Badge>
          ))}
        </div>
      </div>
    );
  }
  
  if (!isClient || !user) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-body flex flex-col h-screen">
      <div className="flex-shrink-0">
        <PageHeader 
            user={user}
            onLogout={logout}
            onAdd={() => setAddEditDialogOpen(true)}
            onImportDoc={() => setImportDialogOpen(true)}
            onImportJson={() => jsonImportRef.current?.click()}
            onExportCsv={() => {}}
            onExportWord={() => {}}
            onExportJson={handleExportJson}
            onShare={handleShare}
            onClearList={() => setIsClearConfirmOpen(true)}
            hasProperties={properties.length > 0}
        />
        {properties.length > 0 && (
          <Card className="mt-6">
              <CardHeader className='pb-4'><CardTitle>Filtros</CardTitle></CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <FilterSection title="Status" tags={allStatuses} displayMap={STATUS_LABELS} onToggle={tag => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} />
                  <FilterSection title="Bairro" tags={allNeighborhoods} onToggle={tag => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} />
                  <FilterSection title="Imobiliária" tags={allAgencies} onToggle={tag => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} />
                  <FilterSection title="Tipo de Imóvel" tags={allPropertyTypes} displayMap={PROPERTY_TYPE_LABELS} onToggle={tag => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} />
                  <FilterSection title="Categorias" tags={allCategories} displayMap={CATEGORY_LABELS} onToggle={tag => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} />
                  </div>
                  {activeTags.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                      <Button variant="ghost" size="sm" onClick={() => setActiveTags([])}><X className="h-4 w-4 mr-1"/>Limpar Filtros</Button>
                  </div>
                  )}
              </CardContent>
          </Card>
        )}
      </div>

      <main className="flex-grow overflow-y-auto pt-6">
        {isSharing ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Criando link de compartilhamento...</p>
            </div>
        ) : (
            <PropertyTable 
            properties={sortedProperties}
            onEdit={(property) => { setEditingProperty(property); setAddEditDialogOpen(true); }}
            onDelete={deleteProperty}
            onViewDetails={setViewingProperty}
            requestSort={requestSort}
            sortConfig={sortConfig}
            />
        )}
      </main>
      
      <input type="file" ref={jsonImportRef} accept=".json" className="hidden" onChange={handleJsonFileChange} />

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

      <PropertyDetailsDialog
        isOpen={!!viewingProperty}
        onOpenChange={(open) => !open && setViewingProperty(null)}
        property={viewingProperty}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        url={shareUrl}
      />

      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza que deseja limpar a lista?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação é irreversível e removerá todos os imóveis da sua visualização local.
                <br/><br/>
                <strong className="font-semibold">Isso não afetará nenhum link de compartilhamento que você já criou.</strong>
                <br/><br/>
                É altamente recomendável que você exporte um backup JSON antes de continuar.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleClearList}
            >
                Sim, Limpar Lista
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
