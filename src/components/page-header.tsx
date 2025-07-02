
'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { PlusCircle, FileUp, Download, FileJson, Share2, User, LogOut, Loader2 } from "lucide-react";
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
  onShare: () => void;
  hasProperties: boolean;
  isSaving: boolean;
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
  isSaving,
}: PageHeaderProps) {
  return (
    <header className="bg-card shadow-sm rounded-lg p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-2xl font-bold text-primary">
          <Image src="/logo.svg" alt="MV Broker Logo" width={48} height={48} />
          <h1 className="font-headline">Exclusividades</h1>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            
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
                  {isSaving ? <Loader2 className="animate-spin" /> : <div className="h-4 w-4 rounded-full bg-green-500"/>}
                   <span>{isSaving ? "Salvando..." : "Salvo na Nuvem"}</span>
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
