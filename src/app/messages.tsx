import { COLORS } from "@/constants/themeMyVersion";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreVertical, UserPlus } from 'lucide-react-native';
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Messages() {

    const user = useUser();

    const myId = user.user?.id;
    console.log("I HAPPEN");
    console.log(myId);

    interface DirectConversation {
        profilePic: string;
        name: string;
        lastMessage: string;
        lastMessageTime: string;
        senderName: string;
        otherSideId: string,
        myId: string | undefined
    }
    
    const [directConversation, setDirectConversation] = useState<DirectConversation[]>([]);

    type RootStackParamList = {
        Messages: undefined;
        Chat: { myId: string | undefined; otherSideId: string };
        CreateGroupChat: undefined;
    };

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {

        if(!myId) return;

        getConversations();

    }, [myId]);

    const getConversations = async () => {
        const { data, error } = await supabase
            .from('conversations')
            .select('*');

            console.log(data);
            console.log(error);

        const directOnes = data?.filter(convo => { if(!convo.is_group) { return convo } });


        const directConversationId = directOnes?.map(direct => {
            return direct.id
        });

        directConversationId?.forEach(async convId => {
            const directConvoWithMembers = await getDirectConversation(convId);
           
            getLastMessageFromConversation(convId, directConvoWithMembers?.[0]);
        });

    };

    const getDirectConversation = async (convoId: string) => {
        const { data, error } = await supabase
            .from('direct_conversation')
            .select('*, part_1:profiles!participant_1(*), part_2:participant_2(*)')
            .eq('id', convoId);
        
        return data;
    };

    const getLastMessageFromConversation = async (conversationId: any, directConvoWithMembers: any) => {
        console.log(conversationId);
        const { data, error } = await supabase
            .from('messages')
            .select('*, profiles!sender_id(*)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

            console.log("MYSUPERIID");
        console.log(myId);

        setDirectConversation([{
            profilePic: directConvoWithMembers.part_1.id !== myId ? directConvoWithMembers.part_1.avatar_url : directConvoWithMembers.part_2.avatar_url,
            name: directConvoWithMembers.part_1.id !== myId ? directConvoWithMembers.part_1.full_name : directConvoWithMembers.part_2.full_name,
            lastMessage: data.text_message,
            lastMessageTime: data.created_at,
            senderName: data.sender_id === directConvoWithMembers.part_1.id ? directConvoWithMembers.part_1.full_name : directConvoWithMembers.part_2.full_name,
            otherSideId: directConvoWithMembers.part_1.id !== myId ? directConvoWithMembers.part_1.id : directConvoWithMembers.part_2.id,
            myId: myId
        }]);
    };

    console.log(directConversation);

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: COLORS.background }}>
            <ScrollView contentContainerStyle={{ }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 0 }}>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 32, fontWeight: 700 }}>Messages</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <Pressable 
                            onPress={() => navigation.navigate("CreateGroupChat")}
                        >
                            <UserPlus width={22} height={22} color={COLORS.textSecondary}></UserPlus>
                        </Pressable>
                        <MoreVertical width={22} color={COLORS.textSecondary}></MoreVertical>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 24 }}>
                    <TextInput style={{ backgroundColor: "#FFFFFF0F", paddingHorizontal: 16, borderRadius: 16, marginTop: 16 }} placeholder="search some" placeholderTextColor={COLORS.textMuted}></TextInput>
                </View>
                <View style={{ flexDirection: 'row', paddingHorizontal: 24, justifyContent: 'space-between', marginTop: 16 }}>
                    <Pressable style={{}}><Text style={{ color: COLORS.textMuted }}>All</Text></Pressable>
                    <Pressable style={{}}><Text style={{ color: COLORS.textMuted }}>Unread</Text></Pressable>
                    <Pressable style={{}}><Text style={{ color: COLORS.textMuted }}>Sheets</Text></Pressable>
                </View>
                <View style={{ marginTop: 8 }}>
                    {directConversation.map(message =>
                        <Pressable
                            key={message?.name}
                            style={({ pressed }) => ({
                                paddingVertical: 16, 
                                paddingHorizontal: 24,
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                transform: [{ scale: pressed ? 0.95 : 1 }],
                                backgroundColor: pressed ? COLORS.primaryTint : COLORS.background
                            })}
                            onPress={() => navigation.navigate("Chat", { myId: message?.myId, otherSideId: message?.otherSideId })}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Image style={{ borderRadius: 50, width: 50, height: 50 }} source={{ uri: message.profilePic }} />
                                <View>
                                    <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 600, }}>{message?.name}</Text>
                                    <Text style={{ color: COLORS.textMuted }}>{message?.senderName}: {message?.lastMessage}</Text>
                                </View>
                            </View>
                            <Text numberOfLines={1} style={{ color: COLORS.textMuted, textAlign: 'right', width: 56 }}>{message?.lastMessageTime}</Text>
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}