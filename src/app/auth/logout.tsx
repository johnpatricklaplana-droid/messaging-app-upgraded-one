import { supabase } from "@/lib/supabase";

export async function Logout() {
    console.log("LOGOUT HAPPENS?");
    await supabase.auth.signOut();
}