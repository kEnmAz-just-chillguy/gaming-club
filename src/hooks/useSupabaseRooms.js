import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export function useSupabaseRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync room count to trigger sidebar badge update
  const syncBadgeCount = useCallback((roomsList) => {
    try {
      window.localStorage.setItem('gc_rooms_count', String(roomsList.length));
      window.dispatchEvent(new Event('rooms_updated'));
    } catch (e) {}
  }, []);

  // Fetch rooms from Supabase
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .order('number', { ascending: true });

      if (fetchError) throw fetchError;

      const mappedRooms = (data || []).map(r => ({
        ...r,
        console: r.equipment || 'PS5',
      }));

      setRooms(mappedRooms);
      syncBadgeCount(mappedRooms);
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms from Supabase:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [syncBadgeCount]);

  // Handle Real-time updates on 'rooms' table
  useEffect(() => {
    fetchRooms();

    const channel = supabase
      .channel('rooms-realtime-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          
          setRooms((currentRooms) => {
            let updatedRooms;
            
            if (payload.eventType === 'INSERT') {
              const newRoom = {
                ...payload.new,
                console: payload.new.equipment || 'PS5',
              };
              if (currentRooms.some(r => r.id === newRoom.id)) {
                updatedRooms = currentRooms;
              } else {
                updatedRooms = [...currentRooms, newRoom].sort((a, b) => 
                  a.number.localeCompare(b.number)
                );
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedRoom = {
                ...payload.new,
                console: payload.new.equipment || 'PS5',
              };
              updatedRooms = currentRooms.map(r => 
                r.id === updatedRoom.id ? updatedRoom : r
              );
            } else if (payload.eventType === 'DELETE') {
              updatedRooms = currentRooms.filter(r => r.id !== payload.old.id);
            } else {
              updatedRooms = currentRooms;
            }

            syncBadgeCount(updatedRooms);
            return updatedRooms;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRooms, syncBadgeCount]);

  // Insert a room
  const addRoom = async (newRoom) => {
    try {
      const roomToInsert = {
        ...newRoom,
        equipment: newRoom.console || newRoom.equipment || 'PS5',
      };
      
      // Delete frontend-only fields that aren't columns in the database table
      delete roomToInsert.console;

      const { data, error: insertError } = await supabase
        .from('rooms')
        .insert([roomToInsert])
        .select();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      console.error('Error adding room:', err.message);
      throw err;
    }
  };

  // Update a room
  const updateRoom = async (roomId, updates) => {
    try {
      const dbUpdates = { ...updates };
      
      // Map console to equipment if present
      if ('console' in dbUpdates) {
        dbUpdates.equipment = dbUpdates.console;
        delete dbUpdates.console;
      }

      // Strip created_at if it's there
      delete dbUpdates.created_at;

      const { data, error: updateError } = await supabase
        .from('rooms')
        .update(dbUpdates)
        .eq('id', roomId)
        .select();

      if (updateError) throw updateError;
      return data;
    } catch (err) {
      console.error('Error updating room:', err.message);
      throw err;
    }
  };

  // Delete a room
  const deleteRoom = async (roomId) => {
    try {
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting room:', err.message);
      throw err;
    }
  };

  return {
    rooms,
    loading,
    error,
    addRoom,
    updateRoom,
    deleteRoom,
    refreshRooms: fetchRooms,
  };
}
