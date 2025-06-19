import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Colors } from "../../../constants/Colors";
import useCartStore, { Product } from "../../../store/cart-store";
import { baseUrl } from "../../../config/api";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import useAuthStore from "../../../store/auth-store";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { AntDesign } from "@expo/vector-icons";
import { IconSymbol } from "../../../components/ui/IconSymbol";
const CartScreen = () => {
	const {
		items,
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		getTotalItems,
		getTotalPrice,
		getItemQuantity,
	} = useCartStore();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const navigation = useNavigation() as any;
	const { user } = useAuthStore((state) => state);

	// Group items by product ID
	const groupedItems = items.reduce((acc: Record<string, any>, item) => {
		if (!acc[item.product._id]) {
			acc[item.product._id] = {
				product: item.product,
				quantity: 0,
			};
		}
		acc[item.product._id].quantity += item.quantity;
		return acc;
	}, {});

	const groupedItemsArray = Object.values(groupedItems);

	const handleIncreaseQuantity = (product: Product) => {
		addToCart(product);
	};

	const handleDecreaseQuantity = (product: Product) => {
		const currentQuantity = getItemQuantity(product._id);
		if (currentQuantity > 1) {
			updateQuantity(product._id, currentQuantity - 1);
		} else {
			removeFromCart(product._id);
		}
	};

	const handlePurchase = async () => {
		const payload = {
			buyer: user?.id,
			items,
		};
		console.log("payload --------------", payload);
		Alert.alert(
			"Confirm Purchase",
			`Are you sure you want to proceed?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Confirm",
					onPress: async () => {
						try {
							setIsLoading(true);

							const response = await axios.post(
								`${baseUrl}/api/orders/create`,
								payload
							);

							if (response.status === 201) {
								Alert.alert("Success");
							} else {
								Alert.alert(
									"Error",
									response?.data?.error || "Failed to create order"
								);
							}
						} catch (error: any) {
							Alert.alert(
								"Error",
								error.response?.data?.message || "Failed to connect to server"
							);
						} finally {
							setIsLoading(false);
						}
					},
				},
			],
			{ cancelable: true }
		);
	};

	const renderCartItem = ({ item }: { item: any }) => (
		<View style={styles.cartItem}>
			<Image
				source={{
					uri: item.product.imageUrl || "https://via.placeholder.com/150",
				}}
				style={styles.productImage}
			/>
			<View style={styles.itemDetails}>
				<Text style={styles.productName}>{item.product.name}</Text>
				<Text style={styles.productPrice}>
					GHS{item.product.price.toFixed(2)}
				</Text>
				{/* <Text style={styles.farmerName}>Sold by: {item?.product?.farmer?.userName}</Text> */}

				<View style={styles.quantityContainer}>
					<TouchableOpacity
						onPress={() => handleDecreaseQuantity(item.product)}
						style={styles.quantityButton}
					>
						{/* <IconSymbol name="minus" size={20} color={Colors.light.text} /> */}
						<FontAwesome6 name="minus" size={24} color={Colors.light.text} />
					</TouchableOpacity>

					<Text style={styles.quantityText}>{item.quantity}</Text>

					<TouchableOpacity
						onPress={() => handleIncreaseQuantity(item.product)}
						style={styles.quantityButton}
					>
						<AntDesign name="plus" size={24} color="black" />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => removeFromCart(item.product._id)}
						style={styles.deleteButton}
					>
						<IconSymbol name="trash" size={20} color={Colors.light.error} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	return (
		<View style={styles.container}>
			{items.length === 0 ? (
				<View style={styles.emptyCartContainer}>
					<IconSymbol
						name="minus.circle"
						size={60}
						color={Colors.light.secondary}
					/>
					<Text style={styles.emptyCartText}>Your cart is empty</Text>
					<Text style={styles.emptyCartSubText}>
						Browse products and add items to get started
					</Text>
				</View>
			) : (
				<>
					<FlatList
						data={groupedItemsArray}
						renderItem={renderCartItem}
						keyExtractor={(item) => item.product._id}
						contentContainerStyle={styles.listContent}
					/>

					<View style={styles.summaryContainer}>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Total Items:</Text>
							<Text style={styles.summaryValue}>{getTotalItems()}</Text>
						</View>

						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Subtotal:</Text>
							<Text style={styles.summaryValue}>
								GHS{getTotalPrice().toFixed(2)}
							</Text>
						</View>

						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Delivery:</Text>
							<Text style={styles.summaryValue}>GHS0.00</Text>
						</View>

						<View style={[styles.summaryRow, styles.totalRow]}>
							<Text style={styles.totalLabel}>Total:</Text>
							<Text style={styles.totalValue}>
								GHS{getTotalPrice().toFixed(2)}
							</Text>
						</View>

						<TouchableOpacity
							disabled={isLoading}
							onPress={handlePurchase}
							style={styles.checkoutButton}
						>
							{isLoading ? (
								<ActivityIndicator color={Colors.light.accent} />
							) : (
								<Text style={styles.checkoutButtonText}>
									Proceed to Checkout
								</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							onPress={clearCart}
							style={styles.clearCartButton}
						>
							<Text style={styles.clearCartButtonText}>Clear Cart</Text>
						</TouchableOpacity>
					</View>
				</>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 20,
  },
  emptyCartSubText: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 10,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: .5,
    borderColor: 'lightgray'
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: Colors.light.accent_green,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: 5,
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.accent_green,
    backgroundColor: Colors.light.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.accent_green,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearCartButton: {
    borderWidth: 1,
    borderColor: Colors.light.error,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  clearCartButtonText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;