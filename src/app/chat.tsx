import { COLORS } from "@/constants/themeMyVersion";
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Mic, MoreVertical, Phone, Plus, SendHorizontalIcon, Smile, Video } from "lucide-react-native";
import { useEffect } from "react";
import { Animated, Image, Keyboard, KeyboardEvent, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {

    const keyboardHeight = new Animated.Value(0);

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
    const item = (route.params as any)?.item || { profilePic: 'https://picsum.photos/200/300?random=2', name: 'unknown' };

    useEffect(() => {
        console.log('chat mounted');
        return () => console.log('chat unmounted');
    }, []);

    const messages = [
        { message: "heeehhe", sender: "johny", time: '9:20am', me: false },
        { message: "God will a way when there seems to be no way", sender: "johny", time: '10:20am', me: true },
        { message: "He loves in ways we cannot see He will make a way for", sender: "hey", time: '11:20am', me: false },
        { message: "He will be my guide hold closely to His side", sender: "johny", time: '12:20am', me: true },
        { message: "He will be my guide hold  to His side", sender: "hey", time: '3:20am', me: true },
        { message: "He will be my guide  closely to His side", sender: "johny", time: '4:20am', me: false },
        { message: "He will be my  hold closely to His side", sender: "hey", time: '8:20am', me: true },
    ];

    return (
        <SafeAreaView style={{ backgroundColor: COLORS.background, flex: 1 }}>
                <Animated.View
                    style={{ flex: 1, paddingBottom: keyboardHeight }}
                >
                    <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.divider }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Pressable onPress={() => navigation.goBack()}><ArrowLeft color={COLORS.primary}></ArrowLeft></Pressable>
                            <Image
                                source={{ uri: item.profilePic }}
                                height={50}
                                width={50}
                                style={{ borderRadius: 50, borderColor: COLORS.tabBorder, borderWidth: 1 }}
                            />
                            <View>
                                <Text style={{ lineHeight: 20, fontWeight: 700, color: COLORS.textPrimary, fontSize: 22 }}>Jonas lee</Text>
                                <Text style={{ color: COLORS.online, fontSize: 12 }}>Active now</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable><Phone color={COLORS.textSecondary}></Phone></Pressable>
                            <Pressable><Video color={COLORS.textSecondary}></Video></Pressable>
                            <Pressable><MoreVertical color={COLORS.textSecondary}></MoreVertical></Pressable>
                        </View>
                    </View>
                    <ScrollView
                        contentContainerStyle={{ paddingHorizontal: 22, }}
                    >
                        <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginVertical: 16, }}>Today</Text>
                        {messages.map(mes => {
                            if (mes.me) {
                                return (
                                    <View
                                        style={{ marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%', alignSelf: 'flex-end' }}
                                        key={mes.message}
                                    >
                                        <View>
                                            <Text style={{ borderBottomRightRadius: 5, padding: 16, borderRadius: 16, backgroundColor: COLORS.primary, color: COLORS.textPrimary }}>{mes.message}</Text>
                                            <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12, textAlign: 'right' }}>{mes.time}</Text>
                                        </View>
                                    </View>
                                );
                            } else {
                                return (
                                    <View
                                        style={{ marginBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%' }}
                                        key={mes.message}
                                    >
                                        <Image
                                            source={{ uri: 'https://picsum.photos/200/300?random=2' }}
                                            width={32}
                                            height={32}
                                            style={{ borderRadius: 50 }}
                                        ></Image>
                                        <View>
                                            <Text style={{ borderBottomLeftRadius: 5, padding: 16, borderRadius: 16, backgroundColor: COLORS.primaryTint, color: COLORS.textPrimary }}>{mes.message}</Text>
                                            <Text style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: 12 }}>{mes.time}</Text>
                                        </View>
                                    </View>
                                );
                            }
                        })}
                    </ScrollView>
                    <View style={{ flexDirection: 'row', padding: 16, alignItems: "center", justifyContent: 'space-between', borderTopColor: COLORS.divider, borderTopWidth: 1 }}>
                        <Plus color={COLORS.textSecondary}></Plus>
                        <View style={{ flexDirection: "row", alignItems: 'center', gap: 8, backgroundColor: COLORS.inputs, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}>
                            <TextInput placeholderTextColor={COLORS.textMuted} style={{}} placeholder="write some message"></TextInput>
                            <Smile color={COLORS.textMuted}></Smile>
                            <Mic color={COLORS.textMuted}></Mic>
                        </View>
                        <Pressable style={{ backgroundColor: COLORS.primary, padding: 8, borderRadius: 50 }}>
                            <SendHorizontalIcon color={COLORS.textPrimary}></SendHorizontalIcon>
                        </Pressable>
                    </View>
                </Animated.View>
        </SafeAreaView>
    );
}