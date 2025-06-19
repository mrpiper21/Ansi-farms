import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from '../screens/auth/sign-up';
import SignUpScreen2 from '../screens/auth/sign-up2';
import LoginScreen from '../screens/auth/login';


const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="loginScreen" component={LoginScreen} />
			<Stack.Screen name="SignUpScreen" component={SignUpScreen} />
			<Stack.Screen name="SignUpScreen2" component={SignUpScreen2} />
		</Stack.Navigator>
	);
}

export default AuthNavigator