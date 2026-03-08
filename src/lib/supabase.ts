import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ztisaaegcwefcrbkgzot.supabase.co";
const supabaseAnonKey = "sb_publishable_d9O1FrNoQvdzGrKbXK_CUA_Bi5knOME";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
