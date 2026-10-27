'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export interface SSENotification {
  id?: string;
  type: string;
  title?: string;
  message?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  created_at?: string;
}

/**
 * Real-time SSE hook — connects to /api/v1/notifications/stream
 * and pushes live updates to any subscribed component.
 *
 * Usage:
 *   const { notifications, unreadCount, isConnected } = useSSE();
 */
export function useSSE() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<SSENotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!token || eventSourceRef.current) return;

    try {
      // SSE doesn't support Authorization header natively,
      // so we pass the token as a query param (backend should support this)
      const url = `/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        console.log('[SSE] Connected to notification stream');
      };

      es.onmessage = (event) => {
        try {
          const data: SSENotification = JSON.parse(event.data);
          if (data.type === 'connected') return; // Initial handshake

          setNotifications(prev => [data, ...prev].slice(0, 50));
          setUnreadCount(prev => prev + 1);
        } catch {
          // Ignore malformed messages
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        eventSourceRef.current = null;

        // Auto-reconnect after 5 seconds
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (err) {
      console.warn('[SSE] Connection failed:', err);
    }
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [connect]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, isConnected, markAllRead };
}
