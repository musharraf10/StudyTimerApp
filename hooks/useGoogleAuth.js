import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { AuthService } from "../utils/authService";

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "831732683981-usc2l6epicv7co6tp05ertibsmo4qkmi.apps.googleusercontent.com",
    androidClientId:
      "831732683981-6f7m8qd6khh1e5d1gs5bnjgs2a91ageq.apps.googleusercontent.com",
    webClientId:
      "831732683981-usc2l6epicv7co6tp05ertibsmo4qkmi.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token, access_token } = response.authentication;
      AuthService.googleSignIn(id_token, access_token);
    }
  }, [response]);

  return { promptGoogleSignIn: promptAsync };
};
