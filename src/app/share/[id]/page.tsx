import { getSharedList } from '@/app/actions';
import { SharePageClient } from '@/components/share-page-client';
import { Share2 } from 'lucide-react';

export default async function SharePage({ params }: { params: { id: string } }) {
  const result = await getSharedList(params.id);

  if (!result.success || !result.properties) {
      return (
        <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <Share2 className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Link de Compartilhamento Inválido</h2>
            <p className="text-muted-foreground mt-2">{result.error || "O link que você acessou não foi encontrado ou expirou."}</p>
        </div>
      )
  }

  return <SharePageClient initialProperties={result.properties} />;
}