// components/ProductModal.tsx
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	TextInput,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { IconSymbol } from "../ui/IconSymbol";
import { Colors } from "../../constants/Colors";
import { TProduct } from "../../@types/product.type";
interface ProductModalProps {
	visible: boolean;
	product: TProduct | null;
	onSubmit: (data: Omit<TProduct, "_id">) => void;
	onClose: () => void;
	isLoading: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
	visible,
	product,
	onSubmit,
	onClose,
	isLoading,
}) => {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		quantity: "",
		unit: "",
		image: "",
	});

	useEffect(() => {
		if (product) {
			setFormData({
				name: product.name,
				description: product?.description as string,
				price: product.price.toString(),
				quantity: product?.quantity as string,
				unit: product?.price as any,
				image: product?.imageUrl as string,
			});
		}
	}, [product]);

	const handleChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = () => {
		const productData = {
			name: formData.name,
			description: formData.description,
			price: parseFloat(formData.price),
			quantity: parseFloat(formData.quantity),
			unit: formData.unit,
			image: formData.image,
		};
		onSubmit(productData as any);
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={true}
			onRequestClose={onClose}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContainer}>
					<ScrollView contentContainerStyle={styles.scrollContainer}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Text style={styles.modalTitle}>
								{product ? "Edit Product" : "Add New Product"}
							</Text>
							<TouchableOpacity onPress={onClose}>
								<IconSymbol name="x.circle.fill" color={"black"} />
							</TouchableOpacity>
						</View>
						<Text style={styles.label}>Product Name</Text>
						<TextInput
							style={styles.input}
							value={formData.name}
							onChangeText={(text) => handleChange("name", text)}
							placeholder="Enter product name"
						/>

						<Text style={styles.label}>Description</Text>
						<TextInput
							style={[styles.input, styles.multilineInput]}
							value={formData.description}
							onChangeText={(text) => handleChange("description", text)}
							placeholder="Enter product description"
							multiline
							numberOfLines={3}
						/>

						<Text style={styles.label}>Price</Text>
						<TextInput
							style={styles.input}
							value={formData.price}
							onChangeText={(text) => handleChange("price", text)}
							placeholder="Enter price"
							keyboardType="numeric"
						/>

						<Text style={styles.label}>Quantity</Text>
						<TextInput
							style={styles.input}
							value={formData.quantity}
							onChangeText={(text) => handleChange("quantity", text)}
							placeholder="Enter quantity"
							keyboardType="numeric"
						/>

						{/* <Text style={styles.label}>Unit</Text>
						<TextInput
							style={styles.input}
							value={formData.unit}
							onChangeText={(text) => handleChange("unit", text)}
							placeholder="kg, lb, piece, etc."
						/> */}

						{/* <Text style={styles.label}>Image URL</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.image}
                            onChangeText={(text) => handleChange('image', text)}
                            placeholder="Enter image URL"
                        /> */}

						<TouchableOpacity
							style={[styles.button, styles.submitButton]}
							onPress={handleSubmit}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<Text style={styles.buttonText}>Save</Text>
							)}
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContainer: {
		width: "90%",
		maxHeight: "80%",
		backgroundColor: Colors.light.background,
		borderRadius: 10,
		padding: 20,
	},
	scrollContainer: {
		paddingBottom: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: Colors.light.primary,
		marginBottom: 20,
		textAlign: "center",
	},
	label: {
		fontSize: 14,
		color: Colors.light.text,
		marginBottom: 5,
		fontWeight: "500",
	},
	input: {
		borderWidth: 1,
		borderColor: Colors.light.text,
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
		backgroundColor: Colors.light.surface,
	},
	multilineInput: {
		minHeight: 80,
		textAlignVertical: "top",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	button: {
		padding: 12,
		borderRadius: 5,
		minWidth: 100,
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: Colors.light.error,
	},
	submitButton: {
		backgroundColor: Colors.light.primary,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
	},
});

export default ProductModal;
