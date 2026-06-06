import { COLORS } from "@/constants/themeMyVersion";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoPlayer, VideoView } from 'expo-video';
import {
    ArrowLeft,
    CheckCircleIcon,
    Copy,
    Edit,
    Forward,
    ImageIcon,
    Mic,
    MoreVertical,
    Phone,
    PlayCircle,
    SendHorizontalIcon,
    Smile,
    Trash2,
    VideoIcon,
    X
} from "lucide-react-native";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, DimensionValue, Image, Keyboard, KeyboardEvent, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadMedia } from '../../App.js';
import { formatMessageTime } from "./helper.tsx/formatDate";

function VideoMessage({ player, width, height, isActive, onPress, onLongPress }: 
    Readonly<{ 
        isActive: boolean, 
        player: VideoPlayer, 
        width: DimensionValue, 
        height: DimensionValue,
        onPress: () => void,
        onLongPress: () => void
    }>) {

    const touchTimer = useRef<any>(null);

    if(!isActive) {
        return (
            <Pressable
                onPress={onPress}
                style={{ 
                    width: width, 
                    height: height, 
                    borderRadius: 16, 
                    backgroundColor: COLORS.primaryTint, 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}
            >
                <PlayCircle color={COLORS.primary} size={40} />
            </Pressable>
        );
    }

    return (
        <VideoView
            style={{ 
                width: width,
                height: height,
                borderRadius: 16,
                backgroundColor: COLORS.primaryTint,
            }}
            onTouchStart={() => {
                touchTimer.current = setTimeout(() => {
                    onLongPress();
                }, 500);
            }}
            onTouchEnd={() => {
                clearTimeout(touchTimer.current);
            }}
            player={player}
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
            nativeControls={true}
        />
    );
};

export default function Chat() {

    const user = useUser();

    const myId = user.user?.id;

    const keyboardHeight = useRef(new Animated.Value(0)).current;
    const optionAnimation = useRef(new Animated.Value(400)).current;

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

    console.log("LOOPING?");

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsMultipleSelection: true,
            quality: 1,
            selectionLimit: 20
        });
        
        if(!result.canceled) {
            uploadMedia(result, conversationId, myId);
        }

    }

    const navigation = useNavigation();
    const route = useRoute();
    const { conversationIdFromMessages } = route.params as { conversationIdFromMessages: string; };

    interface Message {
        sentAt: string;
        messageId: string,
        sender_id: string,
        text_message: string,
        me: boolean,
        type: string,
        media: MessageMedia[] | null
    };

    interface MessageMedia {
        url: string,
        type: string,
        message_id: string,
        id: string
    }

    interface KaChat {
        avatarUrl: string,
        name: string
    }

    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [textMessage, setTextMessage] = useState("");
    const [kaChatProfile, setKaChatProfile] = useState<KaChat | null>(null);
    const [optionsOpen, SetOptionsOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string>('');
    const [longPressedMessageId, setLongPressedMessageId] = useState<any>(null);
    const [editMessageMode, setEditMessageMode] = useState(false);
    const [messageToEdit, setMessageToEdit] = useState<Message | null>();
    const [activeVideoUrl, setActiveVideoUrl] = useState<string>('');


    const player = useVideoPlayer(activeVideoUrl, player => {
        player.loop = false;
        player.play();
    });

    const input = useRef<TextInput>(null);

    const messagesRef = useRef<Message[]>([]);

    const ScrollViewRef = useRef<ScrollView>(null);

    // SEEN THE MESSAGES
    useEffect(() => {
        if(!conversationId) return;

        const getConversation = async () => {
            const { data, error } = await supabase  
                .from('conversations')
                .select('*')
                .eq('id', conversationId);

            return data?.[0].is_group;
        }

        const getUnreadOnes = async () => {

            const isGroup = await getConversation();

            if(!isGroup) {
                const { data, error } = await supabase.rpc('get_unread_messages', {
                    p_conversation_id: conversationId
                });

                const messageIdsAndMyId = data.map((d: any) => ({
                    message_id: d.message_id,
                    profile_id: myId
                }));

                readMessage(messageIdsAndMyId);
            } else {
                const { data, error } = await supabase.rpc('get_unread_messages_group_chat_version', {
                    p_conversation_id: conversationId
                });

                const messageIdsAndMyId = data.map((d: any) => ({
                    message_id: d.message_id,
                    profile_id: myId
                }));

                readMessage(messageIdsAndMyId);
            }

        }

        getUnreadOnes();

    }, [conversationId]);

    const readMessage = async (messageIdsAndMyId: any) => {
        if(!messageIdsAndMyId) return;
        const { data, error } = await supabase
            .from('messages_read')
            .insert(messageIdsAndMyId);
    };  

    useEffect(() => {
        Animated.timing(optionAnimation, {
            toValue: optionsOpen ? 0 : 400,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, [optionsOpen]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);


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
            .select('*, message_media(*)')
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
                me: me,
                type: mes.message_type,
                media: mes.message_media
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

            console.log(data);
            console.log(error);

            setKaChatProfile({
                name: data?.[0].full_name,
                avatarUrl: data?.[0].avatar_url
            });
        }
    }

    // REAL TIME CHECK
    useEffect(() => {
        if(!conversationId) return;

        const channel = supabase
            .channel(`chat${conversationId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            },
            async (payload) => {
                if(payload.eventType === "INSERT") {
                    let me = false;
                    if (payload.new.sender_id === myId) {
                        me = true;
                    }
                    console.log("text message?");
                    console.log(payload.new.text_message);
                    if(!payload.new.text_message) return;

                    setMessages(prev => [...prev, {
                        messageId: payload.new.id,
                        sender_id: payload.new.sender_id,
                        sentAt: formatMessageTime(payload.new.created_at),
                        text_message: payload.new.text_message,
                        me: me,
                        type: payload.new.type,
                        media: null
                    }]);
                } else if(payload.eventType === "UPDATE") {
                    const messageId = payload.new.id;
                    const newTextMessage = payload.new.text_message;

                    const newMessages = messagesRef.current.map(mess => {
                        if (mess.messageId === messageId) {
                            return {
                                ...mess,
                                text_message: newTextMessage
                            }
                        } else {
                            return mess;
                        }
                    }) ?? [];

                    setMessages(newMessages);

                }
            }
            )
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'message_media'
            },
             async (payload) => {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*, message_media(*)')
                    .eq('id', payload.new.message_id)
                    .single();

                let me: boolean;

                if(data.sender_id === myId) {
                    me = true;
                } else {
                    me = false;
                }

                 setMessages(prev => { 
                    const alreadyExist = prev.find(pre => pre.messageId === data.id);

                    if(alreadyExist) return prev;

                    return [...prev, {
                     messageId: data.id,
                     sender_id: data.sender_id,
                     sentAt: formatMessageTime(data.created_at),
                     text_message: data.text_message,
                     me: me,
                     type: data.message_type,
                     media: data.message_media
                 }]
                });

            })
        .subscribe();

        getMessages();

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

        console.log("HERE");
        console.log(error);
        
        setTextMessage("");
        Keyboard.dismiss();
    };

    const deleteMessage = async () => {
        const { data, error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageToDelete);

        if(!error) {
            const newMessageStateWhereDeletedMessageIsGone = messages.filter(mess => mess.messageId !== messageToDelete);

            setMessages(newMessageStateWhereDeletedMessageIsGone);
            setMessageToDelete('');
            setLongPressedMessageId(null);
        }
    };

    const setToEditMessageMode = () => {
        console.log("INPUT");

        console.log(messageToEdit);
        const mess = messageToEdit?.text_message;
        SetOptionsOpen(false);

        if(!mess) return;
    
        setEditMessageMode(true);

        input.current?.blur();
        setTimeout(() => {
            input.current?.focus();
        }, 100);

    };

    const setNewMessageEditingMode = (text: string) => {
        setMessageToEdit(prev => ({...prev!, text_message: text}));
    };

    const setEditModeToFalse = () => {
        setEditMessageMode(false);
        setMessageToEdit(null);
    };

    const editMessage = async () => {

        const mess = messageToEdit;

        const { data, error } = await supabase
            .from('messages')
            .update({ text_message: mess?.text_message })
            .eq('id', mess?.messageId);

        console.log(data);
        console.error(error);

        if(!error) {
            setEditModeToFalse();
        }
        
    };

    interface OptionsWhenLongPressTheMessage {
        id: string;
        icon: ReactNode;
        label: string;
        metadata: string;
    };

    const optionsWhenLongPressTheMessage: OptionsWhenLongPressTheMessage[] = [
        { id: '1', icon: <View style={{ padding: 16, backgroundColor: COLORS.lightBlueLower, borderRadius: 16 }} ><Copy color={COLORS.lightBlue}></Copy></View>, label: 'Copy', metadata: 'Copy text to clipboard' },
        { id: '2', icon: <View style={{ padding: 16, backgroundColor: COLORS.natanLower, borderRadius: 16 }} ><Forward color={COLORS.nathan}></Forward></View>, label: 'Forward', metadata: 'Send to another chat' },
        { id: 'edit', icon: <View style={{ padding: 16, backgroundColor: COLORS.primaryTint, borderRadius: 16 }} ><Edit color={COLORS.primary}></Edit></View>, label: 'Edit', metadata: 'Modify sent messsage' },
        { id: 'delete', icon: <View style={{ padding: 16, backgroundColor: COLORS.missedCallLower, borderRadius: 16 }} ><Trash2 color={COLORS.delete}></Trash2></View>, label: 'Delete', metadata: 'Healing for everyone' },
        
    ];

    const messageIdTemporaryStorageReadyForOperations = (message: Message) => {
        SetOptionsOpen(true);
        setLongPressedMessageId(message.messageId);
        setMessageToEdit(message);
    }

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
                            <Pressable><VideoIcon color={COLORS.textSecondary}></VideoIcon></Pressable>
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
                    {messages.map((mes) => {
                            if (mes.me) {
                                if(mes.type === 'media' && mes.media) {
                                    if (mes.media.length === 1) {
                                        if(mes.media?.[0].type === 'image') {
                                            return <View style={{ width: '100%' }}
                                                key={mes.messageId}
                                            >
                                                <View style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <Pressable style={{ width: '70%' }}>
                                                        <Image onLoad={() => ScrollViewRef.current?.scrollToEnd({ animated: false })} style={{ width: '100%', borderRadius: 16, marginBlock: 8 }} height={300} source={{ uri: mes.media?.[0].url }}></Image>
                                                    </Pressable>
                                                    <Text style={{ color: COLORS.textPrimary, fontSize: 12, marginBottom: 8 }}>{mes.sentAt}</Text>
                                                </View>
                                            </View>
                                        } else if(mes.media?.[0].type === 'video') {
                                            return <View style={{ width: '100%' }}
                                                key={mes.messageId}
                                            >
                                                <View style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <View style={{ width: '70%' }}>
                                                        <VideoMessage 
                                                            width={'100%'} 
                                                            height={300} 
                                                            player={player}
                                                            isActive={mes.media?.[0].url === activeVideoUrl} 
                                                            onPress={() => setActiveVideoUrl(mes.media?.[0].url!)}
                                                            onLongPress={() => messageIdTemporaryStorageReadyForOperations(mes)}
                                                        />
                                                    </View>
                                                    <Text style={{ color: COLORS.textPrimary, fontSize: 12, marginBottom: 8 }}>{mes.sentAt}</Text>
                                                </View>
                                            </View>
                                        } 
                                    } else if (mes.media.length === 2) {
                                        return <View style={{ width: '100%' }}
                                            key={mes.messageId}
                                        >
                                            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <View style={{ width: '70%', flexDirection: 'row', gap: 4 }}>
                                                    {mes.media.map(m => {
                                                        return m.type === "image" 
                                                            ? <Image style={{ width: '50%', borderRadius: 16, marginBlock: 8 }} height={120} source={{ uri: m.url }}></Image>
                                                            : 
                                                            <VideoMessage 
                                                                player={player} 
                                                                width={'50%'} 
                                                                height={120} 
                                                                isActive={mes.media?.[0].url === activeVideoUrl}
                                                                onPress={() => setActiveVideoUrl(mes.media?.[0].url!)}
                                                                onLongPress={() => messageIdTemporaryStorageReadyForOperations(mes)}
                                                            />
                                                    })}
                                                </View>
                                                <Text style={{ color: COLORS.textPrimary, fontSize: 12, marginBottom: 8 }}>{mes.sentAt}</Text>
                                            </View>
                                        </View>   
                                    } else if(mes.media.length === 3) {
                                        return <View style={{ width: '100%' }}
                                            key={mes.messageId}
                                        >
                                            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <View style={{ width: '90%', flexDirection: 'row', gap: 4 }}>
                                                    {mes.media.map(m => {
                                                        return m.type === "image"
                                                            ? <Image style={{ width: '33%', borderRadius: 16, marginBlock: 8 }} height={92} source={{ uri: m.url }}></Image>
                                                            : 
                                                            <VideoMessage 
                                                                player={player} 
                                                                width={'33%'} 
                                                                height={92} 
                                                                isActive={mes.media?.[0].url === activeVideoUrl}
                                                                onPress={() => setActiveVideoUrl(mes.media?.[0].url!)}
                                                                onLongPress={() => messageIdTemporaryStorageReadyForOperations(mes)}
                                                            />
                                                    })}
                                                </View>
                                                <Text style={{ color: COLORS.textPrimary, fontSize: 12, marginBottom: 8 }}>{mes.sentAt}</Text>
                                            </View>
                                        </View>   
                                    } else if(mes.media.length === 4) {
                                        return <View style={{ width: '100%' }}
                                            key={mes.messageId}
                                        >
                                            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <View style={{ width: '70%', flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
                                                    {mes.media.map(m => {
                                                        return m.type === "image"
                                                            ? <Image style={{ width: '49%', borderRadius: 16 }} height={92} source={{ uri: m.url }}></Image>
                                                            : 
                                                            <VideoMessage 
                                                                player={player} 
                                                                width={'49%'} 
                                                                height={92} 
                                                                isActive={mes.media?.[0].url === activeVideoUrl}
                                                                onPress={() => setActiveVideoUrl(mes.media?.[0].url!)}
                                                                onLongPress={() => messageIdTemporaryStorageReadyForOperations(mes)}
                                                            />
                                                    })}
                                                </View>
                                                <Text style={{ color: COLORS.textPrimary, fontSize: 12, marginBottom: 8 }}>{mes.sentAt}</Text>
                                            </View>
                                        </View>   
                                    }
                                }
                                return (
                                    <View
                                        style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%', alignSelf: 'flex-end' }}
                                        key={mes.messageId}
                                    >
                                        <View>
                                            <Pressable 
                                                onLongPress={() => messageIdTemporaryStorageReadyForOperations(mes)}
                                                delayLongPress={200}
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
                                if(mes.type === 'media' && mes.media) {
                                    if (mes.media.length === 1) {
                                        if(mes.media?.[0].type === 'image') {
                                            return <View
                                                style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '70%' }}
                                                key={mes.messageId}
                                            >
                                                <Image
                                                    source={{ uri: kaChatProfile?.avatarUrl }}
                                                    width={32}
                                                    height={32}
                                                    style={{ borderRadius: 50 }}
                                                ></Image>
                                                <View style={{ width: '100%' }}>
                                                    <Pressable style={({ pressed }) => ({
                                                        borderRadius: 16,
                                                        width: '100%'
                                                    })}>
                                                    <Image style={{ width: '100%', borderRadius: 16, marginBlock: 8 }} height={300} source={{ uri: mes.media?.[0].url }}></Image>
                                                    </Pressable>
                                                    <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12 }}>{mes.sentAt}</Text>
                                                </View>
                                            </View>
                                        } else if(mes.media?.[0].type === 'video') {
                                            return <View
                                                style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '70%' }}
                                                key={mes.messageId}
                                            >
                                                <Image
                                                    source={{ uri: kaChatProfile?.avatarUrl }}
                                                    width={32}
                                                    height={32}
                                                    style={{ borderRadius: 50 }}
                                                ></Image>
                                                <View style={{ width: '100%' }}>
                                                    <Pressable style={({ pressed }) => ({
                                                        borderBottomLeftRadius: 5,
                                                        padding: 16,
                                                        borderRadius: 16,
                                                        backgroundColor: pressed ? 'rgba(0,0,0,0.1)' : COLORS.primaryTint,
                                                        transform: [{ scale: pressed ? 0.9 : 1 }],
                                                        width: '100%'
                                                    })}>
                                                        <Text style={{ color: COLORS.textPrimary }}>{mes.text_message}</Text>
                                                    </Pressable>
                                                    <VideoMessage 
                                                        player={player} 
                                                        width={'100%'} 
                                                        height={300} 
                                                        isActive={mes.media?.[0].url === activeVideoUrl}
                                                        onPress={() => setActiveVideoUrl(mes.media?.[0].url!)}
                                                        onLongPress={() => null}
                                                    />
                                                </View>
                                            </View>
                                        } 
                                    } else if (mes.media.length === 2) {
                                        return <View
                                            style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '70%' }}
                                            key={mes.messageId}
                                        >
                                            <Image
                                                source={{ uri: kaChatProfile?.avatarUrl }}
                                                width={32}
                                                height={32}
                                                style={{ borderRadius: 50 }}
                                            ></Image>
                                            <View style={{ width: '100%' }}>
                                                <View style={{
                                                    borderBottomLeftRadius: 5,
                                                    borderRadius: 16,
                                                    gap: 4,
                                                    width: '100%',
                                                    flexDirection: 'row'
                                                }}>
                                                    {mes.media.map(m => {
                                                        return m.type === "image"
                                                            ? <Image style={{ width: '50%', borderRadius: 16, marginBlock: 8 }} height={120} source={{ uri: m.url }}></Image>
                                                            :
                                                            <VideoMessage 
                                                                player={player} 
                                                                width={'50%'} 
                                                                height={120} 
                                                                isActive={mes.media?.[0].url === activeVideoUrl}
                                                                onPress={() => setActiveVideoUrl(mes.media?.[0].url!)}
                                                                onLongPress={() => null}
                                                            />
                                                    })}
                                                </View>
                                                <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12 }}>{mes.sentAt}</Text>
                                            </View>
                                        </View>
                                    } else if(mes.media.length === 3) {
                                        return <View
                                            style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-start', maxWidth: '80%' }}
                                            key={mes.messageId}
                                        >
                                            <Image
                                                source={{ uri: kaChatProfile?.avatarUrl }}
                                                width={32}
                                                height={32}
                                                style={{ borderRadius: 50 }}
                                            ></Image>
                                            <View>
                                                <View style={{ width: '100%', flexDirection: 'row', gap: 4 }}> 
                                                    {mes.media.map(m => {
                                                        return m.type === "image"
                                                            ? <Image style={{ width: '33%', borderRadius: 16, marginBlock: 8 }} height={92} source={{ uri: m.url }}></Image>
                                                            : 
                                                            <VideoMessage 
                                                                player={player} 
                                                                width={'33%'} 
                                                                height={92} 
                                                                isActive={mes.media?.[0].url === activeVideoUrl}
                                                                onPress={() => setActiveVideoUrl(mes.media?.[0].url!)}
                                                                onLongPress={() => null}
                                                            />
                                                    })}
                                                </View>
                                                <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12 }}>{mes.sentAt}</Text>
                                            </View>
                                        </View>
                                    } else if(mes.media.length === 4) {
                                        return <View
                                            style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%' }}
                                            key={mes.messageId}
                                        >
                                            <Image
                                                source={{ uri: kaChatProfile?.avatarUrl }}
                                                width={32}
                                                height={32}
                                                style={{ borderRadius: 50 }}
                                            ></Image>
                                            <View style={{ width: '100%' }}>
                                                <View style={{
                                                    width: '100%',
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap',
                                                    gap: 4
                                                }}>
                                                    {mes.media.map(m => {
                                                        return m.type === "image"
                                                            ? <Image style={{ width: '49%', borderRadius: 16 }} height={92} source={{ uri: m.url }}></Image>
                                                            : 
                                                            <VideoMessage 
                                                                player={player} 
                                                                width={'49%'} 
                                                                height={92} 
                                                                isActive={mes.media?.[0].url === activeVideoUrl}
                                                                onPress={() => setActiveVideoUrl(mes.media?.[0].url!)}
                                                                onLongPress={() => null}
                                                            />
                                                    })}
                                                </View>
                                                <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12 }}>{mes.sentAt}</Text>
                                            </View>
                                        </View>
                                    }
                                }

                                return (
                                    <View
                                        style={{ marginTop: 8, marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%' }}
                                        key={mes.messageId}
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
                    <View>
                        {editMessageMode && <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text
                                style={{ color: COLORS.textPrimary, fontWeight: 700 }}
                            >
                                Edit message
                            </Text>
                            <Pressable
                                onPress={setEditModeToFalse}
                                style={{
                                    backgroundColor: COLORS.inputs,
                                    borderRadius: 50,
                                    padding: 8
                                }}
                            >
                                <X color={COLORS.textPrimary}></X>
                            </Pressable>
                        </View>}
                        <View style={{ gap: 8, flexDirection: 'row', padding: 16, alignItems: "center", justifyContent: 'space-between', borderTopColor: COLORS.divider, borderTopWidth: 1 }}>
                            <Pressable 
                                style={({ pressed }) => ({
                                    padding: 8,
                                    borderRadius: 8,
                                    backgroundColor: pressed ? COLORS.primaryTint  : COLORS.background
                                })}
                                onPress={pickImages}
                            >
                                <ImageIcon color={COLORS.textSecondary}></ImageIcon>
                            </Pressable>
                            <View style={{ flex: 1, position: 'relative', flexDirection: "row", alignItems: 'center', gap: 8, backgroundColor: COLORS.inputs, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}>
                                <TextInput
                                    ref={input}
                                    placeholderTextColor={COLORS.textMuted}
                                    style={{ color: COLORS.textPrimary, width: '100%' }}
                                    placeholder="write some message"
                                    onChangeText={editMessageMode ? setNewMessageEditingMode : setTextMessage}
                                    value={editMessageMode ? messageToEdit?.text_message : textMessage}
                                >
    
                                </TextInput>
                                <View style={{ flexDirection: 'row', position: 'absolute', right: 8 }}>
                                    <Pressable>
                                        <Smile color={COLORS.textMuted}></Smile>
                                    </Pressable>
                                    <Mic color={COLORS.textMuted}></Mic>
                                </View>
                            </View>
                            {editMessageMode === false &&<Pressable
                                style={({ pressed }) => ({
                                    backgroundColor: textMessage === ""
                                        ? "#ccc" // disabled color
                                        : pressed
                                            ? COLORS.primaryTint
                                            : COLORS.primary,
                                    padding: 8,
                                    borderRadius: 50,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                })}
                                onPress={sendMessage}
                                disabled={textMessage === "" ? true : false}
                            >
                                <SendHorizontalIcon color={COLORS.textPrimary}></SendHorizontalIcon>
                            </Pressable>}
                            {editMessageMode === true &&
                                <Pressable
                                    onPress={editMessage}
                                >
                                    <CheckCircleIcon color={messageToEdit?.text_message === "" ? COLORS.textPrimary : COLORS.primary}></CheckCircleIcon>
                                </Pressable>}
                        </View>
                    </View>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            padding: 16,
                            backgroundColor: COLORS.phoneBody,
                            zIndex: 10,
                            width: '100%',
                            transform: [{ translateY: optionAnimation }],
                            pointerEvents: optionsOpen ? 'auto' : 'none'
                        }}
                    >
                        {optionsWhenLongPressTheMessage.map(options => 
                                <Pressable 
                                    style={({ pressed }) => ({
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        gap: 8,
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        backgroundColor: pressed ? COLORS.inputs : COLORS.phoneBody
                                    })}
                                    onPress={() => {
                                        if(options.id === 'delete') {
                                            setMessageToDelete(longPressedMessageId)
                                            SetOptionsOpen(false);
                                        } else if(options.id === 'edit') {
                                            setToEditMessageMode();
                                        }
                                    }}
                                    key={options.id}
                                >
                                    {options.icon}
                                    <View>
                                        <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 16 }}>{options.label}</Text>
                                        <Text style={{ color: COLORS.textSecondary }}>{options.metadata}</Text>
                                    </View>
                                </Pressable>
                        )}
                    </Animated.View>
                    <View style={{ 
                            position: 'absolute', 
                            left: '50%', 
                            top: '50%',
                            backgroundColor: COLORS.phoneBody,
                            transform: [{ translateX: '-50%' }, {translateY: '-50%'}],
                            padding: 22,
                            borderRadius: 16,
                            alignItems: 'center',
                            width: '80%',
                            opacity: messageToDelete === '' ? 0 : 1,
                            pointerEvents: messageToDelete === '' ? 'none' : 'auto'
                        }}
                    >
                        <Text style={{ color: COLORS.textPrimary, fontSize: 22 }}>Delete message?</Text>
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>This will be removed for everyone.</Text>
                        <Pressable 
                            style={({ pressed }) => ({
                                borderRadius: 16,
                                marginBottom: 8,
                                marginTop: 16,
                                backgroundColor: pressed ? COLORS.pressedDelete : COLORS.delete,
                                width: '100%',
                                paddingVertical: 16,
                            })}
                            onPress={deleteMessage}
                        >
                            <Text style={{ 
                                textAlign: 'center', 
                                color: COLORS.textPrimary, 
                                fontWeight: 700 
                                }}
                            >Delete</Text>
                        </Pressable>
                        <Pressable 
                            style={{ 
                                borderRadius: 16, 
                                backgroundColor: COLORS.inputs, 
                                width: '100%', 
                                paddingVertical: 16 
                                }}
                            onPress={() => setMessageToDelete('')}
                        >
                                <Text style={{ 
                                        textAlign: 'center', 
                                        color: COLORS.textPrimary, 
                                        fontWeight: 700 
                                    }}
                                >Cancel
                                </Text>
                            </Pressable>
                    </View>
                    <Pressable onPress={() => SetOptionsOpen(false)} style={{ width: '100%', height: '100%', backgroundColor: '#000000', opacity: optionsOpen ? 0.5 : 0, position: 'absolute', pointerEvents: optionsOpen ? 'auto' : 'none' }}>

                    </Pressable>
                </Animated.View>
        </SafeAreaView>
    );
}