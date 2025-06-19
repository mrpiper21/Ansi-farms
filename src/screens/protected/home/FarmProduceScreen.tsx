import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

// import { Product } from '../types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Octicons } from '@expo/vector-icons';
import useAuthStore from '../../../store/auth-store';
import { baseUrl } from '../../../config/api';
import { TProduct } from '../../../@types/product.type';
import { Colors } from '../../../constants/Colors';
import ProductModal from '../../../components/modals/EditProductModal';
import responsive from "../../../helpers/responsive";

// import ProductModal from '../components/ProductModal'; // We'll create this component

const FarmerProduce = () => {
	const { user } = useAuthStore((state) => state);
	const queryClient = useQueryClient();
	const [selectedProduct, setSelectedProduct] = useState<TProduct | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	// const router = useRouter()
	//TODO

	// Fetch products using TanStack Query
	const {
		data: products,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["farmerProducts", user?.id],
		queryFn: async () => {
			const response = await axios.get(
				`${baseUrl}/api/products/farmer/${user?.id}`
			);
			return response.data.data;
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async (productId: string) => {
			await axios.delete(
				`${baseUrl}/api/products/farmer/produce/delete/${productId}`
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["farmerProducts"] });
			// router.back()
			Alert.alert("Success", "Product deleted successfully");
		},
		onError: () => {
			Alert.alert("Error", "Failed to delete product");
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async (updatedProduct: TProduct) => {
			const response = await axios.put(
				`${baseUrl}/api/products/farmer/produce/update/${updatedProduct._id}`,
				updatedProduct
			);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["farmerProducts"] });
			setIsModalVisible(false);
			Alert.alert("Success", "Product updated successfully");
		},
		onError: () => {
			Alert.alert("Error", "Failed to update product");
		},
	});

	const handleDelete = (productId: string) => {
		Alert.alert(
			"Confirm Delete",
			"Are you sure you want to delete this product?",
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Delete", onPress: () => deleteMutation.mutate(productId) },
			]
		);
	};

	const handleEdit = (product: TProduct) => {
		setSelectedProduct(product);
		setIsModalVisible(true);
	};

	const handleSubmit = (productData: Omit<TProduct, "_id" | "farmer">) => {
		if (selectedProduct) {
			updateMutation.mutate({
				...selectedProduct,
				...productData,
			});
		}
	};

	const renderProductItem = ({ item }: { item: TProduct }) => (
		<View style={styles.productCard}>
			<Image
				source={{ uri: item.imageUrl }}
				style={styles.productImage}
				resizeMode="cover"
			/>
			<View style={styles.productInfo}>
				<Text style={styles.productName}>{item.name}</Text>
				<Text style={styles.productPrice}>GH₵{item.price.toFixed(2)}</Text>
				<Text style={styles.productQuantity}>
					Available: {item.quantity} {item.price}
				</Text>

				<View style={styles.actionsContainer}>
					<TouchableOpacity
						style={[styles.actionButton, styles.editButton]}
						onPress={() => handleEdit(item)}
					>
						<Octicons name="pencil" size={18} color="grey" />
						<Text style={styles.actionButtonText}>Edit</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.actionButton, styles.deleteButton]}
						onPress={() => handleDelete(item._id)}
					>
						<Text style={[styles.actionButtonText, { color: "white" }]}>
							Delete
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

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
					{error instanceof Error ? error.message : "Failed to fetch products"}
				</Text>
				<TouchableOpacity
					style={styles.retryButton}
					onPress={() =>
						queryClient.invalidateQueries({ queryKey: ["farmerProducts"] })
					}
				>
					<Text style={styles.retryButtonText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>My Products</Text>

			{products?.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>No products found</Text>
					<Text style={styles.emptySubText}>
						You haven't added any products yet.
					</Text>
				</View>
			) : (
				<FlatList
					data={products}
					renderItem={renderProductItem}
					keyExtractor={(item) => item._id}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			)}

			<ProductModal
				visible={isModalVisible}
				product={selectedProduct}
				onSubmit={handleSubmit}
				onClose={() => {
					setIsModalVisible(false);
					setSelectedProduct(null);
				}}
				isLoading={updateMutation.isPending}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.background,
		padding: 16,
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.light.primary,
		marginBottom: 20,
		textAlign: "center",
		marginTop: responsive.Dw(10),
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
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: {
		fontSize: 18,
		color: Colors.light.text,
		marginBottom: 10,
	},
	emptySubText: {
		fontSize: 14,
		color: Colors.light.text,
		opacity: 0.7,
	},
	listContent: {
		paddingBottom: 20,
	},
	productCard: {
		backgroundColor: Colors.light.surface,
		borderRadius: 10,
		marginBottom: 15,
		overflow: "hidden",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	productImage: {
		width: "100%",
		height: 150,
	},
	productInfo: {
		padding: 15,
	},
	productName: {
		fontSize: 18,
		fontWeight: "bold",
		color: Colors.light.text,
		marginBottom: 5,
	},
	productPrice: {
		fontSize: 16,
		color: Colors.light.primary,
		fontWeight: "600",
		marginBottom: 5,
	},
	productQuantity: {
		fontSize: 14,
		color: Colors.light.text,
		opacity: 0.8,
		marginBottom: 10,
	},
	actionsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
		gap: 10,
	},
	actionButton: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 5,
		minWidth: 80,
		alignItems: "center",
	},
	editButton: {
		borderWidth: 0.5,
		borderColor: "gray",
		borderRadius: 29,
		alignItems: "center",
		flexDirection: "row",
		gap: 4,
		width: "50%",
		justifyContent: "center",
	},
	deleteButton: {
		backgroundColor: Colors.light.error,
		borderRadius: 20,
		width: "50%",
		alignItems: "center",
		justifyContent: "center",
	},
	actionButtonText: {
		color: "gray",
		fontWeight: "600",
	},
});

export default FarmerProduce;