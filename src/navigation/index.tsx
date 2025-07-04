import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import TabsNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/login';
import useAuthStore from '../store/auth-store';
import DynamicNavigator from './DynamicNavigator';
import { ChatProvider } from "../context/chatContext";
import ClientHomePage from '../screens/protected/home/client/ClientHomePage';
import { BottomSheetProvider, useBottomSheet } from '../context/BottomSheetContext';
import PestDetectionBottomSheet from '../components/bottom-sheets/PestDetectionBottomSheet';

const Stack = createStackNavigator();

const AppContent = () => {
	const user = useAuthStore((state) => state.user);
	const { pestDetectionBottomSheetRef } = useBottomSheet();

	return (
		<>
			<Stack.Navigator>
				{user ? (
					// Authenticated user flow
					<>
						<Stack.Screen
							name="Tabs"
							component={TabsNavigator}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="dynamicNavigator"
							component={DynamicNavigator}
							options={{ headerShown: false }}
						/>
					</>
				) : (
					// Unauthenticated user flow
					<>
						<Stack.Screen
							name="ClientHome"
							component={ClientHomePage}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="AuthNavigator"
							component={AuthNavigator}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="dynamicNavigator"
							component={DynamicNavigator}
							options={{ headerShown: false }}
						/>
					</>
				)}
			</Stack.Navigator>
			<PestDetectionBottomSheet ref={pestDetectionBottomSheetRef} />
		</>
	);
};

const AppNavigator = () => {
	return (
		<NavigationContainer>
			<BottomSheetProvider>
				<ChatProvider>
					<AppContent />
				</ChatProvider>
			</BottomSheetProvider>
		</NavigationContainer>
	);
};

export default AppNavigator