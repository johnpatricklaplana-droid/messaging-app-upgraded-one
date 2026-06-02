import { supabase } from "@/lib/supabase";

interface relatedOnes {
    id: string;
    name: string;
    profilePicUrl: string;
}

export async function getRelatedPeople(myId: string) {

    const { data, error } = await supabase
        .from('conversations')
        .select("*");

    const conversation = data?.filter(d => {
        if(!d.is_group) {
            return d.id;
        }
    });

    const conversationIds = conversation?.map(conv => conv.id);

    if(!conversationIds) return;
   
    return await getOtherSideOfDirectConversation(conversationIds, myId);

}

export async function getOtherSideOfDirectConversation(conversationId: string[], myId: string) {
    const { data, error } = await supabase
        .from('direct_conversation')
        .select("*")
        .in('id', conversationId);

    const userIds = data?.map(d => {
        if (d.participant_1 === myId) {
            return d.participant_2;
        } else {
            return d.participant_1;
        }
    });

    if(!userIds) return;

    return getProfilesOfRelatedPeople(userIds);
}

export async function getProfilesOfRelatedPeople(userId: string[]) {
    const { data, error } = await supabase
        .from('profiles')
        .select("*")
        .in('id', userId);

    return data?.map(d => ({
        id: d.id,
        name: d.full_name,
        image: d.avatar_url,
        checked: false
    }));
}

export interface ConversationList {
    conversationId: string;
    conversationAvatar: string;
    conversationName: string;
    lastMessage: string;
    lastMessageTime: string;
    senderName: string;
    isRead: boolean
};

export async function getDirectConversation(myId: string) {

    const directConv: ConversationList[] = [];

    const { data, error } = await supabase.rpc('get_direct_conversations_with_last_message');

    console.log("let is see some");
    console.log(data);

    data.forEach((da: any) => {
        directConv.push({
            conversationId: da.conversation_id,
            conversationAvatar: da.other_user_avatar,
            conversationName: da.other_user_name,
            lastMessage: da.last_message, 
            lastMessageTime: da.last_message_time,
            senderName: da.sender_id === myId ? 'you' : da.sendername,
            isRead: da.is_read
        });
    });

    return directConv;

}

export async function getGroupConversation() {

    const directConv: ConversationList[] = [];
    
    const { data, error } = await supabase.rpc('get_group_conversations_with_last_message');

        console.log("PWEDE?");
    console.log(JSON.stringify(data));
    console.log(error);

    data?.forEach((d: any) => {
        directConv.push({
            conversationId: d.conversation_id,
            conversationAvatar: d.conversation_avatar,
            conversationName: d.conversation_name,
            lastMessage: d.last_message,
            lastMessageTime: d.last_message_time,
            senderName: d.sender_name,
            isRead: false
        });
    });
   
    return directConv;
}