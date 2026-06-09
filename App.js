import ConversationInformation from '@/app/conversationInformation';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import LoginScreen from './src/app/auth/loginScreen';
import Chat from './src/app/chat';
import CreateGroupChat from './src/app/createGroupChat';
import Messages from './src/app/messages';
import People from './src/app/people';
import Profile from './src/app/profile';
import { UserProvider } from './src/context/UserContext';
import { supabase } from './src/lib/supabase';

const MessageStack = createStackNavigator();

async function name() {
    const keys = await AsyncStorage.getAllKeys();
    console.log("KEYS: +++++++++++++");
    console.log(keys);
}

Notifications.setNotificationChannelAsync('messages', {
    name: 'messages',
    importance: Notifications.AndroidImportance.MAX,
});

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true
    }),
});

name();

export async function uploadMedia(result, conversationId, myId) {
    const { data: { session } } = await supabase.auth.getSession();

    const files = await Promise.all(
        result.assets.map(async (asset) => {
            const response = await fetch(asset.uri);
            const arrayBuffer = await response.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            let content = '';
            for (let i = 0; i < bytes.length; i++) {
                content += String.fromCharCode(bytes[i]);
            }

            return {
                name: `${myId}${Date.now()}${Math.random()}.${asset.mimeType?.split('/').pop()}`,
                type: asset.mimeType,
                content: btoa(content),
            };
        })
    );

    const response = await fetch('https://lbuoshnzslfbdtvbmfrg.supabase.co/functions/v1/upload-media-files', {
        method: 'POST',
        body: JSON.stringify({ conversationId: conversationId, files }),
        headers: {
            Authorization: `Bearer ${session?.access_token}`
        }
    });

    console.log(response);

    if (response.status === 200) {
        return { status: 'success' };
    } else {
        return { status: 'failed' };
    }
}

const Tab = createBottomTabNavigator();

function TabGroup () {

    const COLORS = useTheme();

    return (
        <Tab.Navigator screenOptions={{ 
                sceneStyle: {
                    backgroundColor: COLORS.background 
                },
                headerShown: false, 
                lazy: false,
                tabBarStyle: { 
                    backgroundColor: COLORS.background, 
                    borderColor: COLORS.divider,
                    marginBottom: 8
                },
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarActiveTintColor: COLORS.primary
            }}
        >
            <Tab.Screen 
                name='Messages'
                component={Messages}
                options={({ route }) => ({
                    tabBarStyle: {
                            backgroundColor: COLORS.background,
                            borderColor: COLORS.divider,
                            marginBottom: 8
                        },
                    tabBarIcon: ({ focused, color, size }) =>
                        focused ? <Ionicons name='chatbubble' size={size} color={COLORS.primary} /> : <Ionicons name='chatbubble-outline' color={color} size={size} />
                })}
            />
            <Tab.Screen
                name='people'
                component={People}
                options={{
                    tabBarIcon: ({ focused, color, size }) => {
                        return focused ? <Ionicons name='people' size={size} color={COLORS.primary} /> : <Ionicons name='people-outline' color={color} size={size} />
                    }
                }}
            />
            <Tab.Screen 
                name='profile' 
                component={Profile} 
                options={{ tabBarIcon: ({ focused, color, size }) => {
                    return focused ? <Ionicons name='people' size={size} color={COLORS.primary} /> : <Ionicons name='people-outline' color={color} size={size} />
                } }}
            />
        </Tab.Navigator>
    );
}

const RootStack = createStackNavigator();

export default function TabLayout() {

    const COLORS = useTheme();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoading(false);
            setSession(session);
        });

        return () => subscription.unsubscribe();

    }, []);
     console.log(loading);
    if(loading) return null;

    return (
        <NavigationContainer>
            <UserProvider>
                <RootStack.Navigator
                    screenOptions={{ headerShown: false }}
                >
                    {session ? (
                        <RootStack.Screen name="Tabs" component={TabGroup} />
                    ) : (
                        <RootStack.Screen name="Login" component={LoginScreen} />
                    )}
                    <RootStack.Screen name='Chat' component={Chat} />
                    <RootStack.Screen options={{ headerShown: true, title: 'hehe', headerStyle: { backgroundColor: COLORS.background }, headerTintColor: COLORS.primary, headerTitleStyle: { color: COLORS.primary, textAlign: 'center', width: '100%' } }} name='ConversationInformation' component={ConversationInformation} />
                    <RootStack.Screen options={{ headerTintColor: COLORS.textPrimary, headerShown: true, headerStyle: { backgroundColor: COLORS.background, borderColor: COLORS.divider, borderBottomWidth: 1 } }} name='CreateGroupChat' component={CreateGroupChat} />
                </RootStack.Navigator>
            </UserProvider>
        </NavigationContainer>
    );

}

