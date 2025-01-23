import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ActivityItem {
  id: string;
  agent_id: string;
  agent_name: string;
  type: 'feedback';
  created_at: string;
  is_read: boolean;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to new notifications
      const notificationSubscription = supabase
        .channel('activity_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_notifications',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            // Fetch agent details for the new notification
            const { data: agent } = await supabase
              .from('agents')
              .select('name')
              .eq('id', payload.new.agent_id)
              .single();

            if (agent) {
              const newActivity: ActivityItem = {
                id: payload.new.id,
                agent_id: payload.new.agent_id,
                agent_name: agent.name,
                type: payload.new.type as 'feedback',
                created_at: payload.new.created_at,
                is_read: false
              };

              setActivities(prev => [newActivity, ...prev]);
            }
          }
        )
        .subscribe();

      // Load initial activities
      const { data } = await supabase
        .from('activity_notifications')
        .select(`
          id,
          agent_id,
          type,
          is_read,
          created_at,
          agents (
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (data) {
        const formattedActivities: ActivityItem[] = data.map(item => ({
          id: item.id,
          agent_id: item.agent_id,
          agent_name: item.agents.name,
          type: item.type as 'feedback',
          created_at: item.created_at,
          is_read: item.is_read
        }));
        setActivities(formattedActivities);
      }

      setIsLoading(false);

      return () => {
        notificationSubscription.unsubscribe();
      };
    };

    fetchActivities();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('activity_notifications')
        .update({ is_read: true })
        .eq('id', id);

      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return { activities, isLoading, markAsRead };
}