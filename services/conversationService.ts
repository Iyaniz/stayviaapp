import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];

/**
 * Get or create a 1-on-1 conversation between two users.
 */
export async function getOrCreateConversation(
  supabase: SupabaseClient<Database>,
  currentUserId: string,
  otherUserId: string
): Promise<Conversation> {
  const { data: existing, error: checkError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUserId)
    .not("conversation_id", "is", null);

  if (checkError) throw checkError;

  if (existing && existing.length > 0) {
    const sharedConversationIds = existing
      .map((e) => e.conversation_id)
      .filter((id): id is string => !!id);

    if (sharedConversationIds.length > 0) {
      const { data: shared, error: sharedError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .in("conversation_id", sharedConversationIds)
        .eq("user_id", otherUserId)
        .maybeSingle();

      if (sharedError) throw sharedError;

      if (shared?.conversation_id) {
        const { data: convData, error: convErr } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", shared.conversation_id)
          .maybeSingle();

        if (convErr) throw convErr;
        if (convData) return convData;
      }
    }
  }

  const { data: newConv, error: convError } = await supabase
    .from("conversations")
    .insert({})
    .select()
    .single();

  if (convError) throw convError;

  const { error: memberError } = await supabase
    .from("conversation_participants")
    .insert([
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
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

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
    .from("messages")
    .insert([
      { conversation_id: conversationId, sender_id: senderId, content, image_path: imagePath }
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
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
      }
    )
    .subscribe();
}
