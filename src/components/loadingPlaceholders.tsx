import { useTheme } from '@/hooks/use-theme';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface SendingImageBubbleProps {
    progress?: number;
    size?: number;
}

export default function SendingImageBubble({
    progress,
    size = 200,
}: SendingImageBubbleProps) {

    const COLORS = useTheme();

    const spinAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 750,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    useEffect(() => {
        if (progress !== undefined) {
            Animated.timing(progressAnim, {
                toValue: progress,
                duration: 200,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }).start();
        } else {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(progressAnim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: false,
                    }),
                    Animated.timing(progressAnim, {
                        toValue: 0.85,
                        duration: 1800,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: false,
                    }),
                    Animated.delay(400),
                ])
            ).start();
        }
    }, [progress]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const barWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['10%', '100%'],
    });

    const SPINNER = size * 0.17;
    const BORDER = SPINNER * 0.08;

    return (
        <View style={[styles.bubble, { width: size, height: size, backgroundColor: COLORS.primaryTint }]}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        {
                            width: SPINNER,
                            height: SPINNER,
                            borderRadius: SPINNER / 2,
                            borderWidth: BORDER,
                            borderColor: 'rgba(255,255,255,0.2)',
                            borderTopColor: COLORS.textPrimary,
                            transform: [{ rotate: spin }],
                        },
                    ]}
                />

                <Text style={[styles.label, { color: COLORS.textPrimary }]}>Sending…</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bubble: {
        alignSelf: 'flex-end',
        marginRight: 22,
        marginBottom: 16,
        borderRadius: 18,
        borderBottomRightRadius: 4,
        overflow: 'hidden',
    },
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    progressTrack: {
        width: 100,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 99,
        overflow: 'hidden',
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
});