import { COLORS } from "@/constants/themeMyVersion";
import { UserContext } from '@/context/UserContext';
import { BellIcon, ChevronRight, CircleQuestionMark, Lock, LogOut, MessageCircleHeartIcon, MoonIcon, MoreHorizontal, Phone, Video } from 'lucide-react-native';
import { ReactNode, useContext } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logout } from "./auth/logout";

export default function Profile() {

    const { user, loading } = useContext(UserContext);

    const userName = user?.user_metadata.full_name;
    const email = user?.email;
    const profilePic = user?.user_metadata.picture;

    const media = [
        'https://picsum.photos/200/300?random=101',
        'https://picsum.photos/200/300?random=102',
        'https://picsum.photos/200/300?random=103',
        'https://picsum.photos/200/300?random=104',
        'https://picsum.photos/200/300?random=105',
        'https://picsum.photos/200/300?random=106',
        'https://picsum.photos/200/300?random=107',
        'https://picsum.photos/200/300?random=108',
        'https://picsum.photos/200/300?random=109',
        'https://picsum.photos/200/300?random=10',
        'https://picsum.photos/200/300?random=11',
    ];

    interface Setting {
        id: number;
        textMain: string;
        textSecond: string;
        icon: ReactNode;
        iconBGColor: string
    };

    const settings: Setting[] = [
        { id: 1, textMain: 'Privacy & Security', textSecond: 'Two-factor on', icon: <Lock color={COLORS.primary}></Lock>, iconBGColor: COLORS.primaryTint },
        { id: 2, textMain: 'Notification', textSecond: 'All allerts enabled', icon: <BellIcon color={COLORS.nathan}></BellIcon>, iconBGColor: COLORS.natanLower },
        { id: 3, textMain: 'Appearance', textSecond: 'Dark mode', icon: <MoonIcon color={COLORS.family}></MoonIcon>, iconBGColor: COLORS.familyLower },
        { id: 4, textMain: 'Help & Support', textSecond: 'Say hey daddy', icon: <CircleQuestionMark color={COLORS.sofia}></CircleQuestionMark>, iconBGColor: COLORS.sofiaLower },
    ];

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.background, height: '100%' }}>
            <ScrollView>
                <View style={{ position: 'relative', height: 350, marginBottom: 16, justifyContent: 'flex-end', flexDirection: 'column' }}>
                    <Image style={{ width: '100%', height: 175, position: 'absolute', top: 0 }} source={{ uri: 'https://picsum.photos/200/300?random=200' }}></Image>
                    <View style={{ alignItems: 'center', gap: 8, }}>
                        <View style={{ flexDirection: 'column', gap: 8 }}>
                            <Image width={94} height={94} style={{ borderRadius: 50, borderColor: COLORS.background, borderWidth: 3, }} source={{ uri: profilePic }}></Image>
                            <Text style={{ backgroundColor: COLORS.online, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, color: COLORS.textPrimary, fontWeight: 700 }}>Active now</Text>
                        </View>
                        <View>
                            <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 500, textAlign: 'center' }}>{userName}</Text>
                            <Text style={{ marginBottom: 8, textAlign: 'center', color: COLORS.textMuted, fontSize: 12 }}>{email}</Text>
                            <Text style={{ marginTop: 0, color: COLORS.textSecondary, textAlign: 'center', maxWidth: '60%' }}>Designer & dreamer building things that matter Coffe addict</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ paddingHorizontal: 16, alignItems: 'center', paddingVertical: 8, borderBlockColor: COLORS.divider, borderWidth: 1, flex: 1 }}>
                        <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700 }}>34</Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Friends</Text>
                    </View>
                    <View style={{ paddingHorizontal: 16, alignItems: 'center', paddingVertical: 8, borderBlockColor: COLORS.divider, borderLeftWidth: 0, borderRightWidth: 0, borderWidth: 1, flex: 1 }}>
                        <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700 }}>1.2k</Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Messages</Text>
                    </View>
                    <View style={{ paddingHorizontal: 16, alignItems: 'center', paddingVertical: 8, borderBlockColor: COLORS.divider, borderWidth: 1, flex: 1 }}>
                        <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700 }}>34</Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Groups</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                    <Pressable style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderColor: COLORS.tabBorder, borderWidth: 1 }}><MessageCircleHeartIcon width={22} height={22} color={COLORS.textPrimary}></MessageCircleHeartIcon><Text style={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: 18 }}>Message</Text></Pressable>
                    <Pressable style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: COLORS.divider, flexDirection: 'row', alignItems: 'center', gap: 8, borderColor: COLORS.tabBorder, borderWidth: 1 }}><Phone width={22} height={22} color={COLORS.textMuted}></Phone></Pressable>
                    <Pressable style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: COLORS.divider, flexDirection: 'row', alignItems: 'center', gap: 8, borderColor: COLORS.tabBorder, borderWidth: 1 }}><Video width={22} height={22} color={COLORS.textMuted}></Video></Pressable>
                    <Pressable style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: COLORS.divider, flexDirection: 'row', alignItems: 'center', gap: 8, borderColor: COLORS.tabBorder, borderWidth: 1 }}><MoreHorizontal width={22} height={22} color={COLORS.textMuted}></MoreHorizontal></Pressable>
                </View>
                <Text style={{ color: COLORS.textMuted, fontWeight: 500, marginTop: 32, marginLeft: 22, marginBottom: 16 }}>MEDIA</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {media.map(m =>
                        <Image
                            key={m}
                            source={{ uri: m }}
                            width={100}
                            height={100}
                        >

                        </Image>
                    )}
                </View>
                <Text style={{ color: COLORS.textMuted, marginLeft: 16, marginTop: 32, marginBottom: 16 }}>SETTINGS</Text>
                <View style={{}}>
                    {settings.map(set => 
                        <View 
                            style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', borderTopWidth: 1, borderColor: COLORS.divider, padding: 16 }}
                            key={set.id}
                        >
                            <View style={{ flexDirection: 'row', alignItems: "center", gap: 16 }}>
                                <View style={{ backgroundColor: set.iconBGColor, padding: 8, borderRadius: 16 }}>
                                    {set.icon}
                                </View>
                                <View>
                                    <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>{set.textMain}</Text>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>{set.textSecond}</Text>
                                </View>
                            </View>
                            <ChevronRight color={COLORS.textMuted}></ChevronRight>
                        </View>
                    )}
                    <Pressable 
                        style={{ flexDirection: 'row', alignItems: "center", gap: 16, borderTopColor: COLORS.divider, borderTopWidth: 1, padding: 16 }}
                        onPress={Logout}
                    >
                        <View style={{ backgroundColor: COLORS.missedCallLower, padding: 8, borderRadius: 16 }}>
                            <LogOut color={COLORS.missedCall}></LogOut>
                        </View>
                        <View>
                            <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>Log out</Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}