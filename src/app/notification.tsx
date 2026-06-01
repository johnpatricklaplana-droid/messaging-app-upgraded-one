import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export const registerNotification = async () => {
    if(!Device.isDevice) return;

    const { status } = await Notifications.requestPermissionsAsync();

    if(status !== "granted") return;

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', user?.id);

    console.log(data);
    console.log(error);

};