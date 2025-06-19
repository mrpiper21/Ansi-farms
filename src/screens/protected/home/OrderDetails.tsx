// screens/ProductDetailsScreen.tsx
import { RouteProp, useNavigation } from '@react-navigation/native';
import {
	StyleSheet,
	Text,
	View,
	Image,
	ScrollView,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getProductDetails } from "../../../apis/product";
import { Colors } from "../../../constants/Colors";
import Button from "../../../components/buttons/basic-button";
import responsive from "../../../helpers/responsive";
import { useState } from "react";
import useAuthStore from "../../../store/auth-store";
import axios from "axios";
import { baseUrl } from "../../../config/api";

type ProductStackParamList = {
	"product-details": { id: string };
};

type ProductDetailsRouteProp = RouteProp<
	ProductStackParamList,
	"product-details"
>;

interface ProductDetailsProps {
	route: ProductDetailsRouteProp;
}

const ProductDetailsScreen = ({ route }: ProductDetailsProps) => {
	const { id } = route.params;
	const [loading, setLoading] = useState<boolean>(false);
	const { user } = useAuthStore((state) => state);
	const navigation = useNavigation() as any;

	const {
		data: product,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["product", id],
		queryFn: () => getProductDetails(id),
	});

	const handlePurchase = async () => {
		// Check if user is authenticated
		if (!user) {
			Alert.alert(
				"Login Required",
				"You need to log in to purchase products. Would you like to log in now?",
				[
					{
						text: "Cancel",
						style: "cancel",
					},
					{
						text: "Login",
						onPress: () => {
							// Navigate to auth navigator
							navigation.navigate("AuthNavigator");
						},
					},
				]
			);
			return;
		}

		const payload = {
			buyer: user?.id,
			items: [
				{
					product: id,
					quantity: 1,
				},
			],
		};

		Alert.alert(
			"Confirm Purchase",
			`Are you sure you want to buy ${
				product?.name
			} for GHS${product?.price.toFixed(2)}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Confirm",
					onPress: async () => {
						try {
							setLoading(true);
							const response = await axios.post(
								`${baseUrl}/api/orders/create`,
								payload
							);

							// Check for success flag in response data
							if (response.data.success) {
								Alert.alert("Order Created Successfully");
								// navigation.navigate("OrderConfirmation", {
								//     orderId: response.data.order._id,
								//     productName: product?.name,
								//     price: product.price,
								//     farmerName: product?.farmer?.userName,
								// });
							} else {
								Alert.alert(
									"Error",
									response.data.error || "Failed to create order"
								);
							}
						} catch (error: any) {
							console.error("Order creation error:", error);
							let errorMessage = "Failed to connect to server";
							if (error.response) {
								// Handle backend error response
								errorMessage =
									error.response.data.error ||
									error.response.data.message ||
									errorMessage;
							} else if (error.request) {
								// The request was made but no response was received
								errorMessage = "No response from server";
							}
							Alert.alert("Error", errorMessage);
						} finally {
							setLoading(false);
						}
					},
				},
			],
			{ cancelable: true }
		);
	};

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.light.primary} />
			</View>
		);
	}

	if (isError) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>Error: {error.message}</Text>
			</View>
		);
	}

	if (!product) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>Product not found</Text>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
		>
			{product.imageUrl && (
				<Image
					source={{ uri: product.imageUrl }}
					style={styles.productImage}
					resizeMode="cover"
				/>
			)}

			<View style={styles.detailsContainer}>
				<Text style={styles.productName}>{product.name}</Text>

				<View style={styles.priceContainer}>
					<Text style={styles.price}>GHS{product.price.toFixed(2)}</Text>
					<Text style={styles.quantity}>{product.quantity}</Text>
				</View>

				{product.category && (
					<View style={styles.categoryContainer}>
						<Text style={styles.categoryLabel}>Category:</Text>
						<Text style={styles.category}>{product.category}</Text>
					</View>
				)}

				{product.description && (
					<View style={styles.descriptionContainer}>
						<Text style={styles.descriptionLabel}>Description:</Text>
						<Text style={styles.description}>{product.description}</Text>
					</View>
				)}

				<View style={styles.farmerContainer}>
					<Text style={styles.farmerLabel}>Sold by:</Text>
					<View style={styles.farmerInfo}>
						{product.farmer.avatar && (
							<Image
								source={{ uri: product.farmer.avatar }}
								style={styles.avatar}
							/>
						)}
						<View style={styles.farmerText}>
							<Text style={styles.farmerName}>{product.farmer.userName}</Text>
							<Text style={styles.farmerEmail}>{product.farmer.email}</Text>
						</View>
					</View>
				</View>
				<Button
					disabled={loading}
					onPress={handlePurchase}
					style={{ borderRadius: 30, marginTop: responsive.Dw(60) }}
				>
					{loading ? (
						<ActivityIndicator color={Colors.light.primary} />
					) : (
						<Text>Purchase GHS{product.price}.00</Text>
					)}
				</Button>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  detailsContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  quantity: {
    fontSize: 16,
    color: Colors.light.text,
    opacity: 0.8,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryLabel: {
    fontWeight: 'bold',
    color: Colors.light.text,
    marginRight: 4,
  },
  category: {
    color: Colors.light.text,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  description: {
    color: Colors.light.text,
    lineHeight: 22,
  },
  farmerContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.accent_green,
  },
  farmerLabel: {
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  farmerText: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  farmerEmail: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
});

export default ProductDetailsScreen;