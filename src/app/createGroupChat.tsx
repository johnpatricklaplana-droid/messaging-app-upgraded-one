import { COLORS } from "@/constants/themeMyVersion";
import * as ImagePicker from 'expo-image-picker';
import { CheckCircleIcon, Circle, ImagePlusIcon, XCircleIcon } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateGroupChat () {

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            console.log(result.assets[0].uri);
            setAvatar(result.assets[0].uri);
        }
    };

    interface MembersMaybe {
        id: string;
        image: string;
        name: string;
        circle: ReactNode;
        checked: boolean;
    };

    const membersMaybe: MembersMaybe[] = [
        { id: '1', image: 'https://picsum.photos/200/300?random=1', name: 'johny', circle: <Circle color={COLORS.textSecondary} />, checked: false },
        { id: '2', image: 'https://picsum.photos/200/300?random=2', name: 'hey', circle: <Circle color={COLORS.textSecondary} />, checked: false },
        { id: '3', image: 'https://picsum.photos/200/300?random=3', name: 'daddy', circle: <Circle color={COLORS.textSecondary} />, checked: false },
        { id: '4', image: 'https://picsum.photos/200/300?random=4', name: 'rasma', circle: <Circle color={COLORS.textSecondary} />, checked: false },
        { id: '5', image: 'https://picsum.photos/200/300?random=5', name: 'jonas', circle: <Circle color={COLORS.textSecondary} />, checked: false },
        { id: '6', image: 'https://picsum.photos/200/300?random=6', name: 'michael jackson', circle: <Circle color={COLORS.textSecondary} />, checked: false },
        { id: '7', image: 'https://picsum.photos/200/300?random=7', name: 'hehe', circle: <Circle color={COLORS.textSecondary} />, checked: false },
        { id: '8', image: 'https://picsum.photos/200/300?random=8', name: 'lebron james', circle: <Circle color={COLORS.textSecondary} />, checked: false },
    ];

    const [members, setMembers] = useState<MembersMaybe[]>(membersMaybe);
    const [avatar, setAvatar] = useState<string>('');

    const handleAdding = (id: string) => {
        const updateCheck = members.map(m => {
            if(m.id === id) {
                if(m.checked) {
                    m.checked = false;
                } else {
                    m.checked = true;
                }
            }
            return m;
        });
        setMembers(updateCheck);
    };

    return (
        <SafeAreaView edges={["bottom"]} style={{ backgroundColor: COLORS.background, flex: 1 }}>
            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 22 }} style={{ flex: 1, width: '100%' }}>
                <Pressable 
                    onPress={pickImage} 
                    style={{ 
                        borderRadius: 50, 
                        backgroundColor: COLORS.inputs, 
                        padding: avatar === '' ? 16 : 0, 
                        borderStyle: 'dashed', 
                        borderWidth: 1, 
                        borderColor: COLORS.textSecondary,
                        marginTop: 22,
                        marginBottom: 16,
                        position: 'relative'
                    }}
                >
                    {avatar !== '' && <Pressable 
                        onPress={() => setAvatar('')}
                        style={{ 
                            backgroundColor: COLORS.missedCall, 
                            borderRadius: '100%', 
                            position: 'absolute', 
                            right: 0, 
                            top: 0, 
                            zIndex: 10 
                        }}
                    >
                        <XCircleIcon 
                            color={COLORS.textPrimary} 
                            size={22}
                        >
                        </XCircleIcon>
                    </Pressable>}
                    {avatar === '' && <ImagePlusIcon
                        width={44}
                        height={44}
                        color={COLORS.textSecondary}
                    >

                    </ImagePlusIcon>}
                    {avatar !== '' && <Image style={{ width: 80, height: 80, borderRadius: 50 }} source={{ uri: avatar }}></Image>}
                </Pressable>
                <TextInput 
                    placeholder="Group name"
                    placeholderTextColor={COLORS.background} 
                    style={{ 
                        backgroundColor: 'white', 
                        width: '100%', 
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 16
                    }}
                >
                    
                </TextInput>
                <Text style={{ color: COLORS.textSecondary, textAlign: "left", width: '100%', marginTop: 32 }}>ADD MEMBERS</Text>
                <View>
                    {members.map(m => 
                        <Pressable
                            onPress={() => handleAdding(m.id)}
                            style={({ pressed }) => ({
                                paddingVertical: 16,
                                paddingHorizontal: 16,
                                borderRadius: 16,
                                flexDirection: 'row',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transform: [{ scale: pressed ? 0.95 : 1 }],
                                backgroundColor: pressed ? COLORS.primaryTint : COLORS.background
                            })}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Image style={{ borderRadius: 50, width: 50, height: 50 }} source={{ uri: m.image }} />
                                <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 600, }}>{m.name}</Text>
                            </View>
                            {m.checked ? <CheckCircleIcon color={COLORS.primary}></CheckCircleIcon> : m.circle }
                        </Pressable>
                    )}
                </View>
            </ScrollView>
            <Pressable 
                style={({ pressed }) => ({
                    width: '80%', 
                    marginHorizontal: 'auto', 
                    marginVertical: 16,  
                    padding: 16,
                    backgroundColor: pressed ? COLORS.primaryLight : COLORS.primary,
                    borderRadius: 16,
                    transform: [{ scale: pressed ? 0.95 : 1 }]
                })}
            >
                <Text 
                    style={{ 
                        textAlign: 'center', 
                        fontWeight: 700, 
                        color: COLORS.textPrimary 
                        }}
                    >
                        Create one
                </Text>
            </Pressable>
        </SafeAreaView>
    );
}