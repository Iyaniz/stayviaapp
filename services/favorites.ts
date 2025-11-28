import { Database, TablesInsert, TablesUpdate } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * FETCH FAVORITES — optionally by user_id
 */
export const fetchPostFavoritesByUserId = async (
  supabase: SupabaseClient<Database>,
  user_id?: string
) => {
  let query = supabase
    .from("favorites")
    .select(
      `
      *,
      post:posts!favorites_post_id_fkey(
        *,
        post_user:users!posts_user_id_fkey(*)
      )
      `
    )
    .order("created_at", { ascending: false });

  if (user_id) query = query.eq("user_id", user_id);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching favorites:", error.message);
    throw error;
  }

  return data ?? [];
};

/**
 * INSERT FAVORITE
 */
export const insertFavorite = async (
  favorite_data: TablesInsert<"favorites">,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("favorites")
    .insert(favorite_data)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting favorite:", error.message);
    throw error;
  }

  return data;
};

/**
 * DELETE FAVORITE
 */
export const deleteFavorite = async (
  post_id: string,
  user_id: string,
  supabase: SupabaseClient<Database>
) => {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("post_id", post_id)
    .eq("user_id", user_id);

  if (error) {
    console.error("Error deleting favorite:", error.message);
    throw error;
  }

  return true;
};


/**
 * CHECK IF FAVORITED
 */
export const checkFavorite = async (
  post_id: string,
  user_id: string,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("post_id", post_id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    // Ignore "no rows found" error
    console.error("Error checking favorite:", error.message);
    throw error;
  }

  return !!data; // returns true if favorited
};
