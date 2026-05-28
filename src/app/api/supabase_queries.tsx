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

    const conversationIds = data?.map(d => {
        if(!d.is_group) {
            return d.id;
        }
    });

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