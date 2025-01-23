import { supabase } from '../lib/supabase';
import type { Feedback } from '../types/feedback';

interface FeedbackData {
  agent_id: string;
  user_id?: string;
  rating: number;
  comment: string;
}

export async function createFeedback(agentId: string, feedback: { rating: number; comment: string }, shareToken?: string) {
  // If shareToken provided, set it in the session
  if (shareToken) {
    console.log('Setting share token for feedback:', shareToken);
    await supabase.rpc('set_share_token', { share_token: shareToken });
  }

  // Prepare feedback data
  const feedbackData: FeedbackData = {
    agent_id: agentId,
    rating: feedback.rating,
    comment: feedback.comment
  };

  // Only add user_id if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    feedbackData.user_id = user.id;
  }

  console.log('Submitting feedback:', feedbackData);
  const { data, error } = await supabase
    .from('agent_feedback')
    .insert(feedbackData)
    .select()
    .single();

  if (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
  
  return data;
}

export async function getFeedbacks(agentId: string) {
  const { data, error } = await supabase
    .from('agent_feedback')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}