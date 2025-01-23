import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getShareToken } from '../services/conversations/utils';

export function useLogo() {
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const shareToken = getShareToken();
      console.log('Share token:', shareToken);
      
      if (shareToken) {
        // In shared context, get the agent owner's logo
        const { data: shareData, error: shareError } = await supabase
          .from('shared_agent_urls')
          .select('created_by')
          .eq('url_token', shareToken)
          .single();

        if (shareError) {
          console.error('Error fetching share data:', shareError);
          throw shareError;
        }

        console.log('Share data:', shareData);

        if (shareData) {
          const { data: prefs, error: prefsError } = await supabase
            .from('user_preferences')
            .select('logo_url')
            .eq('user_id', shareData.created_by)
            .single();

          if (prefsError) {
            console.error('Error fetching user preferences:', prefsError);
            throw prefsError;
          }

          console.log('User preferences:', prefs);
          setLogo(prefs?.logo_url || null);
        }
      } else {
        // In authenticated context, get the current user's logo
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: prefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('logo_url')
          .eq('user_id', user.id)
          .single();

        if (prefsError) {
          console.error('Error fetching user preferences:', prefsError);
          throw prefsError;
        }

        setLogo(prefs?.logo_url || null);
      }
    } catch (error) {
      console.error('Error loading logo:', error);
      // Log the specific error type and message
      if (error instanceof Error) {
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { logo, isLoading };
}