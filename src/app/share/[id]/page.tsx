import { SharePageClient } from '@/components/share-page-client';

export default function SharePage({ params }: { params: { id: string } }) {
  return <SharePageClient shareId={params.id} />;
}
