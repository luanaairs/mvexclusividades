'use client';

import { useState, useEffect, useMemo } from 'react';
import { type Property, type PropertyStatus, type PropertyType } from '@/types';
import { PropertyTable } from './property-table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Share2 } from 'lucide-react';
import Image from "next/image";
import { PropertyDetailsDialog } from './property-details-dialog';
import { ThemeToggle } from './theme-toggle';

const SHARED_LISTS_KEY = 'shared-property-lists';
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

interface SharePageClientProps {
  shareId: string;
}

export function SharePageClient({ shareId }: SharePageClientProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedShares = localStorage.getItem(SHARED_LISTS_KEY);
      if (storedShares) {
        const shares = JSON.parse(storedShares);
        const sharedProperties = shares[shareId];
        if (sharedProperties) {
          setProperties(sharedProperties);
        } else {
          // Handle case where shareId is not found
          console.error("Share ID not found");
        }
      }
    } catch (error) {
      console.error("Failed to load shared properties from local storage", error);
    }
  }, [shareId]);


  const handleViewDetailsClick = (property: Property) => {
    setViewingProperty(property);
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

  if (!isClient) {
    return (
        <div className="flex justify-center items-center h-screen">
             <Share2 className="h-16 w-16 animate-pulse text-primary" />
        </div>
    );
  }

  if (properties.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <Share2 className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Link de Compartilhamento Inválido</h2>
            <p className="text-muted-foreground mt-2">O link que você acessou não foi encontrado ou expirou.</p>
        </div>
      )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-body">
      <div className="flex flex-col gap-6">
        <header className="bg-card shadow-sm rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-2xl font-bold text-primary">
              <Image src="/logo.svg" alt="MV Broker Logo" width={48} height={48} />
              <h1 className="font-headline">Exclusividades</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

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

        <main>
          <PropertyTable 
            properties={sortedProperties}
            onViewDetails={handleViewDetailsClick}
            requestSort={requestSort}
            sortConfig={sortConfig}
            showActions={false}
            onEdit={() => {}} // dummy functions
            onDelete={() => {}} // dummy functions
          />
        </main>
      </div>

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
