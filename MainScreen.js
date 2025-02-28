import { useState, useEffect } from 'react';
import {View, Text, Button, Linking, TextInput} from 'react-native';
import { supabase } from './supabase';

const MainScreen = () => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState("");

    // Handle deep links
    const handleUrl = async (event) => {
        const url = event.url;
        if (url) {
            const { data, error } = await supabase.auth.getSessionFromUrl(url);
            if (error) {
                console.error('Error processing deep link:', error.message);
            } else if (data?.session) {
                setUser(data.session.user);
                setAccessToken(data.session.access_token);
            }
        }
    };

    // Set up auth state listener and deep link handler
    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAccessToken(session?.access_token ?? "");
        });

        // Auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setAccessToken(session?.access_token ?? "");
        });

        // Deep link listener
        Linking.getInitialURL().then((url) => {
            if (url) handleUrl({ url });
        });
        const subscription = Linking.addEventListener('url', handleUrl);

        // Cleanup
        return () => {
            authListener.subscription.unsubscribe();
            subscription.remove();
        };
    }, []);

    // Trigger Azure login
    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'azure',
            options: {
                scopes: 'email',
                redirectTo: 'unimelb-huddle://auth/callback',
            },
        });
        if (error) {
            console.error('Login error:', error.message);
            return;
        }
        console.log('Opening URL:', data.url); // Debug the URL
        await Linking.openURL(data.url);
    };

    // Logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    console.log(accessToken)

    // Render UI based on login state
    if (user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Welcome, {user.email}</Text>
                <Button title="Logout" onPress={handleLogout} />
                <Text>Your access token:</Text>
                <TextInput value={accessToken} />
            </View>
        );
    } else {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button title="Login with Azure" onPress={handleLogin} />
            </View>
        );
    }
};

export default MainScreen;