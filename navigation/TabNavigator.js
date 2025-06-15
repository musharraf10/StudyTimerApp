import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/Home";
import ReadSpaceScreen from "../screens/ReadSpace";
import ToDoScreen from "../screens/ToDo";
import ProfileScreen from "../screens/Profile";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets(); // dynamically get bottom safe area

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "ReadSpace") iconName = "menu-book";
          else if (route.name === "ToDo") iconName = "check-circle";
          else if (route.name === "Profile") iconName = "person";

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: insets.bottom + 5, // prevent overlap
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        headerStyle: {
          backgroundColor: "#6366F1",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          headerTitle: "FOCUSVALUT",
        }}
      />
      <Tab.Screen
        name="ReadSpace"
        component={ReadSpaceScreen}
        options={{
          title: "Reading Space",
        }}
      />
      <Tab.Screen
        name="ToDo"
        component={ToDoScreen}
        options={{
          title: "ToDo",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}
