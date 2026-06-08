import { useUser } from "@/context/UserContext";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreVertical, UserPlus } from 'lucide-react-native';
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConversationList, getDirectConversation, getGroupConversation } from "./api/supabase_queries";

export default function Messages() {

    const COLORS = useTheme();

    console.log(COLORS);

    const user = useUser();

    const myId = user.user?.id;
    
    const [directConversation, setDirectConversation] = useState<ConversationList[]>([]);
    const [conversationIds, setConversationIds] = useState<string[] | []>([]);

    type RootStackParamList = {
        Messages: undefined;
        Chat: { conversationIdFromMessages: string | undefined };
        CreateGroupChat: undefined;
    };

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        if (!directConversation) return;
        setConversationIds(directConversation.map(dc => dc.conversationId));
    }, [directConversation]);

    useEffect(() => {

        if(!myId) return;

        getConversations();

    }, [myId]);

    useEffect(() => {

        if(!conversationIds) return;

        const channel = supabase
                .channel(`chat${myId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=in.(${conversationIds.join(',')})`
                },
                (payload) => {
                    if(payload.eventType === "INSERT") {
                        getConversations();
                    } 
                }
            )
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages_read',
                filter: `profile_id=eq.${myId}`
            },
            (payload) => {
                getConversations();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [conversationIds]);

    const getConversations = async () => {
        if(!myId) return;
        const converse = await getDirectConversation(myId);
        const groupConverse = await getGroupConversation();

        setDirectConversation([...converse, ...groupConverse].sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        )); 

    };

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
                            key={message?.conversationName}
                            style={({ pressed }) => ({
                                paddingVertical: 16, 
                                paddingHorizontal: 24,
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                transform: [{ scale: pressed ? 0.95 : 1 }],
                                backgroundColor: pressed ? COLORS.primaryTint : COLORS.background
                            })}
                            onPress={() => navigation.navigate("Chat", { conversationIdFromMessages: message?.conversationId })}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Image 
                                    style={{ borderRadius: 50, width: 50, height: 50 }} 
                                    source={{ uri: decodeURIComponent(message.conversationAvatar) }} 
                                />
                                <View>
                                    <Text style={{ color: message.isRead ? COLORS.textPrimary : COLORS.primary, fontSize: 18, fontWeight: 600, }}>{message?.conversationName}</Text>
                                    <Text numberOfLines={1} style={{ color: message.isRead ? COLORS.textMuted : COLORS.primary, maxWidth: '80%' }}>{message?.senderName}: {message?.lastMessage}</Text>
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