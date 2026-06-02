import { supabase } from "@/lib/supabase";
import { createContext, useRef, useState } from "react";
import { useUser } from "./UserContext";

interface MessagesMap {
    messageId: string;
    sender_id: string;
    sentAt: string;
    text_message: string;
    me: boolean;
}

interface RealtimeContextType {
    getMessages: (conversationId: string) => MessagesMap[];
    subscribeToConversation: (conversationId: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export default function RealtimeProvider ({ children }: { children: React.ReactNode }) {

    const [messagesMap, setMessagesMap] = useState<Record<string, MessagesMap[]>>({});
    const messagesRef = useRef(messagesMap);

    const user = useUser();
    const myId = user.user?.id;
    
    const subscribeToConversation = (conversationId: string) => {
        const channel = supabase
            .channel(`chat${conversationId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        let me = false;
                        if (payload.new.sender_id === myId) {
                            me = true;
                        }
                        const newMsg: MessagesMap = {
                            messageId: payload.new.id,
                            sender_id: payload.new.sender_id,
                            sentAt: payload.new.created_at,
                            text_message: payload.new.text_message,
                            me: me
                        };
                        setMessagesMap(prev => ({
                            ...prev,
                            [conversationId]: [...(prev[conversationId] ?? []), newMsg]
                        }));
                    } else if (payload.eventType === "UPDATE") {
                        // const messageId = payload.new.id;
                        // const newTextMessage = payload.new.text_message;
                        // const newMessages = messagesRef.current?.map(mess => {
                        //     if (mess.messageId === messageId) {
                        //         return {
                        //             ...mess,
                        //             text_message: newTextMessage
                        //         }
                        //     } else {
                        //         return mess;
                        //     }
                        // }) ?? [];
                        // setMessagesMap(newMessages);
                    }
                }
            ).subscribe();

        return () => { supabase.removeChannel(channel); };
    }

    const getNewMessages = (conversationId: string) => {
        return messagesMap[conversationId] ?? [];
    };
    

    // return (

    // );
}