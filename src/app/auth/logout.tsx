import { supabase } from "@/lib/supabase";

export async function Logout() {
    
    await supabase.auth.signOut();
}