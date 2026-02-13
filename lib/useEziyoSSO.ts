'use client';

import { useEffect, useRef } from 'react';

const EZIYO_ORIGIN =
  process.env.NEXT_PUBLIC_EZIYO_APP_URL || 'https://eziyo.app';

/**
 * Hook that listens for Ezíyo SSO tokens via postMessage.
 *
 * Flow:
 *  1. Form Builder iframe loads and sends a "fb:ready" message to the parent
 *  2. Ezíyo parent receives "fb:ready" and posts { type: "eziyo:sso-token", token }
 *  3. This hook receives the token and calls the provided callback
 *
 * Origin is validated on both directions to prevent cross-origin attacks.
 */
export function useEziyoSSO(onToken: (token: string) => void) {
  const callbackRef = useRef(onToken);

  useEffect(() => {
    callbackRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    // Only activate inside an iframe
    if (window.self === window.top) {
      console.log('🔵 SSO: Not in iframe, skipping SSO handshake');
      return;
    }

    console.log('🔵 SSO: Detected iframe mode, sending ready signal...');

    // Step 1: Tell the Ezíyo parent we're ready to receive the token
    // Use '*' for local testing, in production this will use EZIYO_ORIGIN
    const targetOrigin =
      process.env.NODE_ENV === 'development' ? '*' : EZIYO_ORIGIN;
    window.parent.postMessage({ type: 'fb:ready' }, targetOrigin);
    console.log('🔵 SSO: Sent fb:ready to parent');

    // Step 2: Listen for the SSO token from the parent
    const handleMessage = (event: MessageEvent) => {
      console.log(
        '🔵 SSO: Received message from parent:',
        event.origin,
        event.data,
      );

      // In development, accept from any origin for local testing
      // In production, validate origin
      if (
        process.env.NODE_ENV === 'production' &&
        event.origin !== EZIYO_ORIGIN
      ) {
        console.warn(
          '🔵 SSO: Rejected message from unauthorized origin:',
          event.origin,
        );
        return;
      }

      const data = event.data;
      if (data?.type === 'eziyo:sso-token' && typeof data.token === 'string') {
        console.log('🔵 SSO: Received valid JWT token, logging in...');
        callbackRef.current(data.token);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
}
