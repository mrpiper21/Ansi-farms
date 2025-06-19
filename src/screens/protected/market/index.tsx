import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "../../../config/api";
import Button from "../../../components/buttons/basic-button";
import ProducetCard from "../../../components/cards/productCard";
import { Colors } from "../../../constants/Colors";

// Define the product type based on your backend response
export type Product = {
	_id: string;
	name: string;
	category: string;
	description?: string;
	price: number;
	quantity: string;
	imageUrl?: string;
	farmer: {
		_id: string;
		userName: string;
		email: string;
		avatar?: string;
	};
	createdAt: string;
	updatedAt: string;
};

const fetchProducts = async (): Promise<Product[]> => {
	try {
		const response = await axios.get(
			`${baseUrl}/api/products/farmer/produce/get`
		);
		return response.data.data;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw new Error("Failed to fetch products");
	}
};

const MarketPlace = () => {
	const {
		data: products,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching,
	} = useQuery<Product[]>({
		queryKey: ["products"],
		queryFn: fetchProducts,
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.light.primary} />
			</View>
		);
	}

	if (isError) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>
					{error?.message || "Failed to load products"}
				</Text>
				<Button onPress={() => refetch()} style={styles.retryButton}>
					<Text style={styles.retryButtonText}>Retry</Text>
				</Button>
			</View>
		);
	}

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={styles.container}
			refreshControl={
				<RefreshControl
					refreshing={isRefetching}
					onRefresh={refetch}
					colors={[Colors.light.primary]}
				/>
			}
		>
			{products?.map((product) => (
				<ProducetCard key={product?._id} product={product} />
			))}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 12,
		backgroundColor: Colors.light.background,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	errorText: {
		color: Colors.light.error,
		fontSize: 16,
		marginBottom: 20,
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: Colors.light.primary,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 5,
	},
	retryButtonText: {
		color: "white",
		fontWeight: "bold",
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.light.primary,
		marginBottom: 20,
		textAlign: "center",
	},
});

export default MarketPlace;