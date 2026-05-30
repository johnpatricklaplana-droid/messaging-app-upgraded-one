import { COLORS } from "@/constants/themeMyVersion";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Copy, Edit, Forward, MoreVertical, Phone, Plus, SendHorizontalIcon, Trash2, Video } from "lucide-react-native";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Image, Keyboard, KeyboardEvent, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatMessageTime } from "./helper.tsx/formatDate";

// export async function getDirectConversationId(myId: string, otherSideId: string) {
//     const { data, error } = await supabase
//         .from('direct_conversation')
//         .select('id')
//         .or(`and(participant_1.eq.${myId.trim()},participant_2.eq.${otherSideId.trim()}),and(participant_1.eq.${otherSideId.trim()},participant_2.eq.${myId.trim()})`);

//     return data;

// }

export default function Chat() {

    const user = useUser();

    const myId = user.user?.id;

    const keyboardHeight = useRef(new Animated.Value(0)).current;

    // KEYBOARD ANIMATION
    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
            console.log(e);
            Animated.timing(keyboardHeight, {
                toValue: e.endCoordinates.height,
                duration: e.duration,
                useNativeDriver: false
            }).start();
        });

        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            Animated.timing(keyboardHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start();
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const navigation = useNavigation();
    const route = useRoute();
    const { conversationIdFromMessages } = route.params as { conversationIdFromMessages: string; };

    interface Message {
        sentAt: string;
        messageId: string,
        sender_id: string,
        text_message: string,
        me: boolean
    };

    interface KaChat {
        avatarUrl: string,
        name: string
    }

    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [textMessage, setTextMessage] = useState("");
    const [kaChatProfile, setKaChatProfile] = useState<KaChat | null>(null);
    const [optionsOpen, SetOptionsOpen] = useState(false);

    const ScrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if(!conversationIdFromMessages) return;
        const getMessagesIfExist = async () => {

            setConversationId(conversationIdFromMessages);

        };

        getMessagesIfExist();
        getChatInfo();
        
    }, [conversationIdFromMessages]);

    const getMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false });

        const sortedData = data?.reverse();
        
        setMessages((sortedData?.map(mes => {

            let me = false;

            if(mes.sender_id === myId) {
                me = true;
            }

            return {
                messageId: mes.id,
                sender_id: mes.sender_id,
                sentAt: formatMessageTime(mes.created_at),
                text_message: mes.text_message,
                me: me
            } 

        })) ?? []);

    }

    const getChatInfo = async () => {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationIdFromMessages);

        if(data?.[0]?.is_group) {
            setKaChatProfile({
                name: data?.[0].conversation_name,
                avatarUrl: data?.[0].avatar_url
            });
        } else {
            const { data, error } = await supabase.rpc('getkachatprofile', {
                p_conversation_id: conversationIdFromMessages
            });

            setKaChatProfile({
                name: data?.[0].friend_name,
                avatarUrl: data?.[0].friend_avatar
            });
        }
    }

    // REAL TIME CHECK
    useEffect(() => {
        if(!conversationId) return;

        const channel = supabase
            .channel(`chat${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            },
            (payload) => {
                let me = false;
                if(payload.new.sender_id === myId) {
                    me = true;
                } 
            
                setMessages(prev => [...prev, {
                    messageId: payload.new.id,
                    sender_id: payload.new.sender_id,
                    sentAt: formatMessageTime(payload.new.created_at),
                    text_message: payload.new.text_message,
                    me: me
                }]);
            }
        ).subscribe();

        getMessages();
        // getKaChatInfo();

        return () => { supabase.removeChannel(channel) };

    }, [conversationId]);

    const sendMessage = async () => {
        if(!conversationId) {
            // createConversation();
            console.log("NO CONVERSATION YET");
        }
        const { data, error } = await supabase
            .from('messages')
            .insert({
                text_message: textMessage,
                conversation_id: conversationId,
                sender_id: myId
            });
        
        setTextMessage("");
        Keyboard.dismiss();
    };

    const deleteMessage = async (message_id: string) => {
        const { data, error } = await supabase
            .from('messages')
            .delete()
            .eq('id', message_id);

        console.log(data);
        console.error(error);
    };

    // const createConversation = async () => {
    //     const { data, error } = await supabase.rpc('create_direct_conversation', {
    //         p_participant_1: myId,
    //         p_participant_2: otherSideId,
    //     });
    // };

    interface OptionsWhenLongPressTheMessage {
        id: number;
        icon: ReactNode;
        label: string;
        metadata: string;
    };

    const optionsWhenLongPressTheMessage: OptionsWhenLongPressTheMessage[] = [
        { id: 1, icon: <View style={{ padding: 16, backgroundColor: COLORS.lightBlueLower, borderRadius: 16 }} ><Copy color={COLORS.lightBlue}></Copy></View>, label: 'Copy', metadata: 'Copy text to clipboard' },
        { id: 2, icon: <View style={{ padding: 16, backgroundColor: COLORS.natanLower, borderRadius: 16 }} ><Forward color={COLORS.nathan}></Forward></View>, label: 'Forward', metadata: 'Send to another chat' },
        { id: 3, icon: <View style={{ padding: 16, backgroundColor: COLORS.primaryTint, borderRadius: 16 }} ><Edit color={COLORS.primary}></Edit></View>, label: 'Edit', metadata: 'Modify sent messsage' },
        { id: 4, icon: <View style={{ padding: 16, backgroundColor: COLORS.missedCallLower, borderRadius: 16 }} ><Trash2 color={COLORS.missedCall}></Trash2></View>, label: 'Delete', metadata: 'Healing for everyone' },
        
    ];

    return (
        <SafeAreaView style={{ backgroundColor: COLORS.background, flex: 1 }}>
                <Animated.View
                    style={{ flex: 1, paddingBottom: keyboardHeight }}
                >
                    <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.divider }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Pressable onPress={() => navigation.goBack()}><ArrowLeft color={COLORS.primary}></ArrowLeft></Pressable>
                            <Image
                                source={{ uri: kaChatProfile?.avatarUrl }}
                                height={50}
                                width={50}
                                style={{ borderRadius: 50, borderColor: COLORS.tabBorder, borderWidth: 1 }}
                            />
                            <View>
                                <Text style={{ lineHeight: 20, fontWeight: 700, color: COLORS.textPrimary, fontSize: 22 }}>{kaChatProfile?.name}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable><Phone color={COLORS.textSecondary}></Phone></Pressable>
                            <Pressable><Video color={COLORS.textSecondary}></Video></Pressable>
                            <Pressable><MoreVertical color={COLORS.textSecondary}></MoreVertical></Pressable>
                        </View>
                    </View>
                    <ScrollView
                        ref={ScrollViewRef}
                        onContentSizeChange={() => 
                            ScrollViewRef.current?.scrollToEnd({ animated: false })
                        }
                        contentContainerStyle={{ paddingHorizontal: 22 }}
                    >
                    <View style={{ margin: 'auto', alignItems: 'center', paddingTop: '40%', marginBottom: 32 }}>
                        <Image
                            width={100}
                            height={100}
                            style={{ borderRadius: 50, margin: 8 }}
                            source={{ uri: kaChatProfile?.avatarUrl }}
                        >

                        </Image>
                        <Text style={{ textAlign: 'center', color: COLORS.textPrimary, fontSize: 22, marginBottom: 4, fontWeight: 700 }}>{kaChatProfile?.name}</Text>
                        <Text style={{ textAlign: "center", fontSize: 12, marginBottom: 22, color: COLORS.textMuted }}>johnyHeyDaddy@gmail.com</Text>
                        <Text style={{ color: COLORS.textSecondary, textAlign: "center", marginBottom: 8 }}>your not connected</Text>
                        <Text style={{ marginBottom: 16, color: COLORS.textSecondary, textAlign: "center" }}>Say hi to start the conversation!</Text>
                        <Pressable
                            style={{
                                backgroundColor: COLORS.primaryTint,
                                borderColor: COLORS.primary,
                                borderWidth: 1,
                                borderRadius: 16,
                                flexDirection: 'row',
                                gap: 8,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                justifyContent: 'center'
                            }}
                        >
                            <Text>👏</Text>
                            <Text style={{ color: COLORS.primaryLight }}>Hey Daddy</Text>
                        </Pressable>
                    </View>
                    {messages.map((mes, i) => {
                            if (mes.me) {
                                return (
                                    <View
                                        style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%', alignSelf: 'flex-end' }}
                                        key={i}
                                    >
                                        <View>
                                            <Pressable 
                                                onLongPress={() => SetOptionsOpen(true)}
                                                style={({ pressed }) => ({
                                                borderBottomRightRadius: 5, 
                                                padding: 16, borderRadius: 16, 
                                                backgroundColor: pressed ? COLORS.primaryLight : COLORS.primary, 
                                                transform: [{ scale: pressed ? 0.95 : 1 }]
                                            })}><Text style={{ color: COLORS.textPrimary }}>{mes.text_message}</Text>
                                            </Pressable>
                                            <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12, textAlign: 'right' }}>{mes.sentAt}</Text>
                                        </View>
                                    </View>
                                );
                            } else {

                                return (
                                    <View
                                        style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%' }}
                                        key={i}
                                    >
                                        <Image
                                            source={{ uri: kaChatProfile?.avatarUrl }}
                                            width={32}
                                            height={32}
                                            style={{ borderRadius: 50 }}
                                        ></Image>
                                        <View>
                                            <Pressable style={({ pressed }) => ({
                                                borderBottomLeftRadius: 5, 
                                                padding: 16, 
                                                borderRadius: 16, 
                                                backgroundColor: pressed ? 'rgba(0,0,0,0.1)' : COLORS.primaryTint,
                                                transform: [{ scale: pressed ? 0.9 : 1 }]
                                            })}>
                                                <Text style={{ color: COLORS.textPrimary }}>{mes.text_message}</Text>
                                            </Pressable>
                                            <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12 }}>{mes.sentAt}</Text>
                                        </View>
                                    </View>
                                );
                            }
                        })}
                    </ScrollView>
                    <View style={{ gap: 8, flexDirection: 'row', padding: 16, alignItems: "center", justifyContent: 'space-between', borderTopColor: COLORS.divider, borderTopWidth: 1 }}>
                        <Plus color={COLORS.textSecondary}></Plus>
                        <View style={{ flex: 1, position: 'relative', flexDirection: "row", alignItems: 'center', gap: 8, backgroundColor: COLORS.inputs, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}>
                            <TextInput 
                                key={"messaging-input"}
                                placeholderTextColor={COLORS.textMuted} 
                                style={{ color: COLORS.textPrimary, width: '100%' }} 
                                placeholder="write some message"
                                onChangeText={setTextMessage}
                                value={textMessage}
                            ></TextInput>
                            {/* <View style={{ flexDirection: 'row', position: 'absolute', right: 8 }}>
                                <Smile color={COLORS.textMuted}></Smile>
                                <Mic color={COLORS.textMuted}></Mic>
                            </View> */}
                        </View>
                        <Pressable 
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? COLORS.primaryTint : COLORS.primary,
                                padding: 8,
                                borderRadius: 50,
                            })}
                            onPress={sendMessage}
                        >
                            <SendHorizontalIcon color={COLORS.textPrimary}></SendHorizontalIcon>
                        </Pressable>
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            padding: 16,
                            backgroundColor: COLORS.phoneBody,
                            zIndex: 10,
                            width: '100%',
                            transform: optionsOpen ? [{ translateY: 0 }] : [{ translateY: '100%' }],
                            pointerEvents: optionsOpen ? 'auto' : 'none'
                        }}
                    >
                        {optionsWhenLongPressTheMessage.map(options => 
                                <View 
                                    style={{ 
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        gap: 8,
                                        paddingHorizontal: 16,
                                        paddingVertical: 8
                                    }}
                                    key={options.id}
                                >
                                    {options.icon}
                                    <View>
                                        <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 16 }}>{options.label}</Text>
                                        <Text style={{ color: COLORS.textSecondary }}>{options.metadata}</Text>
                                    </View>
                                </View>
                        )}
                    </View>
                    <Pressable onPress={() => SetOptionsOpen(false)} style={{ width: '100%', height: '100%', backgroundColor: '#000000', opacity: optionsOpen ? 0.5 : 0, position: 'absolute', pointerEvents: optionsOpen ? 'auto' : 'none' }}>

                    </Pressable>
                </Animated.View>
        </SafeAreaView>
    );
}