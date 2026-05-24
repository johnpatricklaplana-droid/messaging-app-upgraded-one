import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import LoginScreen from './src/app/auth/loginScreen';
import Chat from './src/app/chat';
import Messages from './src/app/messages';
import People from './src/app/people';
import Profile from './src/app/profile';
import { COLORS } from './src/constants/themeMyVersion';
import { UserProvider } from './src/context/UserContext';
import { supabase } from './src/lib/supabase';

const MessageStack = createStackNavigator();

const Tab = createBottomTabNavigator();

function TabGroup () {
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
                    tabBarStyle: getFocusedRouteNameFromRoute(route) === 'Chat'
                        ? { display: 'none' }
                        : {
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

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
           
            if(_event === 'SIGNED_OUT') {
                setSession(null);
            }
        });
    }, []);

    if (loading) return null;

    return (
        <NavigationContainer>
            <UserProvider>
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    {session ? (
                        <RootStack.Screen name="Tabs" component={TabGroup} />
                    ) : (
                        <RootStack.Screen name="Login" component={LoginScreen} />
                    )}
                    <RootStack.Screen name='Chat' component={Chat} />
                </RootStack.Navigator>
            </UserProvider>
        </NavigationContainer>
    );

}

