import { supabase } from "@/lib/supabase";

// export const fetchUser = async (search: string) => {
//     const { data, error } = await supabase
//       .from("users")
//       .select("*")
//       .ilike('username', `%${search}%`)
//       .single();
//     if (error) throw error;
//     return data ?? [];
// };

// export const fetchPost = async () => {
//     const { data, error } = await supabase
//       .from("users")
//       .select("*");
//     if (error) throw error;
//     return data ?? [];
// };

// FILTER SEARCH

export const filterPostsByTitle = async (search: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*, user:users!posts_user_id_fkey(*)")
    .ilike('title', `%${search}%`);

  if (error) throw error;
  return data ?? [];
};

export const filterPostsByDesc = async (search: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*, user:users!posts_user_id_fkey(*)")
    .ilike('description', `%${search}%`);

  if (error) throw error;
  return data ?? [];
};

export const filterPostsByFname = async (search: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*, user:users!posts_user_id_fkey(*)")
    .ilike('user.firstname', `%${search}%`);

  if (error) throw error;
  return data ?? [];
};

export const filterPostsByLname = async (search: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*, user:users!posts_user_id_fkey(*)")
    .ilike('user->lastname', `%${search}%`);

  if (error) throw error;
  return data ?? [];
};




