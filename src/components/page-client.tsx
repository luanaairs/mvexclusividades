
'use client';

import { useState, useEffect, useMemo, useRef, useCallback, useTransition } from 'react';
import { type Property, type PropertyStatus, type PropertyType, type PropertyCategory } from '@/types';
import { PageHeader } from './page-header';
import { PropertyTable } from './property-table';
import { PropertyFormDialog } from './property-form-dialog';
import { ImportDialog } from './import-dialog';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv, exportToWord, exportToJson } from '@/lib/export';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Loader2, Home } from 'lucide-react';
import { PropertyDetailsDialog } from './property-details-dialog';
import { ShareDialog } from './share-dialog';
import { useAuth } from '@/context/auth-context';
import { createShareLink, getBaseUrl } from '@/app/actions';

type SortableKeys = 'price' | 'areaSize' | 'bedrooms' | 'bathrooms';
type Tables = Record<string, { id: string; name: string; properties: Property[] }>;

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
  
  const [tables, setTables] = useState<Tables>({});
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isSharing, startSharingTransition] = useTransition();

  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);
  
  const jsonImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!user || !isClient) return;

    const key = `mvbroker_tables_${user.uid}`;
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.tables && data.activeTableId && Object.keys(data.tables).length > 0) {
            setTables(data.tables);
            setActiveTableId(data.activeTableId);
        } else {
            throw new Error("Invalid data structure");
        }
      } else {
        // Create a default table for new users or if no data exists
        const newTableId = `table-${Date.now()}`;
        const newTable = { id: newTableId, name: 'Minha Lista de Imóveis', properties: [] };
        setTables({ [newTableId]: newTable });
        setActiveTableId(newTableId);
      }
    } catch (error) {
      console.error("Failed to load or parse localStorage data:", error);
      // Handle corrupted data by resetting
      const newTableId = `table-${Date.now()}`;
      const newTable = { id: newTableId, name: 'Minha Lista de Imóveis', properties: [] };
      setTables({ [newTableId]: newTable });
      setActiveTableId(newTableId);
      toast({ variant: 'destructive', title: "Erro nos Dados Locais", description: "Os dados salvos localmente foram redefinidos por estarem corrompidos."});
    }
  }, [user, isClient, toast]);

  useEffect(() => {
    if (user && isClient && Object.keys(tables).length > 0 && activeTableId) {
      const key = `mvbroker_tables_${user.uid}`;
      const dataToSave = { tables, activeTableId };
      localStorage.setItem(key, JSON.stringify(dataToSave));
    }
  }, [tables, activeTableId, user, isClient]);

  const properties = useMemo(() => {
    if (!activeTableId || !tables[activeTableId]) return [];
    return tables[activeTableId].properties;
  }, [activeTableId, tables]);

  const handlePropertyChange = useCallback((updatedProperties: Property[]) => {
      if (!activeTableId) return;
      setTables(currentTables => ({
        ...currentTables,
        [activeTableId]: {
          ...currentTables[activeTableId],
          properties: updatedProperties
        }
      }));
  }, [activeTableId]);
  
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
    handlePropertyChange([newProperty, ...properties]);
    toast({ title: "Sucesso!", description: `Imóvel "${data.propertyName}" adicionado.` });
  };
  
  const addMultipleProperties = (newPropertiesData: Omit<Property, 'id'>[]) => {
    const newProperties: Property[] = newPropertiesData.map((data, index) => ({
      id: `${new Date().toISOString()}-${index}`,
      ...data,
      tags: addOrUpdateTags(data),
    }));
    handlePropertyChange([...newProperties, ...properties]);
    toast({ title: "Sucesso!", description: `${newProperties.length} imóvel${newProperties.length > 1 ? 'is' : ''} importado${newProperties.length > 1 ? 's' : ''}.` });
  };

  const updateProperty = (data: Omit<Property, 'id'>, id: string) => {
    const updatedProperty = { ...data, id, tags: addOrUpdateTags(data) };
    handlePropertyChange(properties.map(p => p.id === id ? updatedProperty : p));
    toast({ title: "Sucesso!", description: `Imóvel "${data.propertyName}" atualizado.` });
    setEditingProperty(null);
  };
  
  const deleteProperty = (id: string) => {
    const propertyName = properties.find(p => p.id === id)?.propertyName;
    handlePropertyChange(properties.filter(p => p.id !== id));
    toast({ title: "Sucesso!", description: `Imóvel "${propertyName}" excluído.` });
  };
  
  const handleExportJson = () => {
    exportToJson(properties, tables[activeTableId!]?.name || 'meus_imoveis');
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
            handlePropertyChange(uniqueProperties);
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

  const handleTableCreate = useCallback(() => {
    const name = window.prompt("Digite o nome da nova tabela:");
    if (name && name.trim()) {
      const newTableId = `table-${Date.now()}`;
      const newTable = { id: newTableId, name: name.trim(), properties: [] };
      setTables(prev => ({ ...prev, [newTableId]: newTable }));
      setActiveTableId(newTableId);
      toast({ title: `Tabela "${name.trim()}" criada!` });
    }
  }, []);

  const handleTableRename = useCallback(() => {
    if (!activeTableId) return;
    const currentName = tables[activeTableId].name;
    const newName = window.prompt("Digite o novo nome para a tabela:", currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      setTables(prev => {
        const newTables = { ...prev };
        newTables[activeTableId].name = newName.trim();
        return newTables;
      });
      toast({ title: `Tabela renomeada para "${newName.trim()}"` });
    }
  }, [activeTableId, tables]);

  const handleTableDelete = useCallback(() => {
    if (!activeTableId || Object.keys(tables).length <= 1) {
      toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Você não pode excluir a única tabela existente.' });
      return;
    }
    const tableName = tables[activeTableId].name;
    if (window.confirm(`Tem certeza que deseja excluir a tabela "${tableName}"? Esta ação não pode ser desfeita.`)) {
      const newTables = { ...tables };
      delete newTables[activeTableId];
      
      const newActiveTableId = Object.keys(newTables)[0];
      
      setTables(newTables);
      setActiveTableId(newActiveTableId);
      toast({ title: `Tabela "${tableName}" excluída.` });
    }
  }, [activeTableId, tables, toast]);
  
  const handleShare = () => {
    startSharingTransition(async () => {
        const currentProperties = tables[activeTableId!]?.properties || [];
        const currentName = tables[activeTableId!]?.name || 'Lista de Imóveis';
        
        const result = await createShareLink(currentProperties, currentName);
        if (result.success && result.id) {
            const baseUrl = await getBaseUrl();
            setShareUrl(`${baseUrl}/share/${result.id}`);
            setIsShareDialogOpen(true);
        } else {
            toast({ variant: 'destructive', title: 'Erro ao compartilhar', description: result.error || 'Não foi possível criar o link de compartilhamento.' });
        }
    });
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
            onExportCsv={() => exportToCsv(properties, tables[activeTableId!]?.name || 'meus_imoveis')}
            onExportWord={() => exportToWord(properties, tables[activeTableId!]?.name || 'meus_imoveis')}
            onExportJson={handleExportJson}
            onShare={handleShare}
            hasProperties={properties.length > 0}
            tables={Object.values(tables)}
            activeTableId={activeTableId}
            onTableChange={setActiveTableId}
            onTableCreate={handleTableCreate}
            onTableRename={handleTableRename}
            onTableDelete={handleTableDelete}
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
        ) : Object.keys(tables).length > 0 && activeTableId ? (
            <PropertyTable 
            properties={sortedProperties}
            onEdit={(property) => { setEditingProperty(property); setAddEditDialogOpen(true); }}
            onDelete={deleteProperty}
            onViewDetails={setViewingProperty}
            requestSort={requestSort}
            sortConfig={sortConfig}
            />
        ) : (
             <Card className="mt-4">
                <CardContent className="flex flex-col items-center justify-center gap-4 text-center p-16">
                    <Home className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-2xl font-semibold font-headline">Nenhuma tabela selecionada</h3>
                    <p className="text-muted-foreground">Crie uma nova tabela ou selecione uma existente para começar.</p>
                </CardContent>
            </Card>
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
    </div>
  );
}
