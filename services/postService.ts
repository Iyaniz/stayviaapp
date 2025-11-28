import { Database, Tables, TablesInsert } from '@/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

// FETCH POSTS
export const fetchPostsWithUser = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, post_user:users!posts_user_id_fkey(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

// FETCH POST BY ID
export const fetchPostsById = async (id: string, supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, post_user:users!posts_user_id_fkey(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data ?? null;
};

// FETCH POST REQUESTS
export const fetchPostsRequests = async (id: string, supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('post_id', id)
    .returns<Tables<'requests'>[]>();
  if (error) throw error;
  return data ?? null;
};

// FETCH POSTS BY USER ID
export const fetchPostsByUserId = async (user_id: string, supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, post_user:users!posts_user_id_fkey(*)')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

// INSERT POST
export const insertPost = async (
  post_data: TablesInsert<'posts'>,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase.from('posts').insert(post_data).select();
  if (error) throw error;
  return data;
};

// DELETE POST - with cascading deletes
export const deletePost = async (
  post_id: string,
  user_id: string,
  supabase: SupabaseClient<Database>
) => {
  try {
    // Delete in this order to respect foreign key constraints:
    // 1. Delete ratings associated with this post
    await supabase.from('ratings').delete().eq('post_id', post_id);

    // 2. Delete payments associated with requests for this post
    const { data: requests } = await supabase.from('requests').select('id').eq('post_id', post_id);

    if (requests && requests.length > 0) {
      const requestIds = requests.map((r) => r.id);
      await supabase.from('payments').delete().in('request_id', requestIds);

      // 3. Delete requests for this post
      await supabase.from('requests').delete().eq('post_id', post_id);
    }

    // 4. Delete favorites for this post
    await supabase.from('favorites').delete().eq('post_id', post_id);

    // 5. Finally delete the post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post_id)
      .eq('user_id', user_id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

//     .contains("filters", filters);
//   if (error) throw error;
//   return data ?? [];
// };
