'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  url: string;
}

export function ShareDialog({ isOpen, onOpenChange, url }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast({ title: "Sucesso!", description: "URL copiada para a área de transferência." });
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }, () => {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível copiar a URL." });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar Lista de Imóveis</DialogTitle>
          <DialogDescription>
            Copie e envie este link para seus clientes. Ele dá acesso de somente leitura à lista atual.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
            <Input id="share-link" value={url} readOnly />
            <Button type="button" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copiar URL</span>
            </Button>
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
