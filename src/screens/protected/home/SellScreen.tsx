import { View, StyleSheet } from "react-native";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SellBottomSheet from "../../../components/bottom-sheets/SellBottomSheet";
import { useNavigation } from "@react-navigation/native";

const SellScreen = () => {
	const navigation = useNavigation()

	return (
		<GestureHandlerRootView style={styles.container}>
			<View style={styles.container}>
				<SellBottomSheet onClose={() => navigation.goBack()} />
			</View>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default SellScreen;