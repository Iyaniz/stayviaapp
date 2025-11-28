import { Database, TablesInsert } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
export type User = Database["public"]["Tables"]["users"]["Row"];

// FETCH ALL USERS

// export const fetchUsers = async (supabase: SupabaseClient<Database>) => {
export async function fetchUsers(supabase: SupabaseClient<Database>): Promise<User[]> {
  const {data, error} = await supabase
    .from("users")
    .select("*")
    // .order("create_at", {ascending: false})

    if(error) throw error;
    return data ?? []
}