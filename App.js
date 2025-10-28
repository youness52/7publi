import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, BackHandler, Linking, StyleSheet, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

const initialUrl = 'https://www.7publi.com/';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [loadingError, setLoadingError] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [canGoBack]);

  // Handle deep link redirect (Facebook / Google login success)
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('Received deep link:', url);
      if (url.includes('7publi.com')) {
        // reload site when returning from login
        setCurrentUrl(url);
      }
    };
    Linking.addEventListener('url', handleDeepLink);

    // Check if app opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url && url.includes('7publi.com')) {
        setCurrentUrl(url);
      }
    });

    return () => Linking.removeAllListeners('url');
  }, []);

  // Handle navigation changes inside WebView
  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
  };

  // Handle external redirects (Facebook, Google login)
  const handleShouldStartLoadWithRequest = (request) => {
    const url = request.url;

    if (
      url.startsWith('https://www.facebook.com') ||
      url.startsWith('https://accounts.google.com') ||
      url.includes('oauth')
    ) {
      Linking.openURL(url); // open outside WebView
      return false;
    }

    return true;
  };

  const handleRefresh = () => {
    setLoadingError(false);
    webViewRef.current.reload();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      {loadingError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Error loading page</Text>
          <Text style={styles.errorDesc}>Check your internet connection.</Text>
          <Button title="🔄 Refresh" onPress={handleRefresh} color="#007bff" />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onError={() => setLoadingError(true)}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: { fontSize: 18, fontWeight: 'bold', color: 'red' },
  errorDesc: { fontSize: 14, color: '#555', marginVertical: 10, textAlign: 'center' },
});
