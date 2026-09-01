import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";

// ─── URL da Plataforma Web BatCaverna ──────────────────────────────
// Altere aqui para o domínio oficial de produção no Vercel
const PLATFORM_URL = "https://batcaverna.vercel.app";

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");

  // ─── Suporte ao Botão Físico de Voltar no Android ──────────────────
  useEffect(() => {
    if (Platform.OS === "android") {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => backHandler.remove();
    }
  }, [canGoBack]);

  const handleReload = () => {
    setHasError(false);
    setErrorDetails("");
    setLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B0F" />

      {/* ─── WebView Principal da Plataforma Web ─────────────────────── */}
      <WebView
        ref={webViewRef}
        source={{ uri: PLATFORM_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onLoadStart={() => {
          setLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setLoading(false);
          setHasError(true);
          setErrorDetails(nativeEvent.description || "Não foi possível conectar ao servidor.");
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.statusCode >= 500) {
            setHasError(true);
            setErrorDetails(`Erro ${nativeEvent.statusCode} no servidor.`);
          }
        }}
      />

      {/* ─── Loader Inicial Temático BatCaverna ───────────────────────── */}
      {loading && !hasError && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.batIcon}>🦇</Text>
          <Text style={styles.brandTitle}>
            Bat<Text style={styles.brandHighlight}>Caverna</Text>
          </Text>
          <Text style={styles.subText}>Carregando a central de operações...</Text>
          <ActivityIndicator size="large" color="#F5C518" style={{ marginTop: 24 }} />
        </View>
      )}

      {/* ─── Tela de Erro de Conexão (Fallback Offline) ──────────────── */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorTitle}>Falha na Conexão</Text>
          <Text style={styles.errorMessage}>
            Não conseguimos nos conectar à plataforma BatCaverna. Verifique sua conexão com a internet ou tente novamente.
          </Text>
          {errorDetails ? (
            <Text style={styles.errorSubDetails}>{errorDetails}</Text>
          ) : null}
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>Tentar Novamente ⚡</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0B0B0F",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B0B0F",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  batIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  brandHighlight: {
    color: "#F5C518",
  },
  subText: {
    color: "#A1A1B5",
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B0B0F",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    zIndex: 100,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F5F5F7",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#A1A1B5",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  errorSubDetails: {
    fontSize: 12,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#F5C518",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#F5C518",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  retryButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
