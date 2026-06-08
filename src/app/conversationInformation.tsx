import { useTheme } from "@/hooks/use-theme";
import { Bell, Plus, Trash2 } from "lucide-react-native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const medias = [
    { id: 'fklajfa', media: 'https://picsum.photos/200/300?random=1'},
    { id: 'fkafjfjafjfjlas;', media: 'https://picsum.photos/200/300?random=1'},
    { id: 'fjairwqur', media: 'https://picsum.photos/200/300?random=1'},
    { id: 'kfcnvncnvn', media: 'https://picsum.photos/200/300?random=1'},
    { id: 'ehheeh', media: 'https://picsum.photos/200/300?random=1'},
    { id: 'hihihih', media: 'https://picsum.photos/200/300?random=1'},
];

const members = [
    {avatar: 'https://picsum.photos/200/300?random=1',id: 'fjakf', name: 'johny kim', status: 'online'},
    {avatar: 'https://picsum.photos/200/300?random=2',id: 'fajfkafjlasj', name: 'johny kim', status: 'online 100 years ago'},
    {avatar: 'https://picsum.photos/200/300?random=3',id: 'together', name: 'johny kim', status: 'no one'},
    {avatar: 'https://picsum.photos/200/300?random=4',id: 'titjit', name: 'johny kim', status: 'online'},
    {avatar: 'https://picsum.photos/200/300?random=5',id: 'hihtdkfk', name: 'johny kim', status: 'online'},
];

export default function ConversationInformation () {

    const COLORS = useTheme();

    return (
        <SafeAreaView 
            edges={['bottom']}
            style={{ 
                backgroundColor: COLORS.background, 
                flex: 1,
            }}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                    padding: 22
                }}
            >
                <View
                    style={{
                        alignItems: 'center',
                        marginBottom: 32,
                    }}
                >
                    <Image
                        source={{ uri: 'https://picsum.photos/200/300?random=1000' }}
                        width={92}
                        height={92}
                        style={{
                            borderRadius: 50,
                            borderColor: COLORS.primary,
                            borderWidth: 2,
                            marginBottom: 8
                        }}
                    >
                    </Image>
                    <Text
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: COLORS.textPrimary
                        }}
                    >
                        Family Group
                    </Text>
                    <Text
                        style={{
                            color: COLORS.textMuted
                        }}
                    >
                        5 members created Jan 2025
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={{
                            marginTop: 16,
                            padding: 8,
                            backgroundColor: COLORS.primaryTint,
                            borderRadius: 16
                        }}
                    >
                        <Bell size={22} color={COLORS.primary}></Bell>
                    </TouchableOpacity>
                </View>
                <Text
                    style={{
                        color: COLORS.textSecondary,
                        marginBottom: 8
                    }}
                >
                    SHARED MEDIA
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                        alignItems: 'center'
                    }}
                >
                    {medias.map(m =>
                        <Image
                            key={m.id}
                            source={{ uri: m.media }}
                            height={100}
                            width={100}
                        >

                        </Image>
                    )}
                </View>
                <Text
                    style={{
                        color: COLORS.textSecondary,
                        marginBottom: 8,
                        marginTop: 22
                    }}
                >
                    MEMBERS
                </Text>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={{
                        borderBottomColor: COLORS.divider,
                        borderBottomWidth: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 8,
                        borderTopRightRadius: 16,
                        borderTopLeftRadius: 16,
                        justifyContent: 'flex-start',
                        backgroundColor: COLORS.primaryTint
                    }}
                >
                    <View
                        style={{
                            backgroundColor: COLORS.primaryTint,
                            borderRadius: 16,
                            padding: 8
                        }}
                    >
                        <Plus color={COLORS.primary} size={22}></Plus>
                    </View>
                    <Text>
                        Add Member
                    </Text>
                </TouchableOpacity>
                {members.map((m, i) => {
 
                    let isLast: boolean;

                    if(members.length - 1 === i) {
                        isLast = true;
                    } else {
                        isLast = false;
                    }

                    return <TouchableOpacity
                            key={m.id}
                            activeOpacity={0.7}
                            style={{ 
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                                backgroundColor: COLORS.primaryTint,
                                borderBottomColor: COLORS.divider,
                                borderBottomWidth: 1,
                                borderBottomLeftRadius: isLast ? 16 : 0,
                                borderBottomRightRadius: isLast ? 16 : 0,   
                            }}
                        >
                            <View 
                                style={{ 
                                    flexDirection: 'row',
                                    gap: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Image
                                    source={{ uri: m.avatar }}
                                    height={50}
                                    width={50}
                                    style={{
                                        borderRadius: 50
                                    }}
                                >

                                </Image>
                                <View>
                                    <Text
                                    >
                                        {m.name}
                                    </Text>
                                    <Text
                                        style={{ color: COLORS.textMuted, fontSize: 12 }}
                                    >
                                        {m.status}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    }
                )}
                <Text
                    style={{ 
                        marginTop: 22,
                        marginBottom: 8,
                        color: COLORS.textSecondary
                    }}
                >
                    DANGER ZONE
                </Text>
                <TouchableOpacity
                    activeOpacity={0.5}
                    style={{ 
                        padding: 16,
                        borderRadius: 16,
                        backgroundColor: COLORS.primaryTint
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <Trash2 color={COLORS.delete}></Trash2>
                        <Text style={{ color: COLORS.delete, fontWeight: 700 }}>Leave group</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}