'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { PlusCircle, FileUp, Download, Trash2, FileJson, Share2, User, LogOut } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { type UserCredentials } from "@/types";

interface PageHeaderProps {
  user: UserCredentials | null;
  onLogout: () => void;
  onAdd: () => void;
  onImportDoc: () => void;
  onImportJson: () => void;
  onExportCsv: () => void;
  onExportWord: () => void;
  onExportJson: () => void;
  onClearAll: () => void;
  onShare: () => void;
  hasProperties: boolean;
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
  onClearAll,
  onShare,
  hasProperties 
}: PageHeaderProps) {
  return (
    <header className="bg-card shadow-sm rounded-lg p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-2xl font-bold text-primary">
          <Image src="/logo.svg" alt="MV Broker Logo" width={48} height={48} />
          <h1 className="font-headline">Exclusividades</h1>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <Button onClick={onAdd} variant="outline">
            <PlusCircle />
            Adicionar Imóvel
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <FileUp />
                Importar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onImportDoc}>
                <FileUp className="mr-2" /> De Documento (OCR)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImportJson}>
                <FileJson className="mr-2" /> De Arquivo JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" disabled={!hasProperties}>
                <Download />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportCsv}>Para Excel (CSV)</DropdownMenuItem>
              <DropdownMenuItem onClick={onExportWord}>Para Word</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportJson}>Para Backup (JSON)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="secondary" onClick={onShare} disabled={!hasProperties}>
            <Share2 />
            Compartilhar
          </Button>
          
          <Button variant="destructive" onClick={onClearAll} disabled={!hasProperties}>
            <Trash2 />
            Limpar Tudo
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
                <DropdownMenuLabel>
                  Logado como <span className="font-bold">{user.username}</span>
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
