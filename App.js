import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, BackHandler, StyleSheet, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

const initialUrl = 'https://www.7publi.com/';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  // ✅ Always open links inside the same WebView
  const handleShouldStartLoad = (request) => {
    const url = request.url;

    // Allow everything to load inside WebView
    if (url.startsWith('http') || url.startsWith('https')) {
      return true;
    }

    // Block non-web URLs (like mailto, tel, etc.)
    return false;
  };

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  const injectedJS = `
    const style = document.createElement('style');
    style.innerHTML = '* { user-select: none; -webkit-user-select: none; -ms-user-select: none; }';
    document.head.appendChild(style);
    true;
  `;

  const handleRefresh = () => {
    setError(false);
    setKey(prev => prev + 1);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Loading error</Text>
        <Text style={styles.errorDesc}>Please check your internet connection.</Text>
        <Button title="🔄 Reload page" onPress={handleRefresh} color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <WebView
        key={key}
        ref={webViewRef}
        source={{ uri: initialUrl }}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onError={() => setError(true)}
        injectedJavaScript={injectedJS}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        style={styles.webview}
        scalesPageToFit
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 30,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9534f',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
});
