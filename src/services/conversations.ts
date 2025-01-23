import { supabase } from '../lib/supabase';
import { generateSessionId } from '../utils/session';
import type { Message } from './chat/types';

export interface Conversation {
  id: string;
  agent_id: string;
  user_id?: string;
  session_id: string;
  shared_token?: string;
  created_at: string;
  updated_at: string;
  messages: (Message & { created_at: string })[];
}

export async function createConversation(agentId: string) {
  const sessionId = generateSessionId();
  
  try {
    console.log('[conversations] Creating conversation:', { agentId, sessionId });
    // Get current user and share token
    const { data: { user } } = await supabase.auth.getUser();
    const shareToken = window.location.pathname.split('/shared/')[1];

    // Prepare conversation data
    const conversationData: any = {
      agent_id: agentId,
      session_id: sessionId
    };

    // Add user_id if authenticated
    if (user) {
      console.log('[conversations] Adding user_id to conversation:', user.id);
      conversationData.user_id = user.id;
    }

    // Add shared_token if in shared context
    if (shareToken) {
      console.log('[conversations] Adding shared_token to conversation:', shareToken);
      conversationData.shared_token = shareToken;
    }

    // Create the conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) {
      console.error('[conversations] Error creating conversation:', error);
      throw error;
    }
    
    console.log('[conversations] Conversation created successfully:', data);
    return data;
  } catch (error) {
    console.error('[conversations] Failed to create conversation:', error);
    throw error;
  }
}

export async function saveMessage(conversationId: string, message: Message) {
  console.log('[conversations] Saving message:', {
    conversationId,
    role: message.role,
    contentPreview: message.content.substring(0, 50) + '...'
  });

  const { error } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      role: message.role,
      content: message.content
    });

  if (error) {
    console.error('[conversations] Error saving message:', error);
    throw error;
  }

  console.log('[conversations] Message saved successfully');
}

export async function getConversations(agentId: string): Promise<Conversation[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    console.log('Fetching conversations for agent:', agentId);

    // Build the query with more complete data
    let query = supabase
      .from('conversations')
      .select(`
        *,
        messages:conversation_messages(
          role,
          content,
          created_at
        )
      `)
      .eq('agent_id', agentId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (!user) {
      // For anonymous users (shared context), only show their conversations
      const shareToken = window.location.pathname.split('/shared/')[1];
      if (shareToken) {
        await supabase.rpc('set_share_token', { share_token: shareToken });
        query = query.eq('shared_token', shareToken);
      }
    }
    // For authenticated users, rely on RLS policies to filter appropriately

    // Execute query
    const { data: conversations, error: conversationsError } = await query;

    if (conversationsError) {
      console.error('Query error:', conversationsError);
      throw conversationsError;
    }

    if (!conversations) {
      console.log('No conversations found');
      return [];
    }

    console.log('Raw conversations:', conversations);
    
    // Transform and log each conversation's messages
    const conversationsWithMessages = conversations.map(conversation => {
      const sortedMessages = conversation.messages.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      console.log(`Conversation ${conversation.id} has ${sortedMessages.length} messages`);
      return {
        ...conversation,
        messages: sortedMessages
      };
    });

    // Log before filtering
    console.log('Before filtering:', conversationsWithMessages.length, 'conversations');
    
    // Filter and return conversations with messages
    const filteredConversations = conversationsWithMessages.filter(conv => conv.messages.length > 0);
    console.log('After filtering:', filteredConversations.length, 'conversations');
    
    return filteredConversations;
  } catch (error) {
    console.error('Failed to get conversations:', error);
    throw error;
  }
}

export async function deleteConversations(conversationIds: string[]) {
  try {
    console.log('Attempting to delete/archive conversations:', conversationIds);

    // First, get the conversations to check which are shared
    const { data: conversations, error: fetchError } = await supabase
      .from('conversations')
      .select('id, shared_token')
      .in('id', conversationIds);

    if (fetchError) {
      console.error('Error fetching conversations:', fetchError);
      throw fetchError;
    }
    if (!conversations) {
      console.log('No conversations found to delete/archive');
      return;
    }

    // Separate IDs based on whether they're shared
    const regularIds = conversations
      .filter(c => !c.shared_token)
      .map(c => c.id);
    
    const sharedIds = conversations
      .filter(c => c.shared_token)
      .map(c => c.id);

    console.log('Regular conversations to delete:', regularIds);
    console.log('Shared conversations to archive:', sharedIds);

    // Delete regular conversations
    if (regularIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .in('id', regularIds);

      if (deleteError) {
        console.error('Error deleting regular conversations:', deleteError);
        throw deleteError;
      }
      console.log('Successfully deleted regular conversations');
    }

    // Archive shared conversations
    if (sharedIds.length > 0) {
      const { data: updated, error: archiveError } = await supabase
        .from('conversations')
        .update({ 
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .in('id', sharedIds)
        .select();

      if (archiveError) {
        console.error('Error archiving shared conversations:', archiveError);
        throw archiveError;
      }
      console.log('Successfully archived shared conversations:', updated);
    }
  } catch (error) {
    console.error('Failed to delete/archive conversations:', error);
    throw error;
  }
}