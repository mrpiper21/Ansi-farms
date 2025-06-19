import { View, StyleSheet } from "react-native";
import React from "react";
// import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SellBottomSheet from "../../../components/bottom-sheets/SellBottomSheet";

const ListingScreen = () => {
    // const router = useRouter();
    // TODO

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.container}>
                <SellBottomSheet onClose={()=> null} /*onClose={() => router.back()}*/ />
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ListingScreen;
