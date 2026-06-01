// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseClient = createClient(
    // @ts-ignore
    Deno.env.get('SUPABASE_URL')!,
    // @ts-ignore
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// @ts-ignore
Deno.serve(async (req) => {
    const { record } = await req.json();

    const conversationId = record.conversation_id;
    const senderId = record.sender_id;

    const sentNotifToThisPeople = [];

    // your logic here to find recipient and their push token
    const { data, error } = await supabaseClient
        .from('conversations')
        .select("*")
        .eq('id', conversationId);

        console.log("GET THE conversation");
        console.log(data);
        console.error(error);

    if(!data?.[0].is_group) {
        const { data, error } = await supabaseClient
            .from('conversations')
            .select("*")
            .eq('id', conversationId);

        const kaChatProfile = await getKaChatProfile(senderId, conversationId);

        sentNotifToThisPeople.push(kaChatProfile.push_token);
        
    } else if(data?.[0].is_group) {
        const { data, error } = await supabaseClient
            .from('conversation_members')
            .select('*')
            .eq('conversation_id', conversationId);

        console.log("MEMBERS");
        console.log(data);
        console.error(error);

        // @ts-ignore
        const idsToSendTheNotif = data?.map(d => {if(d.profile_id !== senderId) return d.profile_id});

        console.log(idsToSendTheNotif);
             
    }

    console.log(sentNotifToThisPeople);

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            // @ts-ignore
            to: sentNotifToThisPeople,
            title: 'New Message',
            body: record.text_message,
            priority: 'high',
            channelId: 'messages'
        })
    });

    const expoResult = await response.json();
    console.log(expoResult);
    return new Response('ok', { status: 200 });
});

async function getKaChatProfile(senderId: string, conversationId: string) {
    const { data, error } = await supabaseClient
      .from('direct_conversation')
      .select('*')
      .eq('id', conversationId);

    let kaChatId;
    let kaChatProfile;

    if(senderId === data?.[0].participant_1) {
      kaChatId = data?.[0].participant_2;
      kaChatProfile = await getKaChatProfileHelper(kaChatId);
    } else {
      kaChatId = data?.[0].participant_1
      getKaChatProfileHelper(kaChatId);
      kaChatProfile = await getKaChatProfileHelper(kaChatId);
    }

    console.log("KA CHAT INFO");
    console.log(data);
    console.error(error);
    
    return kaChatProfile;
    
}

async function getKaChatProfileHelper(kaChatId: string) {
  const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', kaChatId);

  console.log(data);
  console.error(error);

  return data?.[0];
}