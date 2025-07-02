import { Share2 } from 'lucide-react';

export default async function SharePage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <Share2 className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Funcionalidade Indisponível</h2>
        <p className="text-muted-foreground mt-2">O compartilhamento de links foi desativado.</p>
    </div>
  )
}
