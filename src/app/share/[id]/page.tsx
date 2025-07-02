import { db } from '@/lib/firebase';
import { type Property } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { SharePageClient } from '@/components/share-page-client';
import { AlertTriangle } from 'lucide-react';

export default async function SharePage({ params }: { params: { id: string } }) {
  if (!db) {
     return (
        <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Erro de Configuração</h2>
            <p className="text-muted-foreground mt-2">O serviço de banco de dados não está disponível.</p>
        </div>
    )
  }
  
  const docRef = doc(db, 'shared_lists', params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return (
        <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Lista Não Encontrada</h2>
            <p className="text-muted-foreground mt-2">O link de compartilhamento é inválido ou a lista foi removida.</p>
        </div>
    )
  }

  const data = docSnap.data();
  const properties = data.properties as Property[];
  const listName = data.name as string;

  return <SharePageClient initialProperties={properties} listName={listName} />;
}
