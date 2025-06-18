// App.js
import React, { useContext } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { StudyProvider } from "./context/StudyContext";
import AuthNavigator from "./navigation/AuthNavigator";
import TabNavigator from "./navigation/TabNavigator";
import ReadingModeScreen from "./screens/ReadingScreen";
import { useFirebase } from "./hooks/useFirebase";

const Stack = createStackNavigator();

function AppContent() {
  const { user, initializing } = useContext(AuthContext);
  const { isInitialized, error } = useFirebase();

  // Show loading screen while Firebase is initializing
  if (!isInitialized || initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>
          {!isInitialized ? "Initializing..." : "Loading..."}
        </Text>
      </View>
    );
  }

  // Show error screen if Firebase initialization failed
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>
          Unable to connect to the server. Please check your internet connection
          and try again.
        </Text>
        <Text style={styles.errorDetails}>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ReadingMode" component={ReadingModeScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </StudyProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    fontFamily: "monospace",
  },
});
