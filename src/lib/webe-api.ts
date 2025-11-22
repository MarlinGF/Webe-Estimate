import { appConfig } from '@/lib/config';
import { EstimatorSessionPayload } from '@/context/estimator-session';

export type MessagePayload = {
  pageId: string;
  recipientId: string;
  recipientType: string;
  message: string;
  subject?: string;
  sessionId?: string;
};

export async function postEstimatorMessage(
  payload: MessagePayload,
  init?: RequestInit
) {
  const endpoint = `${appConfig.apiBaseUrl}/api/estimates/message`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to post estimator message (${response.status}): ${body}`);
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json();
  }

  return null;
}

export type MessageInput = {
  recipientId: string;
  recipientType: string;
  message: string;
  subject?: string;
  pageId?: string;
};

export const buildMessagePayload = (
  session: EstimatorSessionPayload,
  input: MessageInput
): MessagePayload => {
  const resolvedPageId =
    input.pageId || session.pageId || (session.page as { id?: string } | undefined)?.id;

  if (!resolvedPageId) {
    throw new Error('Unable to determine pageId for estimator message payload.');
  }

  return {
    pageId: resolvedPageId,
    recipientId: input.recipientId,
    recipientType: input.recipientType,
    message: input.message,
    subject: input.subject,
    sessionId: session.sessionId,
  };
};
