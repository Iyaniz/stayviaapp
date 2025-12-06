import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

/**
 * Get or create a 1-on-1 conversation between two users.
 * This function properly handles finding existing conversations to prevent duplicates.
 */
export async function getOrCreateConversation(
  supabase: SupabaseClient<Database>,
  currentUserId: string,
  otherUserId: string
): Promise<Conversation> {
  // Step 1: Find all conversations where the current user is a participant
  const { data: currentUserConvs, error: currentError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId);

  if (currentError) throw currentError;

  if (!currentUserConvs || currentUserConvs.length === 0) {
    // No conversations exist for current user, create new one
    return createNewConversation(supabase, currentUserId, otherUserId);
  }

  const conversationIds = currentUserConvs
    .map((c) => c.conversation_id)
    .filter((id): id is string => !!id);

  if (conversationIds.length === 0) {
    return createNewConversation(supabase, currentUserId, otherUserId);
  }

  // Step 2: Find conversations where BOTH users are participants
  // and ensure it's a 1-on-1 chat (exactly 2 participants)
  const { data: allParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', conversationIds);

  if (participantsError) throw participantsError;

  // Group participants by conversation_id
  const conversationMap = new Map<string, string[]>();
  allParticipants?.forEach((p) => {
    if (p.conversation_id && p.user_id) {
      if (!conversationMap.has(p.conversation_id)) {
        conversationMap.set(p.conversation_id, []);
      }
      conversationMap.get(p.conversation_id)!.push(p.user_id);
    }
  });

  // Find conversations where:
  // 1. Exactly 2 participants
  // 2. Contains both currentUserId and otherUserId
  const matchingConversationIds: string[] = [];
  conversationMap.forEach((participants, convId) => {
    if (
      participants.length === 2 &&
      participants.includes(currentUserId) &&
      participants.includes(otherUserId)
    ) {
      matchingConversationIds.push(convId);
    }
  });

  if (matchingConversationIds.length > 0) {
    // Found existing conversation(s) - return the oldest one
    const { data: existingConv, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', matchingConversationIds)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (convError) throw convError;
    if (existingConv) return existingConv;
  }

  // No matching conversation found, create new one
  return createNewConversation(supabase, currentUserId, otherUserId);
}

/**
 * Helper function to create a new conversation with two participants
 */
async function createNewConversation(
  supabase: SupabaseClient<Database>,
  currentUserId: string,
  otherUserId: string
): Promise<Conversation> {
  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (convError) throw convError;

  const { error: memberError } = await supabase.from('conversation_participants').insert([
    { conversation_id: newConv.id, user_id: currentUserId },
    { conversation_id: newConv.id, user_id: otherUserId },
  ]);

  if (memberError) throw memberError;

  return newConv;
}

/**
 * Fetch all messages in a given conversation (sorted by creation time)
 */
export async function getMessages(
  supabase: SupabaseClient<Database>,
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Send a message in a conversation (with optional image)
 */
export async function sendMessage(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  senderId: string,
  content: string,
  imagePath?: string | null // <-- new optional image path
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      { conversation_id: conversationId, sender_id: senderId, content, image_path: imagePath },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Subscribe to real-time updates for new messages
 */
export function subscribeToMessages(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  onNewMessage: (message: Message) => void
) {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
      }
    )
    .subscribe();
}
