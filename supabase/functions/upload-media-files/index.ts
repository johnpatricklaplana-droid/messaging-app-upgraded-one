// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore
Deno.serve(async (req) => {

    const authSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        {
            global: {
                headers: { Authorization: req.headers.get('Authorization')! }
            }
        }
    );

    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if(authError || !user) {
        return new Response(
            JSON.stringify({
                error: 'Unauthorized'
            }),
            { status: 401 }
        );
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { conversationId, files } = await req.json();
    const myId = user.id;


    const { data: conversation, error: conversationError } = await supabaseClient  
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

    console.log(conversation);

    if(conversation.is_group) {
        const { data: member, error: memberError } = await supabaseClient.rpc('is_conversation_member', {
            conv_id: conversationId
        });

        if(!member || memberError) {
            return new Response(
                JSON.stringify({
                    error: 'Unauthorized'
                }),
                { status: 401 }
            );
        }

        console.log('members_group');
        console.log(member);
        console.log(memberError);
    } else {
        const { data: direct_convo, error: direct_error } = await supabaseClient  
            .from('direct_conversation')
            .select('id')
            .eq('id', conversationId)
            .or(`participant_1.eq.${myId},participant_2.eq.${myId}`);

            if(!direct_convo || direct_error) {
            return new Response(
                JSON.stringify({
                    error: 'Unauthorized'
                }),
                { status: 401 }
            );
        }
        console.log('direct_convo');
        console.log(direct_convo);
        console.error(direct_error);
    }

    let messageIdForDeletion;
    let url;

    try {
        const { data: message, error: errorMessage } = await supabaseClient
            .from('messages')
            .insert({
                text_message: null,
                conversation_id: conversationId,
                sender_id: myId,
                message_type: 'media'
            })
            .select('id')
            .single();
    
        console.log('ID');
        console.log(message);
        console.error(errorMessage);

        if(errorMessage) throw errorMessage;
    
        const uploads = await Promise.all(
            files.map(async (asset: any) => {
                const fileExt = asset.type.split('/').pop();
                const fileName = asset.name;
                const type = asset.type.split('/')[0];

                const binaryString = atob(asset.content);

                const bytes = Uint8Array.from(
                    binaryString,
                    (char) => char.charCodeAt(0)
                );

                const { data, error } = await supabaseClient.storage
                    .from('media_messages')
                    .upload(fileName, bytes, {
                        contentType: asset.type
                    });
                    
                if(error) throw error;

                const { data: { publicUrl } } = supabaseClient.storage
                    .from('media_messages')
                    .getPublicUrl(fileName);
    
                return {
                    message_id: message?.id,
                    url: publicUrl,
                    type: type
                } 

        })
    )

    const { data, error } = await supabaseClient
        .from('message_media')
        .insert(uploads);

    if (error) throw error;

    return uploads;

    } catch (error) {
        return new Response(
            JSON.stringify({
                error: error
            }),
            { status: 500 }
        )
    }
})

