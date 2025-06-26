'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, FileUp, Download } from "lucide-react";
import Image from "next/image";

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
          <Image src="/logo.png" alt="MV Broker Logo" width={48} height={48} className="rounded-lg" />
          <h1 className="font-headline">Exclusividades</h1>
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
