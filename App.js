import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import Home from "./app/home/Home";
import KakaoCallback from "./app/OAuth/KakaoCallback";
import NaverCallback from "./app/OAuth/NaverCallback";
import Join from "./app/start/Join";
import Login from "./app/start/Login";
import Welcome from "./app/start/Welcome";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#090909" },
        }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Join" component={Join} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="KakaoCallback" component={KakaoCallback} />
        <Stack.Screen name="NaverCallback" component={NaverCallback} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
