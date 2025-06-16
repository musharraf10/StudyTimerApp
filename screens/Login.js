import React, { useState, useContext, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // or react-native-linear-gradient
import Icon from "react-native-vector-icons/MaterialIcons";
import { AuthService } from "../utils/authService";
import { CommonActions } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useContext(AuthContext);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonPressAnim = useRef(new Animated.Value(1)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Gradient animation loop
    const gradientLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );
    gradientLoop.start();

    return () => gradientLoop.stop();
  }, []);

  const animateButtonPress = (callback) => {
    Animated.sequence([
      Animated.timing(buttonPressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonPressAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleEmailFocus = () => {
    Animated.timing(emailFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleEmailBlur = () => {
    Animated.timing(emailFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordFocus = () => {
    Animated.timing(passwordFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordBlur = () => {
    Animated.timing(passwordFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    animateButtonPress(async () => {
      setLoading(true);
      try {
        const userData = await AuthService.login(email, password);
        await AsyncStorage.setItem("userSession", JSON.stringify(userData));
        setUser(userData);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Main" }],
          })
        );
      } catch (error) {
        Alert.alert(
          "Login Error",
          error.message || "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  const handleGoogleSignIn = async () => {
    animateButtonPress(async () => {
      setLoading(true);
      try {
        await AuthService.googleSignIn();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Main" }],
          })
        );
      } catch (error) {
        Alert.alert(
          "Google Sign-In Error",
          error.message || "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  const emailBorderColor = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 255, 255, 0.3)", "#667eea"],
  });

  const passwordBorderColor = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 255, 255, 0.3)", "#667eea"],
  });

  const gradientColors = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      ["#667eea", "#764ba2"],
      ["#764ba2", "#8e44ad", "#667eea"],
    ],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient
        colors={["#667eea", "#764ba2", "#8e44ad"]}
        style={loginStyles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={loginStyles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={loginStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                loginStyles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              {/* Floating Background Elements */}
              <View style={loginStyles.floatingElements}>
                <Animated.View
                  style={[
                    loginStyles.floatingCircle1,
                    {
                      transform: [
                        {
                          rotate: gradientAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    loginStyles.floatingCircle2,
                    {
                      transform: [
                        {
                          rotate: gradientAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["360deg", "0deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>

              {/* Header */}
              <View style={loginStyles.header}>
                <View style={loginStyles.logoContainer}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                    style={loginStyles.logoGradient}
                  >
                    <Text style={loginStyles.title}>FOCUSVAULT</Text>
                  </LinearGradient>
                </View>
                <Text style={loginStyles.subtitle}>
                  Welcome back to your vault
                </Text>
              </View>

              {/* Form Container */}
              <View style={loginStyles.formContainer}>
                <View style={loginStyles.form}>
                  {/* Email Input */}
                  <Animated.View
                    style={[
                      loginStyles.inputContainer,
                      {
                        borderColor: emailBorderColor,
                        shadowColor: emailFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["rgba(0, 0, 0, 0.1)", "#667eea"],
                        }),
                      },
                    ]}
                  >
                    <Icon
                      name="email"
                      size={22}
                      color="rgba(255, 255, 255, 0.8)"
                      style={loginStyles.inputIcon}
                    />
                    <TextInput
                      style={loginStyles.input}
                      placeholder="Email address"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={handleEmailFocus}
                      onBlur={handleEmailBlur}
                    />
                  </Animated.View>

                  {/* Password Input */}
                  <Animated.View
                    style={[
                      loginStyles.inputContainer,
                      {
                        borderColor: passwordBorderColor,
                        shadowColor: passwordFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["rgba(0, 0, 0, 0.1)", "#667eea"],
                        }),
                      },
                    ]}
                  >
                    <Icon
                      name="lock"
                      size={22}
                      color="rgba(255, 255, 255, 0.8)"
                      style={loginStyles.inputIcon}
                    />
                    <TextInput
                      style={loginStyles.input}
                      placeholder="Password"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      onFocus={handlePasswordFocus}
                      onBlur={handlePasswordBlur}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={loginStyles.eyeIcon}
                    >
                      <Icon
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={22}
                        color="rgba(255, 255, 255, 0.8)"
                      />
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Login Button */}
                  <Animated.View
                    style={{ transform: [{ scale: buttonPressAnim }] }}
                  >
                    <TouchableOpacity
                      style={loginStyles.loginButton}
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(255, 255, 255, 0.9)",
                          "rgba(255, 255, 255, 0.8)",
                        ]}
                        style={loginStyles.loginButtonGradient}
                      >
                        <Text style={loginStyles.loginButtonText}>
                          {loading ? "Signing In..." : "Sign In"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Divider */}
                  <View style={loginStyles.dividerContainer}>
                    <View style={loginStyles.dividerLine} />
                    <Text style={loginStyles.dividerText}>or</Text>
                    <View style={loginStyles.dividerLine} />
                  </View>

                  {/* Google Button */}
                  <TouchableOpacity
                    style={loginStyles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.15)",
                        "rgba(255, 255, 255, 0.05)",
                      ]}
                      style={loginStyles.googleButtonGradient}
                    >
                      <Icon
                        name="mail"
                        size={22}
                        color="#fff"
                        style={loginStyles.buttonIcon}
                      />
                      <Text style={loginStyles.googleButtonText}>
                        Continue with Google
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Sign Up Link */}
                  <TouchableOpacity
                    style={loginStyles.linkButton}
                    onPress={() => navigation.navigate("Signup")}
                    activeOpacity={0.7}
                  >
                    <Text style={loginStyles.linkText}>
                      Don't have an account?{" "}
                      <Text style={loginStyles.linkTextBold}>Sign Up</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle1: {
    position: "absolute",
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  floatingCircle2: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#667eea",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "300",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: "#fff",
    fontWeight: "400",
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#667eea",
    fontSize: 18,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: "300",
  },
  googleButton: {
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  googleButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  linkButton: {
    alignSelf: "center",
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  linkTextBold: {
    fontWeight: "bold",
    color: "#fff",
  },
});
