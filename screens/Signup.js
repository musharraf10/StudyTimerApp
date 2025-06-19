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

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { setUser } = useContext(AuthContext);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const nameFocusAnim = useRef(new Animated.Value(0)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonPressAnim = useRef(new Animated.Value(1)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;

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
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    );
    gradientLoop.start();

    return () => gradientLoop.stop();
  }, []);

  useEffect(() => {
    // Calculate password strength
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);

    Animated.timing(strengthAnim, {
      toValue: strength,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [password]);

  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score / 5;
  };

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

  const handleFocus = (animValue) => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (animValue) => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    animateButtonPress(async () => {
      setLoading(true);
      try {
        const userData = await AuthService.signup(name, email, password);
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
          "Signup Error",
          error.message || "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  const handleGoogleSignUp = async () => {
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
          "Google Sign-Up Error",
          error.message || "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    });
  };

  const getBorderColor = (animValue) => {
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(255, 255, 255, 0.3)", "#667eea"],
    });
  };

  const getShadowColor = (animValue) => {
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(0, 0, 0, 0.1)", "#667eea"],
    });
  };

  const getStrengthColor = () => {
    if (passwordStrength < 0.3) return "#ff4757";
    if (passwordStrength < 0.6) return "#ffa502";
    if (passwordStrength < 0.8) return "#2ed573";
    return "#10B981";
  };

  const getStrengthText = () => {
    if (passwordStrength < 0.3) return "Weak";
    if (passwordStrength < 0.6) return "Fair";
    if (passwordStrength < 0.8) return "Good";
    return "Strong";
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient
        colors={["#6c5ce7", "#667eea", "#764ba2"]}
        style={signupStyles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={signupStyles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={signupStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                signupStyles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              {/* Floating Background Elements */}
              <View style={signupStyles.floatingElements}>
                <Animated.View
                  style={[
                    signupStyles.floatingCircle1,
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
                    signupStyles.floatingCircle2,
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
                <Animated.View
                  style={[
                    signupStyles.floatingCircle3,
                    {
                      transform: [
                        {
                          rotate: gradientAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["180deg", "540deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>

              {/* Header */}
              <View style={signupStyles.header}>
                <View style={signupStyles.logoContainer}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                    style={signupStyles.logoGradient}
                  >
                    <Text style={signupStyles.title}>FOCUSVAULT</Text>
                  </LinearGradient>
                </View>
                <Text style={signupStyles.subtitle}>Join the vault today</Text>
              </View>

              {/* Form Container */}
              <View style={signupStyles.formContainer}>
                <View style={signupStyles.form}>
                  {/* Name Input */}
                  <Animated.View
                    style={[
                      signupStyles.inputContainer,
                      {
                        borderColor: getBorderColor(nameFocusAnim),
                        shadowColor: getShadowColor(nameFocusAnim),
                      },
                    ]}
                  >
                    <Icon
                      name="person"
                      size={22}
                      color="rgba(255, 255, 255, 0.8)"
                      style={signupStyles.inputIcon}
                    />
                    <TextInput
                      style={signupStyles.input}
                      placeholder="Full Name"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      onFocus={() => handleFocus(nameFocusAnim)}
                      onBlur={() => handleBlur(nameFocusAnim)}
                    />
                  </Animated.View>

                  {/* Email Input */}
                  <Animated.View
                    style={[
                      signupStyles.inputContainer,
                      {
                        borderColor: getBorderColor(emailFocusAnim),
                        shadowColor: getShadowColor(emailFocusAnim),
                      },
                    ]}
                  >
                    <Icon
                      name="email"
                      size={22}
                      color="rgba(255, 255, 255, 0.8)"
                      style={signupStyles.inputIcon}
                    />
                    <TextInput
                      style={signupStyles.input}
                      placeholder="Email address"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => handleFocus(emailFocusAnim)}
                      onBlur={() => handleBlur(emailFocusAnim)}
                    />
                  </Animated.View>

                  {/* Password Input */}
                  <Animated.View
                    style={[
                      signupStyles.inputContainer,
                      {
                        borderColor: getBorderColor(passwordFocusAnim),
                        shadowColor: getShadowColor(passwordFocusAnim),
                      },
                    ]}
                  >
                    <Icon
                      name="lock"
                      size={22}
                      color="rgba(255, 255, 255, 0.8)"
                      style={signupStyles.inputIcon}
                    />
                    <TextInput
                      style={signupStyles.input}
                      placeholder="Password (min 6 characters)"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      onFocus={() => handleFocus(passwordFocusAnim)}
                      onBlur={() => handleBlur(passwordFocusAnim)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={signupStyles.eyeIcon}
                    >
                      <Icon
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={22}
                        color="rgba(255, 255, 255, 0.8)"
                      />
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <View style={signupStyles.strengthContainer}>
                      <View style={signupStyles.strengthBar}>
                        <Animated.View
                          style={[
                            signupStyles.strengthFill,
                            {
                              width: strengthAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                              }),
                              backgroundColor: getStrengthColor(),
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          signupStyles.strengthText,
                          { color: getStrengthColor() },
                        ]}
                      >
                        {getStrengthText()}
                      </Text>
                    </View>
                  )}

                  {/* Signup Button */}
                  <Animated.View
                    style={{ transform: [{ scale: buttonPressAnim }] }}
                  >
                    <TouchableOpacity
                      style={signupStyles.signupButton}
                      onPress={handleSignup}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={["#10B981", "#059669"]}
                        style={signupStyles.signupButtonGradient}
                      >
                        <Text style={signupStyles.signupButtonText}>
                          {loading ? "Creating Account..." : "Create Account"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Divider */}
                  <View style={signupStyles.dividerContainer}>
                    <View style={signupStyles.dividerLine} />
                    <Text style={signupStyles.dividerText}>or</Text>
                    <View style={signupStyles.dividerLine} />
                  </View>

                  {/* Google Button */}
                  <TouchableOpacity
                    style={signupStyles.googleButton}
                    onPress={handleGoogleSignUp}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.15)",
                        "rgba(255, 255, 255, 0.05)",
                      ]}
                      style={signupStyles.googleButtonGradient}
                    >
                      <Icon
                        name="mail"
                        size={22}
                        color="#fff"
                        style={signupStyles.buttonIcon}
                      />
                      <Text style={signupStyles.googleButtonText}>
                        Sign Up with Google
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Sign In Link */}
                  <TouchableOpacity
                    style={signupStyles.linkButton}
                    onPress={() => navigation.navigate("Login")}
                    activeOpacity={0.7}
                  >
                    <Text style={signupStyles.linkText}>
                      Already have an account?{" "}
                      <Text style={signupStyles.linkTextBold}>Sign In</Text>
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

const signupStyles = StyleSheet.create({
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
    top: -80,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  floatingCircle2: {
    position: "absolute",
    bottom: -100,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  floatingCircle3: {
    position: "absolute",
    top: "40%",
    right: -80,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
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
    color: "#6c5ce7",
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
    marginBottom: 16,
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
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginRight: 12,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 50,
  },
  signupButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  signupButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    color: "#fff",
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
