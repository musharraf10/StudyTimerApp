import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/Home';
import ReadSpaceScreen from '../screens/ReadSpace';
import BooksScreen from '../screens/Books';
import ToDoScreen from '../screens/ToDo';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'ReadSpace') {
            iconName = 'menu-book';
          } else if (route.name === 'Books') {
            iconName = 'library-books';
          } else if (route.name === 'ToDo') {
            iconName = 'check-circle';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#6366F1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: 'FOCUSVALUT',
        }}
      />
      <Tab.Screen 
        name="ReadSpace" 
        component={ReadSpaceScreen}
        options={{
          title: 'Reading Space',
        }}
      />
      <Tab.Screen 
        name="Books" 
        component={BooksScreen}
        options={{
          title: 'Books',
        }}
      />
      <Tab.Screen 
        name="ToDo" 
        component={ToDoScreen}
        options={{
          title: 'ToDo',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
