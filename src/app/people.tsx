import { COLORS } from "@/constants/themeMyVersion";
import { supabase } from "@/lib/supabase";
import { Search } from 'lucide-react-native';
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";
import { SafeAreaView } from "react-native-safe-area-context";

export default function People () {

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
            console.log(data);
            console.log(error);
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
                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderColor: COLORS.divider, borderBottomWidth: 1, padding: 16 }}
                    >
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                            <Image width={50} height={50} style={{ borderRadius: 50 }} source={{ uri: p.avatar_url }}></Image>
                            <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>{p.full_name}</Text>
                        </View>
                        <Pressable style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}><Text style={{ fontWeight: 700, color: COLORS.textPrimary }}>Message</Text></Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}