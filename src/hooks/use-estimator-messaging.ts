'use client';

import { useCallback } from 'react';
import { useEstimatorSession } from '@/context/estimator-session';
import { MessageInput, buildMessagePayload, postEstimatorMessage } from '@/lib/webe-api';

export function useEstimatorMessaging() {
  const { session } = useEstimatorSession();

  const sendMessage = useCallback(
    async (input: MessageInput) => {
      if (!session) {
        throw new Error('Cannot send message without an active WeBe session.');
      }

      const payload = buildMessagePayload(session, input);
      return postEstimatorMessage(payload);
    },
    [session]
  );

  return {
    sendMessage,
    hasSession: Boolean(session),
    session,
  };
}
