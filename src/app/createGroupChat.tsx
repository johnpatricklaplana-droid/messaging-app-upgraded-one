import { useUser } from "@/context/UserContext";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { CheckCircleIcon, Circle, ImagePlusIcon, XCircleIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRelatedPeople } from "./api/supabase_queries";

export default function CreateGroupChat () {

    const COLORS = useTheme();

    const user = useUser();

    const myId = user.user?.id;

    const [members, setMembers] = useState<MembersMaybe[] | undefined>([]);
    const [avatar, setAvatar] = useState<any>(null);
    const [groupName, setGroupName] = useState<string>('');

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {

            const asset = result.assets[0];

            const mimeType = asset.mimeType ?? 'image/jpeg';
            const type = mimeType.split('/')[1];

            setAvatar({
                uri: result.assets[0].uri,
                type: type
            });
            
        }
    };

    async function uploadAvatar(files: any) {
        const fileName = `${Crypto.randomUUID()}.${files.type}`;
        
        const response = await fetch(files.uri);
        console.log("==========REPONSE=============");
        console.log(response);
        const file = await response.arrayBuffer();

        const { data, error } = await supabase.storage
            .from('group chat avatar storage')
            .upload(fileName, file, {
                contentType: `image/${files.type}`
            });

        if (error) {
            throw error;
        }
        console.log("and if you really you find there's no need to cry");
        console.log(data);

        // get public url
        const { data: publicUrlData } = supabase.storage
            .from('group chat avatar storage')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    }

    interface MembersMaybe {
        id: any;
        image: any;
        name: any;
        checked: boolean;
    };

    const handleAdding = (id: string) => {
        const updateCheck = members?.map(m => {
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

    const createOne = async () => {
        const mems = members?.filter(mem => mem.checked === true);

        const memsIds = mems?.map(mem => mem.id)?? [];

        const uri = await uploadAvatar(avatar);

        const { data, error } = await supabase.rpc('create_group_conversation', {
            p_name: groupName,
            p_avatar_url: uri,
            p_member_ids: [myId, ...memsIds]
        });

        console.log(data);
        console.log(error);

    };

    useEffect(() => {
        const getPossibleMembers = async () => {
            if(!myId) return;
            const people = await getRelatedPeople(myId);
            console.log("===============================");
            console.log(people);
            
            setMembers(people);
        };

        getPossibleMembers();
    }, [myId]);

    return (
        <SafeAreaView edges={["bottom"]} style={{ backgroundColor: COLORS.background, flex: 1 }}>
            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 22 }} style={{ flex: 1, width: '100%' }}>
                <Pressable 
                    onPress={pickImage} 
                    style={{ 
                        borderRadius: 50, 
                        backgroundColor: COLORS.inputs, 
                        padding: avatar === null ? 16 : 0, 
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
                    {avatar === null && <ImagePlusIcon
                        width={44}
                        height={44}
                        color={COLORS.textSecondary}
                    >

                    </ImagePlusIcon>}
                    {avatar !== null && <Image style={{ width: 80, height: 80, borderRadius: 50 }} source={{ uri: avatar.uri }}></Image>}
                </Pressable>
                <TextInput 
                    placeholder="Group name"
                    placeholderTextColor={COLORS.primary} 
                    value={groupName}
                    onChangeText={setGroupName}
                    style={{ 
                        backgroundColor: 'white', 
                        width: '100%', 
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        color: COLORS.primary
                    }}
                >
                    
                </TextInput>
                <Text style={{ color: COLORS.textSecondary, textAlign: "left", width: '100%', marginTop: 32 }}>ADD MEMBERS</Text>
                <View>
                    {members?.map(m => 
                        <Pressable
                            key={m.id}
                            onPress={() => handleAdding(m.id)}
                            style={({ pressed }) => ({
                                paddingVertical: 8,
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
                            {m.checked ? <CheckCircleIcon color={COLORS.primary}></CheckCircleIcon> : <Circle color={COLORS.textSecondary}></Circle> }
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
                onPress={createOne}
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