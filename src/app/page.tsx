import { PageClient } from '@/components/page-client';
import { WithAuth } from '@/components/with-auth';

export default function Home() {
  return (
    <WithAuth>
      <PageClient />
    </WithAuth>
  );
}
