import { useUser } from "@/context/UserContext";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MessageCircleHeartIcon, Search } from 'lucide-react-native';
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";
import { SafeAreaView } from "react-native-safe-area-context";

export default function People () {

    const COLORS = useTheme();

    const user = useUser();

    const myId = user.user?.id;

    type RootStackParamList = {
        'Chat': {
            myId: string | null, otherSideId: string
        }
    };

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    interface People {
        id: string;
        avatar_url: string;
        created_at: Timestamp;
        email: string;
        full_name: string;
    };

    const [people, setPeople] = useState<People[]>([]);

    useEffect(() => {
        const getPeople = async () => {
            const { data, error } = await supabase.from('profiles').select('*');
            setPeople(data ?? []);
        };
         
        getPeople();

    }, []);

    return (
        <SafeAreaView edges={['top']} style={{ paddingHorizontal: 16 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ marginBottom: 22, color: COLORS.textPrimary, fontSize: 32, fontWeight: 700 }}>People</Text>
                <View style={{ marginBottom: 32, borderRadius: 16, paddingLeft: 8, flexDirection: "row", gap: 8, backgroundColor: COLORS.inputs, alignItems: 'center' }}>
                    <Search color={COLORS.textSecondary}></Search>
                    <TextInput style={{ width: '100%', paddingVertical: 8 }} placeholder="search some" placeholderTextColor={COLORS.textSecondary}></TextInput>
                </View>
                <Text style={{ color: COLORS.textMuted, marginBottom: 8, fontSize: 18 }}>Some people</Text>
                {people.map(p => 
                    <View
                        key={p.id}
                        style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            borderColor: COLORS.divider, 
                            borderBottomWidth: 1, 
                            padding: 16,
                            width: '100%'
                        }}
                    >
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1, flexShrink: 1 }}>
                            <Image width={50} height={50} style={{ borderRadius: 50 }} source={{ uri: p.avatar_url }}></Image>
                            <Text numberOfLines={2} style={{ color: COLORS.textPrimary, flex: 1, flexShrink: 1, fontSize: 16 }}>{p.full_name}</Text>
                        </View>
                        <Pressable 
                            style={{ 
                                flexShrink: 0
                            }}
                            onPress={() => navigation.navigate('Chat', { myId: myId ?? null, otherSideId: p.id })}
                        >   
                            <MessageCircleHeartIcon color={COLORS.primary} size={32}></MessageCircleHeartIcon>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}