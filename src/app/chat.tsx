import { COLORS } from "@/constants/themeMyVersion";
import { supabase } from "@/lib/supabase";
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MoreVertical, Phone, Plus, SendHorizontalIcon, Video } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Keyboard, KeyboardEvent, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export async function getDirectConversationId(myId: string, otherSideId: string) {
    const { data, error } = await supabase
        .from('direct_conversation')
        .select('id')
        .or(`and(participant_1.eq.${myId.trim()},participant_2.eq.${otherSideId.trim()}),and(participant_1.eq.${otherSideId.trim()},participant_2.eq.${myId.trim()})`);

    return data;

}

export default function Chat() {

    const keyboardHeight = new Animated.Value(0);

    // KEYBOARD ANIMATION
    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
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
    const { myId, otherSideId } = route.params as { myId: string; otherSideId: string; };


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

    const ScrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const getMessagesIfExist = async () => {

            const data = await getDirectConversationId(myId, otherSideId);

            setConversationId(data?.[0].id || null);

        };

        getMessagesIfExist();
        
    }, []);

    const getMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        
        setMessages((data?.map(mes => {

            let me = false;

            if(mes.sender_id === myId) {
                me = true;
            }

            return {
                messageId: mes.id,
                sender_id: mes.sender_id,
                sentAt: mes.created_at,
                text_message: mes.text_message,
                me: me
            } 

        })) ?? []);

    }

    const getKaChatInfo = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherSideId);

        setKaChatProfile({
            name: data?.[0].full_name,
            avatarUrl: data?.[0].avatar_url
        });
    }

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
                    sentAt: payload.new.created_at,
                    text_message: payload.new.text_message,
                    me: me
                }]);
            }
        ).subscribe();

        getMessages();
        getKaChatInfo();

        return () => { supabase.removeChannel(channel) };

    }, [conversationId]);

    const sendMessage = async () => {
        if(!conversationId) {
            createConversation();
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

    const createConversation = async () => {
        const { data, error } = await supabase.rpc('create_direct_conversation', {
            p_participant_1: myId,
            p_participant_2: otherSideId,
        });
    };

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
                            ScrollViewRef.current?.scrollToEnd({ animated: true })
                        }
                        contentContainerStyle={{ paddingHorizontal: 22, }}
                    >
                    {conversationId 
                        ? messages.map(mes => {
                            if (mes.me) {
                                return (
                                    <View
                                        style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%', alignSelf: 'flex-end' }}
                                        key={mes.sentAt}
                                    >
                                        <View>
                                            <Text style={{ borderBottomRightRadius: 5, padding: 16, borderRadius: 16, backgroundColor: COLORS.primary, color: COLORS.textPrimary }}>{mes.text_message}</Text>
                                            <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12, textAlign: 'right' }}>{mes.sentAt}</Text>
                                        </View>
                                    </View>
                                );
                            } else {
                                return (
                                    <View
                                        style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%' }}
                                        key={mes.sentAt}
                                    >
                                        <Image
                                            source={{ uri: 'https://picsum.photos/200/300?random=2' }}
                                            width={32}
                                            height={32}
                                            style={{ borderRadius: 50 }}
                                        ></Image>
                                        <View>
                                            <Text style={{ borderBottomLeftRadius: 5, padding: 16, borderRadius: 16, backgroundColor: COLORS.primaryTint, color: COLORS.textPrimary }}>{mes.text_message}</Text>
                                            <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12 }}>{mes.sentAt}</Text>
                                        </View>
                                    </View>
                                );
                            }
                        }) 
                        : <View style={{ margin: 'auto', alignItems: 'center', paddingTop: '40%'  }}>
                            <Image 
                                width={100} 
                                height={100}
                                style={{ borderRadius: 50, margin: 8 }}
                                source={{ uri: 'https://picsum.photos/200/300?random=2000'}}
                            >

                            </Image>
                            <Text style={{ textAlign: 'center', color: COLORS.textPrimary, fontSize: 22, marginBottom: 4, fontWeight: 700 }}>Jonas Sam Inasal</Text>
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
                        </View>}
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
                            style={{ 
                                backgroundColor: COLORS.primary, 
                                padding: 8, 
                                borderRadius: 50,
                            }}
                            onPress={sendMessage}
                        >
                            <SendHorizontalIcon color={COLORS.textPrimary}></SendHorizontalIcon>
                        </Pressable>
                    </View>
                </Animated.View>
        </SafeAreaView>
    );
}