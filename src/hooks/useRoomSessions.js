import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Fetches the last `limit` sessions for a specific room from the
 * `room_sessions` Supabase table and provides a function to save new ones.
 *
 * Expected table schema (run once in Supabase SQL editor):
 *
 * create table if not exists room_sessions (
 *   id          bigserial primary key,
 *   room_id     integer not null references rooms(id) on delete cascade,
 *   room_number text    not null,
 *   start_time  text,
 *   end_time    text,
 *   session_mode text   default 'hours',
 *   play_amount numeric default 0,
 *   bar_amount  numeric default 0,
 *   total_amount numeric default 0,
 *   duration_secs integer default 0,
 *   created_at  timestamptz default now()
 * );
 */
export function useRoomSessions(roomId, limit = 7) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('room_sessions')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to fetch room sessions:', err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId, limit]);

  useEffect(() => {
    fetchSessions();

    // Realtime: subscribe to inserts on this room's sessions
    if (!roomId) return;
    const channel = supabase
      .channel(`room-sessions-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_sessions', filter: `room_id=eq.${roomId}` },
        () => fetchSessions()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchSessions, roomId]);

  /**
   * Save a completed session to Supabase.
   * @param {object} sessionData
   */
  const saveSession = async (sessionData) => {
    console.log('[useRoomSessions] Saving session:', sessionData);
    const { data, error } = await supabase.from('room_sessions').insert([sessionData]).select();
    if (error) {
      console.error('[useRoomSessions] INSERT failed — code:', error.code, '| message:', error.message, '| details:', error.details, '| hint:', error.hint);
      return { success: false, error };
    }
    console.log('[useRoomSessions] Session saved OK:', data);
    // Optimistically prepend locally while realtime catches up
    setSessions(prev =>
      [{ ...sessionData, id: Date.now(), created_at: new Date().toISOString() }, ...prev].slice(0, limit)
    );
    return { success: true };
  };

  return { sessions, loading, saveSession, refreshSessions: fetchSessions };
}
