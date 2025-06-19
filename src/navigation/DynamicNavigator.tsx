import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import ResourceDetailScreen from "../screens/protected/home/ResourceDetails";
import OrderDetailsScreen from "../screens/protected/home/OrderDetails";
import OrderScreen from "../screens/protected/home/OrderScreen";
import { StackNavigationProp } from "@react-navigation/stack";
import FarmerProduce from "../screens/protected/home/FarmProduceScreen";
import SellScreen from "../screens/protected/home/SellScreen";
import FarmerOrderScreen from "../screens/protected/home/farmer/FarmerOrderScreen";
import FarmerOrderDetailsScreen from "../screens/protected/home/farmer/FarmerOrderDetailsScreen";
import FarmerDetailsScreen from "../screens/protected/home/client/FarmerDetailScreen";
import ChatScreen from "../screens/protected/session/ChatScreen";
import ArticlesScreen from "../screens/protected/explore/ArticlesScreen";
import ArticleDetailsScreen from "../screens/protected/explore/ArticleDetailsScreen";

export type DynamicStackParamList = {
	"resource-details": { id: string };
	"order-details": { id: string };
	chat: undefined; // Add your params if needed
	listing: undefined;
	orders: undefined;
	"farmer-produce": undefined;
	sell: undefined;
	"farmer-orders": undefined;
	"farmerOrder-details": { id: string };
	"farmers-details": { id: string };
	"chat-screen": { chatId: string };
	"articles": undefined;
	"article-details": { article: any };
};
export type DynamicStackScreenProps<T extends keyof DynamicStackParamList> =
	StackScreenProps<DynamicStackParamList, T>;

const Stack = createStackNavigator<DynamicStackParamList>();

const DynamicNavigator = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="resource-details"
				initialParams={{ id: "" }}
				component={ResourceDetailScreen as React.ComponentType<any>}
			/>
			{/* <Stack.Screen name="chat" component={ChatScreen} /> */}
			<Stack.Screen
				name="order-details"
				component={OrderDetailsScreen as React.ComponentType<any>}
			/>
			{/* <Stack.Screen name="product-details" component={OrderDetailsScreen} /> */}
			<Stack.Screen name="orders" component={OrderScreen} />
			<Stack.Screen name="farmer-produce" component={FarmerProduce} />
			<Stack.Screen name="sell" component={SellScreen} />
			<Stack.Screen name="farmer-orders" component={FarmerOrderScreen} />
			<Stack.Screen
				name="farmerOrder-details"
				component={FarmerOrderDetailsScreen as React.ComponentType<any>}
			/>
			<Stack.Screen
				name="farmers-details"
				component={FarmerDetailsScreen as React.ComponentType<any>}
			/>
			<Stack.Screen
				name="chat-screen"
				component={ChatScreen as React.ComponentType<any>}
			/>
			<Stack.Screen
				name="articles"
				component={ArticlesScreen}
			/>
			<Stack.Screen
				name="article-details"
				component={ArticleDetailsScreen as React.ComponentType<any>}
			/>
		</Stack.Navigator>
	);
};

export default DynamicNavigator