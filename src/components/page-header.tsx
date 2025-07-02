'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { PlusCircle, FileUp, Download, FileJson, Share2, User, LogOut, Loader2, Database, ChevronsUpDown, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { type PropertyTable } from "@/types";
import type { User as FirebaseUser } from 'firebase/auth';

interface PageHeaderProps {
  user: FirebaseUser | null;
  onLogout: () => void;
  onAdd: () => void;
  onImportDoc: () => void;
  onImportJson: () => void;
  onExportCsv: () => void;
  onExportWord: () => void;
  onExportJson: () => void;
  onShare: () => void;
  hasProperties: boolean;
  tables: PropertyTable[];
  activeTable: PropertyTable | null;
  isSaving: boolean;
  onTableSelect: (tableId: string) => void;
  onNewTable: () => void;
  onRenameTable: () => void;
  onDeleteTable: () => void;
}

export function PageHeader({ 
  user,
  onLogout,
  onAdd, 
  onImportDoc, 
  onImportJson,
  onExportCsv, 
  onExportWord,
  onExportJson,
  onShare,
  hasProperties,
  tables,
  activeTable,
  isSaving,
  onTableSelect,
  onNewTable,
  onRenameTable,
  onDeleteTable
}: PageHeaderProps) {
  return (
    <header className="bg-card shadow-sm rounded-lg p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-2xl font-bold text-primary">
          <Image src="/logo.svg" alt="MV Broker Logo" width={48} height={48} />
          <h1 className="font-headline">Exclusividades</h1>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-between">
                <div className="flex items-center gap-2">
                  <Database />
                  <span className="truncate max-w-[150px]">{activeTable ? activeTable.name : "Nenhuma Tabela"}</span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
              <DropdownMenuLabel>Minhas Tabelas</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={activeTable?.id} onValueChange={onTableSelect}>
                {tables.map((table) => (
                  <DropdownMenuRadioItem key={table.id} value={table.id}>
                    {table.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onNewTable}><PlusCircle className="mr-2"/> Criar Nova Tabela</DropdownMenuItem>
              {activeTable && (
                <>
                  <DropdownMenuItem onSelect={onRenameTable}><Edit className="mr-2"/> Renomear Tabela</DropdownMenuItem>
                  <DropdownMenuItem onSelect={onDeleteTable} className="text-destructive focus:text-destructive"><Trash2 className="mr-2"/> Excluir Tabela</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onAdd} disabled={!activeTable}>
            <PlusCircle />
            Adicionar Imóvel
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" disabled={!activeTable}>
                <FileUp />
                Importar/Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Importar</DropdownMenuLabel>
              <DropdownMenuItem onClick={onImportDoc}>De Documento (OCR)</DropdownMenuItem>
              <DropdownMenuItem onClick={onImportJson}>De Arquivo JSON</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Exportar</DropdownMenuLabel>
              <DropdownMenuItem onClick={onExportCsv} disabled={!hasProperties}>Para Excel (CSV)</DropdownMenuItem>
              <DropdownMenuItem onClick={onExportWord} disabled={!hasProperties}>Para Word</DropdownMenuItem>
              <DropdownMenuItem onClick={onExportJson} disabled={!hasProperties}>Para Backup (JSON)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="secondary" onClick={onShare} disabled={!hasProperties}>
            <Share2 />
            Compartilhar
          </Button>
          
          <ThemeToggle />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuLabel className="flex items-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" /> : <div className="h-4 w-4"/>}
                   <span>{isSaving ? "Salvando..." : "Salvo"}</span>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  Logado como <span className="font-bold">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
