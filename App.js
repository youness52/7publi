import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, BackHandler, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import * as WebBrowser from "expo-web-browser";

const initialUrl = "https://www.7publi.com/";

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [canGoBack]);

  // Handle navigation for external links
  const handleNavigation = async (event) => {
    const url = event.url;
    setCurrentUrl(url);

    if (!url.startsWith("https://www.7publi.com")) {
      WebBrowser.openBrowserAsync(url).catch((e) => console.log("Failed to open external link", e));
      return false; // prevent WebView from loading
    }

    return true;
  };

  // Reload page
  const handleRefresh = () => {
    setError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  // Inject JS to disable text selection
  const injectedJS = `
    const style = document.createElement('style');
    style.innerHTML = '* { user-select: none; -webkit-user-select: none; -ms-user-select: none; }';
    document.head.appendChild(style);
    true;
  `;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Error loading page</Text>
          <Text style={styles.errorDesc}>Check your Internet connection.</Text>
          <Button title="🔄 Reload Page" onPress={handleRefresh} color="#007bff" />
        </View>
      ) : (
        <>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={{ marginTop: 10 }}>Loading...</Text>
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setError(true);
              setIsLoading(false);
            }}
            onShouldStartLoadWithRequest={handleNavigation}
            injectedJavaScript={injectedJS}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            allowsBackForwardNavigationGestures
            mixedContentMode="always"
            originWhitelist={["*"]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#d9534f",
  },
  errorDesc: {
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 1,
  },
});
