import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { registerNotification } from '../notification';

async function handleGoogleSignIn() { 

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            skipBrowserRedirect: false,
            redirectTo: 'messagingapplastone://auth'
        }
    })

    if (error || !data.url) return;

    console.log("LOG IN HAPPENS");

    const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'messagingapplastone://auth'
    );

    console.log('result', JSON.stringify(result));

    if (result.type === 'success') {
        await supabase.auth.signOut();
        const url = result.url;
        const params = new URLSearchParams(url.split('#')[1]);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) console.log(error);
        }
        registerNotification();
    }
}

export default function LoginScreen() {

    const COLORS = useTheme();

    return (
        <SafeAreaView style={{ padding: 32, backgroundColor: COLORS.background, flex: 1, alignItems: 'center' }}>
            <View style={{ marginBottom: 16, backgroundColor: COLORS.primary, padding: 16, borderRadius: 16 }}>
                <Ionicons name='chatbubble-outline' color={COLORS.textPrimary} size={50} />
            </View>
            <Text style={{ color: COLORS.textPrimary, marginBottom: 8, fontSize: 32, fontWeight: '600' }}>Welcome back</Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: 32 }}>Sign in to continue messaging</Text>
            <Pressable
                onPress={handleGoogleSignIn}
                style={{ marginBottom: 22, width: '100%', backgroundColor: COLORS.textPrimary, padding: 16, justifyContent: "center", borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Svg width={22} height={22} viewBox="0 0 24 24">
                    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </Svg>
                <Text style={{ fontSize: 18 }}>Continue with Google</Text>
            </Pressable>
            <Text style={{ color: COLORS.textMuted }}>Or</Text>
            <Pressable style={{ borderColor: COLORS.tabBorder, marginTop: 22, borderWidth: 1, padding: 16, borderRadius: 16, width: '100%' }}>
                <Text style={{ fontSize: 18, textAlign: 'center', color: COLORS.textPrimary }}>Continue with email</Text>
            </Pressable>
            <Text style={{ color: COLORS.textMuted, marginTop: 22 }}>By continuing you agree with me</Text>
        </SafeAreaView>
    );
}