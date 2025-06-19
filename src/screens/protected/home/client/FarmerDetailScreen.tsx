import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Image,
	ActivityIndicator,
	FlatList,
	TouchableOpacity,
	Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { baseUrl } from "../../../../config/api";
import { Colors } from "../../../../constants/Colors";
import { IconSymbol } from "../../../../components/ui/IconSymbol";
import ProductCard from "../../../../components/cards/productCard";
import responsive from "../../../../helpers/responsive";
import useAuthStore from "../../../../store/auth-store";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Button from "../../../../components/buttons/basic-button";

interface Order {
	_id: string;
	status: string;
	totalAmount: number;
	createdAt: string;
}

interface Product {
	_id: string;
	name: string;
	imageUrl: string;
	price: number;
	quantity: number;
	createdAt: string;
	category: string;
	farmer: any;
}

interface Farmer {
	_id: string;
	userName: string;
	email: string;
	profileImage?: string;
	location?: string;
	description?: string;
	phone?: string;
	createdAt: string;
	orders?: Order[];
	products?: Product[];
	productsCount: number;
}

type RootFarmersParamList = {
	"farmers-details": { id: string };
};

type FarmersDetailsRouteProp = RouteProp<
	RootFarmersParamList,
	"farmers-details"
>;

interface Props {
	route: FarmersDetailsRouteProp;
}

const FarmerDetailsScreen = ({ route }: Props) => {
	const { id } = route.params;
	const navigation = useNavigation() as any;
	const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
	const { user } = useAuthStore((state) => state);

	const { data: farmerDetails, isLoading: isLoadingFarmerDetails } =
		useQuery<Farmer>({
			queryKey: ["farmerDetails", id],
			queryFn: async () => {
				const response = await axios.get(
					`${baseUrl}/api/users/farmers/single/${id}?populate=orders,products`
				);
				return response.data.data;
			},
			enabled: !!id,
		});

	const handleStartChat = async () => {
		// Check if user is authenticated
		if (!user) {
			Alert.alert(
				"Login Required",
				"You need to log in to chat with farmers. Would you like to log in now?",
				[
					{
						text: "Cancel",
						style: "cancel",
					},
					{
						text: "Login",
						onPress: () => {
							navigation.navigate("AuthNavigator");
						},
					},
				]
			);
			return;
		}

		try {
			if (!user?.id || !farmerDetails?._id) {
				throw new Error("Missing user or farmer details");
			}

			const response = await axios.post(`${baseUrl}/api/chats/${user.id}`, {
				receiverId: farmerDetails._id,
			});

			// Check for successful response (200 or 201)
			if (response.status !== 200 && response.status !== 201) {
				throw new Error("Failed to create chat");
			}

			const chat = response.data;

			// Verify the chat object has required properties
			if (!chat?._id || !chat?.participants) {
				throw new Error("Invalid chat data received");
			}

			navigation.navigate("dynamicNavigator", {
				screen: "chat-screen",
				params: {
					chatId: chat._id,
					receiverId: farmerDetails._id,
				},
			});
		} catch (error) {
			console.error("Error creating chat:", error);
			Alert.alert(
				"Chat Error",
				error instanceof Error ? error.message : "Failed to start chat"
			);
		}
	};

	useEffect(() => {
		if (farmerDetails) {
			setCurrentFarmer(farmerDetails);
		}
	}, [farmerDetails]);

	if (isLoadingFarmerDetails) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.light.primary} />
			</View>
		);
	}

	if (!currentFarmer) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>Farmer not found</Text>
			</View>
		);
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.profileSection}>
				{currentFarmer.profileImage ? (
					<Image
						source={{ uri: currentFarmer.profileImage }}
						style={styles.avatar}
					/>
				) : (
					<View style={[styles.avatar, styles.avatarPlaceholder]}>
						<FontAwesome5 name="user-circle" size={48} color={Colors.light.text} />
					</View>
				)}

				<Text style={styles.farmerName}>
					{currentFarmer?.userName || "Farmer"}
				</Text>

				<View style={styles.statsRow}>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>
							{currentFarmer.productsCount || 0}
						</Text>
						<Text style={styles.statLabel}>Products</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>
							{currentFarmer.orders?.length || 0}
						</Text>
						<Text style={styles.statLabel}>Recent Orders</Text>
					</View>
					{currentFarmer.createdAt && (
						<View style={styles.statItem}>
							<Text style={styles.statLabel}>Joined</Text>
							<Text style={styles.statDate}>
								{formatDate(currentFarmer.createdAt)}
							</Text>
						</View>
					)}
				</View>

				{currentFarmer.location && (
					<View style={styles.detailRow}>
						<IconSymbol
							name="location"
							size={20}
							color={Colors.light.primary}
						/>
						<Text style={styles.detailText}>{currentFarmer.location}</Text>
					</View>
				)}

				{currentFarmer.email && (
					<View style={styles.detailRow}>
						<IconSymbol name="mail" size={20} color={Colors.light.primary} />
						<Text style={styles.detailText}>{currentFarmer.email}</Text>
					</View>
				)}

				{currentFarmer.phone && (
					<View style={styles.detailRow}>
						<IconSymbol name="phone" size={20} color={Colors.light.primary} />
						<Text style={styles.detailText}>{currentFarmer.phone}</Text>
					</View>
				)}

				{currentFarmer.description && (
					<View style={styles.descriptionContainer}>
						<Text style={styles.descriptionText}>
							{currentFarmer.description}
						</Text>
					</View>
				)}
				<View style={{ width: "100%" }}>
					<Button onPress={handleStartChat}>
						<Text>{user ? "Chat" : "Sign in to Chat"}</Text>
					</Button>
				</View>
			</View>

			{/* Products Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Available Products</Text>
				{currentFarmer.products && currentFarmer.products.length > 0 ? (
					<FlatList
						data={currentFarmer.products}
						keyExtractor={(item) => item._id}
						renderItem={({ item }) => <ProductCard product={item as any} />}
						ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					/>
				) : (
					<View style={styles.emptyProducts}>
						<IconSymbol name="info" size={32} color={Colors.light.text} />
						<Text style={styles.emptyText}>No products available</Text>
					</View>
				)}
			</View>

			{/* Recent Orders Section - Only show for authenticated users */}
			{user && currentFarmer.orders && currentFarmer.orders.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Recent Orders</Text>
					<View style={styles.ordersContainer}>
						{currentFarmer.orders.map((order) => (
							<View key={order._id} style={styles.orderCard}>
								<View style={styles.orderHeader}>
									<Text style={styles.orderDate}>
										{formatDate(order.createdAt)}
									</Text>
									<View
										style={[
											styles.statusBadge,
											{ backgroundColor: getStatusColor(order.status) },
										]}
									>
										<Text style={styles.statusText}>{order.status}</Text>
									</View>
								</View>
								<View style={styles.orderDetails}>
									<Text style={styles.orderAmount}>
										${order.totalAmount.toFixed(2)}
									</Text>
									<IconSymbol
										name="paperclip"
										size={16}
										color={Colors.light.text}
									/>
								</View>
							</View>
						))}
					</View>
				</View>
			)}
		</ScrollView>
	);
};

const getStatusColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "completed":
			return Colors.light.accent_green;
		case "processing":
			return Colors.light.primary;
		case "pending":
			return "#FFA500";
		default:
			return Colors.light.text;
	}
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.light.background },
	contentContainer: { paddingBottom: 20 },
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.light.background,
	},
	profileSection: {
		alignItems: "center",
		padding: 20,
		backgroundColor: Colors.light.surface,
		borderRadius: 12,
		margin: 16,
		marginTop: responsive.Dw(12),
		borderWidth: 0.5,
		borderColor: Colors.light.primary,
	},
	avatar: { width: 100, height: 100, borderRadius: 60, marginBottom: 16 },
	avatarPlaceholder: {
		backgroundColor: Colors.light.accent_green,
		justifyContent: "center",
		alignItems: "center",
	},
	farmerName: {
		fontSize: 22,
		fontWeight: "bold",
		color: Colors.light.text,
		marginBottom: 12,
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		width: "100%",
		marginBottom: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	statItem: { alignItems: "center" },
	statNumber: { fontSize: 18, fontWeight: "bold", color: Colors.light.primary },
	statLabel: { fontSize: 12, color: Colors.light.text, opacity: 0.8 },
	statDate: { fontSize: 12, color: Colors.light.text },
	detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
	detailText: { fontSize: 16, color: Colors.light.text, marginLeft: 8 },
	descriptionContainer: {
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: Colors.light.accent_green,
	},
	descriptionText: {
		fontSize: 15,
		color: Colors.light.text,
		lineHeight: 22,
		textAlign: "center",
	},
	section: { marginTop: 16, paddingHorizontal: 16 },
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: Colors.light.primary,
		marginBottom: 16,
	},
	emptyProducts: { alignItems: "center", padding: 20 },
	emptyText: { fontSize: 16, color: Colors.light.text, marginTop: 8 },
	ordersContainer: { marginBottom: 16 },
	orderCard: {
		backgroundColor: Colors.light.surface,
		borderRadius: 8,
		padding: 12,
		marginBottom: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	orderHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	orderDate: { fontSize: 14, color: Colors.light.text },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 12, color: "white", fontWeight: "500" },
	orderDetails: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	orderAmount: { fontSize: 16, fontWeight: "bold", color: Colors.light.text },
	errorText: {
		color: Colors.light.error,
		fontSize: 16,
		textAlign: "center",
		marginTop: 20,
	},
});

export default FarmerDetailsScreen;
