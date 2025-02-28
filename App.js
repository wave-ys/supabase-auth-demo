import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import MainScreen from './MainScreen';

const App = () => {
  useEffect(() => {
    const handleUrl = async (event) => {
      const url = event.url;
      const fragment = url.split('#')[1]; // Supabase uses # for OAuth tokens
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    };

    // Listen for deep link events
    Linking.addEventListener('url', handleUrl);

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    // Cleanup listener
    return () => {
      Linking.removeEventListener('url', handleUrl);
    };
  }, []);

  return <MainScreen />;
};

export default App;