'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This component redirects the user from /library to /library/services
export default function LibraryRoot() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/library/services');
  }, [router]);

  return null;
}
