'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { useFirebase, initiateAnonymousSignIn } from '@/firebase';
import { appConfig } from '@/lib/config';

const STORAGE_KEY = 'webe-estimator-session';

export type EstimatorSessionStatus =
  | 'idle'
  | 'waiting'
  | 'authenticating'
  | 'authenticated'
  | 'standalone'
  | 'error';

export interface EstimatorSessionPayload {
  sessionId: string;
  pageId?: string;
  userId: string;
  expiresAt: string;
  issuedAt: string;
  page?: unknown;
  user?: unknown;
}

interface EstimatorSessionContextValue {
  status: EstimatorSessionStatus;
  error?: string;
  session?: EstimatorSessionPayload;
  resetSession: () => void;
  mainAppOrigin: string;
}

const EstimatorSessionContext = createContext<EstimatorSessionContextValue | undefined>(undefined);

type AuthMessagePayload = {
  type: 'webe-estimator-auth';
  customToken: string;
  sessionId: string;
  pageId?: string;
  userId: string;
  expiresAt: string;
  issuedAt: string;
  page?: unknown;
  user?: unknown;
};

const loadStoredSession = (): EstimatorSessionPayload | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as EstimatorSessionPayload;
    if (!parsed.sessionId) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
};

export function EstimatorSessionProvider({ children }: { children: React.ReactNode }) {
  const { auth, isUserLoading } = useFirebase();
  const [status, setStatus] = useState<EstimatorSessionStatus>('idle');
  const [session, setSession] = useState<EstimatorSessionPayload | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const hasSentReadyMessage = useRef(false);
  const hasAttemptedAnonSignIn = useRef(false);
  const mainAppOrigin = useMemo(() => appConfig.mainAppOrigin, []);

  // Seed from sessionStorage if available (useful on refresh while opener still exists).
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = loadStoredSession();
    if (stored) {
      setSession(stored);
      setStatus('authenticated');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.opener) {
      setStatus('standalone');
      if (appConfig.allowAnonymousFallback && !isUserLoading && !hasAttemptedAnonSignIn.current) {
        hasAttemptedAnonSignIn.current = true;
        initiateAnonymousSignIn(auth);
      }
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== mainAppOrigin) {
        return;
      }

      const data = event.data as AuthMessagePayload | undefined;
      if (!data || data.type !== 'webe-estimator-auth') {
        return;
      }

      setStatus('authenticating');
      setError(undefined);

      try {
        await signInWithCustomToken(auth, data.customToken);

        const payload: EstimatorSessionPayload = {
          sessionId: data.sessionId,
          pageId: data.pageId,
          userId: data.userId,
          expiresAt: data.expiresAt,
          issuedAt: data.issuedAt,
          page: data.page,
          user: data.user,
        };

        setSession(payload);
        setStatus('authenticated');
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }
      } catch (err) {
        console.error('Failed to authenticate with custom token', err);
        setError('Unable to authenticate with the WeBe session.');
        setStatus('error');
      }
    };

    const sendReady = () => {
      if (hasSentReadyMessage.current || typeof window === 'undefined') {
        return;
      }
      hasSentReadyMessage.current = true;
      window.opener?.postMessage({ type: 'webe-estimator-ready' }, mainAppOrigin);
    };

    setStatus('waiting');
    sendReady();
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [auth, isUserLoading, mainAppOrigin]);

  const resetSession = () => {
    setSession(undefined);
    setStatus(appConfig.allowAnonymousFallback ? 'standalone' : 'idle');
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo<EstimatorSessionContextValue>(() => ({
    status,
    error,
    session,
    resetSession,
    mainAppOrigin,
  }), [status, error, session, mainAppOrigin]);

  return (
    <EstimatorSessionContext.Provider value={value}>
      {children}
    </EstimatorSessionContext.Provider>
  );
}

export function useEstimatorSession() {
  const context = useContext(EstimatorSessionContext);
  if (!context) {
    throw new Error('useEstimatorSession must be used within an EstimatorSessionProvider');
  }
  return context;
}
