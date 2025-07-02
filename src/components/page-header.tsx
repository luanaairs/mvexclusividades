
'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { PlusCircle, FileUp, Download, FileJson, User, LogOut, Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
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
  hasProperties: boolean;

  tables: { id: string; name: string }[];
  activeTableId: string | null;
  onTableChange: (tableId: string) => void;
  onTableCreate: () => void;
  onTableRename: () => void;
  onTableDelete: () => void;
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
  hasProperties,
  tables,
  activeTableId,
  onTableChange,
  onTableCreate,
  onTableRename,
  onTableDelete
}: PageHeaderProps) {

  const activeTableName = tables.find(t => t.id === activeTableId)?.name || 'Nenhuma tabela';

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
              <Button variant="outline" className="min-w-[180px] justify-between">
                <span className="truncate pr-2">{activeTableName}</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Alternar Tabela</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tables.map((table) => (
                <DropdownMenuItem key={table.id} onClick={() => onTableChange(table.id)}>
                  <span className="truncate flex-1">{table.name}</span>
                  {table.id === activeTableId && <Check className="ml-2 h-4 w-4" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Gerenciar</DropdownMenuLabel>
              <DropdownMenuItem onClick={onTableCreate}>
                Criar Nova Tabela...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTableRename} disabled={tables.length === 0}>
                Renomear Tabela Atual...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTableDelete} disabled={tables.length <= 1} className="text-destructive focus:text-destructive">
                Excluir Tabela Atual
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={onAdd}>
            <PlusCircle />
            Adicionar Imóvel
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
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
