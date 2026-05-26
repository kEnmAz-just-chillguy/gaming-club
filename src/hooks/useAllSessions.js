import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Fetches all room sessions from Supabase for the History page.
 * Supports optional filtering by date range.
 */
export function useAllSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('room_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (fetchError) throw fetchError;
      setSessions(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch all sessions:', err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();

    // Realtime: listen for new sessions inserted across all rooms
    const channel = supabase
      .channel('all-sessions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_sessions' },
        (payload) => {
          setSessions(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchSessions]);

  // Computed stats
  const stats = {
    total: sessions.length,
    totalRevenue: sessions.reduce((a, s) => a + (s.total_amount || 0), 0),
    totalPlay: sessions.reduce((a, s) => a + (s.play_amount || 0), 0),
    totalBar: sessions.reduce((a, s) => a + (s.bar_amount || 0), 0),
    vipSessions: sessions.filter(s => s.session_mode === 'vip').length,
  };

  return { sessions, loading, error, stats, refreshSessions: fetchSessions };
}
