import { COLORS } from "@/constants/themeMyVersion";
import { Image, Pressable, Text, View } from "react-native";

export default function MediaLayout ({ mes }: any) {
    return <View style={{ width: '100%' }}>
                <View style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Pressable style={{ width: '70%' }}>
                        <Image style={{ width: '100%', borderRadius: 16, marginBlock: 8 }} height={300} source={{ uri: mes.media?.[0].url }}></Image>
                    </Pressable>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 12, marginBottom: 8 }}>{mes.sentAt}</Text>
                </View>
            </View>
}