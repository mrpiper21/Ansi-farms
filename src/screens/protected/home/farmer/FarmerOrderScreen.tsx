import {
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	Image,
	RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import useAuthStore from "../../../../store/auth-store";
import { Colors } from "../../../../constants/Colors";
import { baseUrl } from "../../../../config/api";
import { IconSymbol } from "../../../../components/ui/IconSymbol";
import responsive from "../../../../helpers/responsive";
import { Ionicons } from "@expo/vector-icons";

const FarmerOrderScreen = () => {
	const { user } = useAuthStore();
	const navigation = useNavigation() as any;
	const queryClient = useQueryClient();
	const [refreshing, setRefreshing] = useState(false);

	// Fetch orders using TanStack Query
	const {
		data: orders,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["farmerOrders", user?.id],
		queryFn: async () => {
			const response = await axios.get(
				`${baseUrl}/api/orders/farmer-orders/${user?.id}`
			);
			return response.data.data;
		},
		enabled: !!user?.id,
	});

	useEffect(() => {
		onRefresh();
	}, [orders, user?.id]);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			// Fix: Use the proper invalidateQueries format for TanStack Query v4+
			await queryClient.invalidateQueries({
				queryKey: ["farmerOrders", user?.id],
			});
		} finally {
			setRefreshing(false);
		}
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) return "Invalid date";
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			console.error("Error formatting date:", e);
			return "Invalid date";
		}
	};

	const renderOrderItem = ({ item }: { item: any }) => (
		<View style={styles.orderCard}>
			{/* Order Header */}
			<View style={styles.orderHeader}>
				<View style={styles.orderIdContainer}>
					<IconSymbol name="paperclip" size={20} color={Colors.light.primary} />
					<Text style={styles.orderId}>
						Order #{item._id.substring(0, 8).toUpperCase()}
					</Text>
				</View>
				<View
					style={[
						styles.statusBadge,
						{ backgroundColor: getStatusColor(item.status) },
					]}
				>
					<Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
				</View>
			</View>

			{/* Customer Info */}
			<View style={styles.customerContainer}>
				{item.buyer?.avatar ? (
					<Image source={{ uri: item.buyer.avatar }} style={styles.avatar} />
				) : (
					<View style={[styles.avatar, styles.avatarPlaceholder]}>
						<IconSymbol name="person" size={24} color={Colors.light.text} />
					</View>
				)}
				<View style={styles.customerInfo}>
					<Text style={styles.customerName}>
						{item.buyer?.name || "Customer"}
					</Text>
					<Text style={styles.customerEmail}>{item.buyer?.email || ""}</Text>
				</View>
			</View>

			{/* Order Details */}
			<View style={styles.orderDetails}>
				<View style={styles.detailRow}>
					<IconSymbol
						name="calendar.circle.fill"
						size={16}
						color={Colors.light.text}
						style={styles.detailIcon}
					/>
					<Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
				</View>

				<View style={styles.detailRow}>
					<IconSymbol
						name="cart"
						size={16}
						color={Colors.light.text}
						style={styles.detailIcon}
					/>
					<Text style={styles.detailText}>
						{item.items.length} product{item.items.length !== 1 ? "s" : ""}
					</Text>
				</View>

				<View style={styles.detailRow}>
					<Text style={[styles.detailText, styles.totalAmount]}>
						Total: GHS{item.totalAmount.toFixed(2)}
					</Text>
				</View>
			</View>

			{/* View Details Button */}
			<TouchableOpacity
				style={styles.viewDetailsButton}
				onPress={() =>
					navigation.navigate("farmerOrder-details", { id: item._id })
				}
			>
				<Text style={styles.viewDetailsText}>View Order Details</Text>
				<IconSymbol
					name="chevron.right"
					size={20}
					color={Colors.light.primary}
				/>
			</TouchableOpacity>
		</View>
	);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return Colors.light.warning;
			case "confirmed":
				return Colors.light.info;
			case "shipped":
				return Colors.light.primary;
			case "delivered":
				return Colors.light.success;
			case "cancelled":
				return Colors.light.error;
			default:
				return Colors.light.text;
		}
	};

	if (isLoading && !refreshing) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.light.primary} />
			</View>
		);
	}

	if (isError) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>
					Error loading orders: {error.message}
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="chevron-back" size={24} color="white" />
				</TouchableOpacity>
				<View>
					<Text style={styles.header}># Orders</Text>
					<Text style={styles.subHeader}>Recent customer purchases</Text>
				</View>
			</View>

			{orders?.length === 0 ? (
				<View style={styles.emptyContainer}>
					<IconSymbol
						name="asterisk"
						size={48}
						color={Colors.light.text}
						style={{ opacity: 0.5 }}
					/>
					<Text style={styles.emptyText}>No orders yet</Text>
					<Text style={styles.emptySubText}>
						When you receive orders, they'll appear here
					</Text>
				</View>
			) : (
				<View style={{ paddingHorizontal: 16 }}>
					<FlatList
						data={orders}
						renderItem={renderOrderItem}
						keyExtractor={(item) => item._id}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								colors={[Colors.light.primary]}
								tintColor={Colors.light.primary}
							/>
						}
					/>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.background,
		paddingBottom: responsive.Dw(35),
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.light.background,
	},
	headerContainer: {
		marginBottom: 20,
		paddingHorizontal: 16,
		paddingBottom: responsive.Dw(5),
		paddingTop: responsive.Dw(12),
		backgroundColor: Colors.light.primary,
		flexDirection: "row",
		alignItems: "center",
		gap: 20,
	},
	header: {
		fontSize: 28,
		fontWeight: "bold",
		color: Colors.light.background,
		marginBottom: 4,
	},
	subHeader: {
		fontSize: 16,
		color: Colors.light.background,
		opacity: 0.7,
	},
	orderCard: {
		backgroundColor: Colors.light.surface,
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	orderHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: Colors.light.accent_green,
	},
	orderIdContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	orderId: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.light.text,
		marginLeft: 8,
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "bold",
		color: Colors.light.surface,
	},
	customerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 12,
	},
	avatarPlaceholder: {
		backgroundColor: Colors.light.accent_green,
		justifyContent: "center",
		alignItems: "center",
	},
	customerInfo: {
		flex: 1,
	},
	customerName: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.light.text,
		marginBottom: 2,
	},
	customerEmail: {
		fontSize: 14,
		color: Colors.light.text,
		opacity: 0.7,
	},
	orderDetails: {
		marginBottom: 12,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	detailIcon: {
		marginRight: 8,
		opacity: 0.7,
		width: 20,
		textAlign: "center",
	},
	detailText: {
		fontSize: 14,
		color: Colors.light.text,
	},
	totalAmount: {
		fontWeight: "bold",
		color: Colors.light.primary,
	},
	viewDetailsButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 10,
		borderTopWidth: 1,
		borderTopColor: Colors.light.accent_green,
		marginTop: 8,
	},
	viewDetailsText: {
		color: Colors.light.primary,
		fontWeight: "600",
		marginRight: 4,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "600",
		color: Colors.light.text,
		marginTop: 16,
		marginBottom: 4,
	},
	emptySubText: {
		fontSize: 14,
		color: Colors.light.text,
		opacity: 0.6,
		textAlign: "center",
	},
	errorText: {
		color: Colors.light.error,
		fontSize: 16,
		textAlign: "center",
		marginTop: 20,
		paddingHorizontal: 20,
	},
	listContent: {
		paddingBottom: 20,
	},
});

export default FarmerOrderScreen;
