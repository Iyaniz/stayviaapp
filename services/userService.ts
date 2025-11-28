import { Database, TablesInsert } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
export type User = Database["public"]["Tables"]["users"]["Row"];

// FETCH ALL USERS

// export const fetchUsers = async (supabase: SupabaseClient<Database>) => {
export async function fetchUsers(supabase: SupabaseClient<Database>): Promise<User[]> {
  const {data, error} = await supabase
    .from("users")
    .select("*")

    if(error) throw error;
    return data ?? []
}

// FETCH USER BY ID
export const getUserById = async (id: string, supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ?? [];
};

// CREATE USER
export const registerUser = async (
  user_data: TablesInsert<"users">,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase.from("users").insert(user_data).select();
  if (error) throw error;
  return data;
};

// UPDATE USER BY ID
export const updateUser = async (
  id: string,
  user_data: Partial<TablesInsert<"users">>,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("users")
    .update(user_data)
    .eq("id", id)
    .select()
    .single(); 

  if (error) throw error;
  return data;
};
