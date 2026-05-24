import { COLORS } from "@/constants/themeMyVersion";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreVertical, Pencil } from 'lucide-react-native';
import { useEffect } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Messages() {

    type RootStackParamList = {
        Messages: undefined;
        Chat: { item: { profilePic: string; name: string; lastMessage: string; timestamp: string } };
    };

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        console.log('messages mounted');
        return () => console.log('messages unmounted');
    }, []);

    const messageList: { profilePic: string; name: string; lastMessage: string; timestamp: string }[] = [
        { profilePic: 'https://picsum.photos/200/300?random=1', name: 'johny', lastMessage: 'hey daddy', timestamp: 'now' },
        { profilePic: 'https://picsum.photos/200/300?random=2', name: 'patty', lastMessage: 'hey mommy', timestamp: 'yesterday' },
        { profilePic: 'https://picsum.photos/200/300?random=3', name: 'lappy', lastMessage: 'whats up my dog', timestamp: 'late' },
        { profilePic: 'https://picsum.photos/200/300?random=4', name: 'rasma', lastMessage: 'you said what?', timestamp: '12:00am' },
        { profilePic: 'https://picsum.photos/200/300?random=5', name: 'jonas', lastMessage: 'daddys home', timestamp: 'not found' },
        { profilePic: 'https://picsum.photos/200/300?random=6', name: 'jonasam', lastMessage: 'His name is Jesus', timestamp: 'bad request' },
        { profilePic: 'https://picsum.photos/200/300?random=7', name: 'jonasSm', lastMessage: 'light of the world', timestamp: 'good request' },
        { profilePic: 'https://picsum.photos/200/300?random=8', name: 'jonasSa', lastMessage: 'theres freedom in His name', timestamp: 'internal server error' },
    ];

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: COLORS.background }}>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 32, fontWeight: 700 }}>Messages</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pencil width={22} color={COLORS.textSecondary}></Pencil>
                        <MoreVertical width={22} color={COLORS.textSecondary}></MoreVertical>
                    </View>
                </View>
                <TextInput style={{ backgroundColor: "#FFFFFF0F", paddingHorizontal: 16, borderRadius: 16, marginTop: 16 }} placeholder="search some" placeholderTextColor={COLORS.textMuted}></TextInput>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                    <Pressable style={{}}><Text style={{ color: COLORS.textMuted }}>All</Text></Pressable>
                    <Pressable style={{}}><Text style={{ color: COLORS.textMuted }}>Unread</Text></Pressable>
                    <Pressable style={{}}><Text style={{ color: COLORS.textMuted }}>Sheets</Text></Pressable>
                </View>
                <View style={{ marginTop: 8 }}>
                    {messageList.map(message =>
                        <Pressable
                            key={message.name}
                            style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                            onPress={() => navigation.navigate("Chat", { item: message })}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Image style={{ borderRadius: 50, width: 50, height: 50 }} source={{ uri: message.profilePic }} />
                                <View>
                                    <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 600, }}>{message.name}</Text>
                                    <Text style={{ color: COLORS.textMuted }}>{message.lastMessage}</Text>
                                </View>
                            </View>
                            <Text numberOfLines={1} style={{ color: COLORS.textMuted, textAlign: 'right', width: 56 }}>{message.timestamp}</Text>
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}