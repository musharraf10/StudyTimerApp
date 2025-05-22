import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';

const Stack = createStackNavigator();

export default function AuthNavigator(rootNavigation) {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login">
        {props => <LoginScreen {...props} rootNavigation={rootNavigation} />}
      </Stack.Screen>

      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}