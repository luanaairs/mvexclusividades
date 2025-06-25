'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, PlusCircle, FileUp, Download } from "lucide-react";

interface PageHeaderProps {
  onAdd: () => void;
  onImport: () => void;
  onExportCsv: () => void;
  onExportWord: () => void;
  hasProperties: boolean;
}

export function PageHeader({ onAdd, onImport, onExportCsv, onExportWord, hasProperties }: PageHeaderProps) {
  return (
    <header className="bg-card shadow-sm rounded-lg p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-2xl font-bold text-primary">
          <Home className="h-8 w-8" />
          <h1 className="font-headline">Gestor de Exclusividades</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onAdd} variant="outline">
            <PlusCircle />
            Adicionar Imóvel
          </Button>
          <Button onClick={onImport}>
            <FileUp />
            Importar Documento
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" disabled={!hasProperties}>
                <Download />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportCsv}>Exportar para Excel (CSV)</DropdownMenuItem>
              <DropdownMenuItem onClick={onExportWord}>Exportar para Word</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
