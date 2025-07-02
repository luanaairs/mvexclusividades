'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { type Property, type PropertyStatus, type PropertyType, type PropertyCategory, type PropertyTable } from '@/types';
import { getTablesForUser, createTable, savePropertiesToTable, renameTable, deleteTable, createShareLink } from '@/app/actions';
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
import { X, Loader2, FileText, Database } from 'lucide-react';
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
import { Input } from './ui/input';

type SortableKeys = 'price' | 'areaSize' | 'bedrooms' | 'bathrooms';
type DialogState = { type: 'create' | 'rename' | 'delete' | 'share'; table?: PropertyTable; } | null;

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
  
  const [tables, setTables] = useState<PropertyTable[]>([]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [dialogInputValue, setDialogInputValue] = useState('');
  
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');

  const jsonImportRef = useRef<HTMLInputElement>(null);
  
  const activeTable = useMemo(() => tables.find(t => t.id === activeTableId), [tables, activeTableId]);
  const properties = useMemo(() => activeTable?.properties || [], [activeTable]);


  const fetchTables = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const result = await getTablesForUser(user.username);
    if (result.success && result.tables) {
      setTables(result.tables);
      if (result.tables.length > 0) {
        if (!activeTableId || !result.tables.some(t => t.id === activeTableId)) {
          setActiveTableId(result.tables[0].id);
        }
      } else {
        setActiveTableId(null);
      }
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
    setIsLoading(false);
  }, [user, activeTableId, toast]);

  useEffect(() => {
    fetchTables();
  }, [user, fetchTables]);

  const saveProperties = useCallback(async (tableId: string, updatedProperties: Property[]) => {
    if (!user) return;
    setIsSaving(true);
    const result = await savePropertiesToTable({ tableId, properties: updatedProperties, username: user.username });
    if (!result.success) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: result.error });
    }
    setIsSaving(false);
  }, [user, toast]);
  
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

  const handlePropertyChange = (newProperties: Property[]) => {
    if (!activeTable) return;
    const updatedTable = { ...activeTable, properties: newProperties };
    setTables(tables.map(t => t.id === activeTableId ? updatedTable : t));
    saveProperties(activeTable.id, newProperties);
  }

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

  const handleDialogAction = async () => {
    if (!dialogState || !user) return;
    setIsActionPending(true);

    let result: { success: boolean, error?: string, table?: PropertyTable, shareId?: string };

    switch (dialogState.type) {
      case 'create':
        result = await createTable({ name: dialogInputValue, username: user.username });
        if(result.success && result.table) {
          toast({ title: "Sucesso!", description: `Tabela "${result.table.name}" criada.` });
          await fetchTables();
          setActiveTableId(result.table.id);
        }
        break;
      case 'rename':
        if(!dialogState.table) break;
        result = await renameTable({ tableId: dialogState.table.id, newName: dialogInputValue, username: user.username });
         if(result.success) {
            toast({ title: "Sucesso!", description: `Tabela renomeada para "${dialogInputValue}".` });
            await fetchTables();
         }
        break;
      case 'delete':
        if(!dialogState.table) break;
        result = await deleteTable({ tableId: dialogState.table.id, username: user.username });
        if(result.success) {
            toast({ title: "Sucesso!", description: `Tabela "${dialogState.table.name}" excluída.` });
            await fetchTables();
         }
        break;
      case 'share':
        result = await createShareLink(properties);
        if(result.success && result.shareId) {
            setGeneratedShareUrl(`${window.location.origin}/share/${result.shareId}`);
        } else {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar o link de compartilhamento." });
        }
        break;
    }

    if (result && !result.success && dialogState.type !== 'share') {
        toast({ variant: "destructive", title: "Erro na Operação", description: result.error });
    }

    setIsActionPending(false);
    setDialogState(null);
    setDialogInputValue('');
  };
  
  const handleExportJson = () => {
    if (!activeTable) return;
    exportToJson(activeTable.properties, activeTable.name);
    toast({ title: "Sucesso!", description: "Backup JSON exportado." });
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeTable) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read.");
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
            handlePropertyChange(data);
            toast({ title: "Sucesso!", description: `${data.length} imóvel${data.length > 1 ? 's' : ''} importado${data.length > 1 ? 's' : ''} para a tabela "${activeTable.name}".` });
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
  
  if (isLoading) {
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
            onExportCsv={() => exportToCsv(properties, activeTable?.name)}
            onExportWord={() => exportToWord(properties, activeTable?.name)}
            onExportJson={handleExportJson}
            onShare={() => setDialogState({ type: 'share' })}
            hasProperties={properties.length > 0}
            tables={tables}
            activeTable={activeTable}
            isSaving={isSaving}
            onTableSelect={setActiveTableId}
            onNewTable={() => setDialogState({ type: 'create'})}
            onRenameTable={() => {
                if (!activeTable) return;
                setDialogInputValue(activeTable.name);
                setDialogState({ type: 'rename', table: activeTable });
            }}
            onDeleteTable={() => {
                if (!activeTable) return;
                setDialogState({ type: 'delete', table: activeTable });
            }}
        />
        {activeTable && properties.length > 0 && (
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
        {activeTable ? (
          <PropertyTable 
            properties={sortedProperties}
            onEdit={(property) => { setEditingProperty(property); setAddEditDialogOpen(true); }}
            onDelete={deleteProperty}
            onViewDetails={setViewingProperty}
            requestSort={requestSort}
            sortConfig={sortConfig}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Database className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">Nenhuma tabela encontrada</h2>
            <p className="mt-2 text-muted-foreground">Crie sua primeira tabela para começar a adicionar imóveis.</p>
            <Button className="mt-6" onClick={() => setDialogState({ type: 'create'})}>Criar Nova Tabela</Button>
          </div>
        )}
      </main>
      
      <input type="file" ref={jsonImportRef} accept=".json" className="hidden" onChange={handleJsonFileChange} />

      <AlertDialog open={!!dialogState} onOpenChange={(open) => !open && setDialogState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogState?.type === 'create' && 'Criar Nova Tabela'}
              {dialogState?.type === 'rename' && 'Renomear Tabela'}
              {dialogState?.type === 'delete' && 'Excluir Tabela'}
              {dialogState?.type === 'share' && 'Link de Compartilhamento Gerado'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState?.type === 'create' && 'Digite o nome para sua nova tabela de imóveis.'}
              {dialogState?.type === 'rename' && `Digite o novo nome para a tabela "${dialogState.table?.name}".`}
              {dialogState?.type === 'delete' && `Tem certeza que deseja excluir a tabela "${dialogState.table?.name}"? Esta ação não pode ser desfeita.`}
              {dialogState?.type === 'share' && 'Copie e envie este link para seus clientes. Ele dá acesso de somente leitura à lista atual.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {(dialogState?.type === 'create' || dialogState?.type === 'rename') && (
            <Input 
              autoFocus
              value={dialogInputValue}
              onChange={(e) => setDialogInputValue(e.target.value)}
              placeholder="Ex: Exclusividades Maio 2024"
              onKeyDown={(e) => e.key === 'Enter' && handleDialogAction()}
            />
          )}

          {dialogState?.type === 'share' && (
             <div className="flex items-center space-x-2 mt-4">
                <Input id="share-link" value={generatedShareUrl} readOnly />
             </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogInputValue('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDialogAction}
              disabled={isActionPending || ((dialogState?.type === 'create' || dialogState?.type === 'rename') && !dialogInputValue)}
              className={dialogState?.type === 'delete' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isActionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogState?.type === 'create' && 'Criar'}
              {dialogState?.type === 'rename' && 'Renomear'}
              {dialogState?.type === 'delete' && 'Excluir'}
              {dialogState?.type === 'share' && 'Fechar'}
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
        isOpen={generatedShareUrl !== '' && dialogState?.type !== 'share'}
        onOpenChange={(open) => !open && setGeneratedShareUrl('')}
        url={generatedShareUrl}
      />

      <PropertyDetailsDialog
        isOpen={!!viewingProperty}
        onOpenChange={(open) => !open && setViewingProperty(null)}
        property={viewingProperty}
      />
    </div>
  );
}