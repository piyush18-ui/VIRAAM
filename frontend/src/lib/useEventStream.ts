import { useEffect, useRef, useState, useCallback } from 'react';

export interface StreamEventData {
  type: string;
  data: Record<string, any>;
  ts: string;
}

export function useEventStream(onEvent?: (event: StreamEventData) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<StreamEventData | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/stream');
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    const handleMessage = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        const eventItem: StreamEventData = {
          type: e.type || parsed.type || 'message',
          data: parsed.data || parsed,
          ts: parsed.ts || new Date().toISOString(),
        };
        setLastEvent(eventItem);
        if (onEventRef.current) {
          onEventRef.current(eventItem);
        }
      } catch (err) {
        console.error('Failed to parse SSE payload', err);
      }
    };

    // Listen for custom SSE event types
    es.addEventListener('transaction', handleMessage);
    es.addEventListener('risk_alert', handleMessage);
    es.addEventListener('hold_started', handleMessage);
    es.addEventListener('hold_released', handleMessage);
    es.addEventListener('cosign_requested', handleMessage);
    es.addEventListener('cosign_resolved', handleMessage);
    es.addEventListener('graph_update', handleMessage);
    es.addEventListener('freeze_executed', handleMessage);
    es.addEventListener('call_alert', handleMessage);
    es.addEventListener('simulation_reset', handleMessage);
    es.onmessage = handleMessage;

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      // Auto-reconnect with 3 second delay
      retryTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [connect]);

  return { isConnected, lastEvent };
}
