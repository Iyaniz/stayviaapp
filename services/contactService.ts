import { Database, TablesInsert } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

// CREATE CONTACT SUPPORT
export const querySupport = async (
  support_data: TablesInsert<"contact_support">,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase
    .from("contact_support")
    .insert(support_data)
    .select();

  if (error) throw error;
  return data;
};
