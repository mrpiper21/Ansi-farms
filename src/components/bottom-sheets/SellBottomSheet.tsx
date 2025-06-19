import React, { useState, useRef, useCallback, useMemo } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Image,
	Alert,
	Platform,
	Keyboard,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import axios from "axios";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useAuthStore from "../../store/auth-store";
import { baseUrl } from "../../config/api";
import { Colors } from "../../constants/Colors";
import responsive from "../../helpers/responsive";

type FormData = {
	name: string;
	category: string;
	description: string;
	price: string;
	quantity: string;
	image: string | null;
};

type Category = {
	label: string;
	value: string;
};

type SellBottomSheetProps = {
	//   isVisible: boolean;
	onClose: () => void;
	onSubmit?: (data: FormData) => void;
};

const SellBottomSheet: React.FC<SellBottomSheetProps> = ({
	//   isVisible,
	onClose,
	onSubmit,
}) => {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		category: "",
		description: "",
		price: "",
		quantity: "",
		image: null,
	});
	const { user } = useAuthStore((state) => state);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const bottomSheetRef = useRef<BottomSheet>(null);
	const scrollViewRef = useRef<ScrollView>(null);

	// Variables
	const snapPoints = useMemo(() => ["80%", "90%", "100%"], []);

	// Callbacks
	const handleSheetChanges = useCallback(
		(index: number) => {
			if (index === -1) {
				onClose();
			}
		},
		[onClose]
	);

	const handleSubmit = async () => {
		setIsLoading(true);
		if (!formData.name || !formData.category || !formData.price) {
			Alert.alert("Missing Information", "Please fill in all required fields.");
			setIsLoading(false);
			return;
		}

		try {
			const formDataToSend = new FormData();
			formDataToSend.append("name", formData.name);
			formDataToSend.append("category", formData.category);
			formDataToSend.append("price", formData.price);

			if (formData.description)
				formDataToSend.append("description", formData.description);
			if (formData.quantity)
				formDataToSend.append("quantity", formData.quantity);

			// Handle image differently based on its source
			if (formData.image) {
				// Get file info
				const imageUri = formData.image;
				const filename = imageUri.split("/").pop();

				// Infer the type of the image
				const match = /\.(\w+)$/.exec(filename || "");
				const type = match ? `image/${match[1]}` : "image/jpeg";

				formDataToSend.append("image", {
					uri: imageUri,
					name: filename || "photo.jpg",
					type: type,
				} as any);
			}

			console.log(
				"Sending request to:",
				`${baseUrl}/api/products/create/${user?.id}`
			);

			const response = await axios.post(
				`${baseUrl}/api/products/create/${user?.id}`,
				formDataToSend,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Accept: "application/json",
					},
					timeout: 10000,
				}
			);

			console.log("Response received:", response.status);

			if (response.status !== 201) {
				throw new Error(response.data.message || "Failed to submit product");
			}

			Alert.alert("Success", "Product listed successfully!");
			onSubmit?.(formData);
			onClose();
		} catch (error: any) {
			console.error("Error submitting product:", error);
			// More detailed error handling
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"Failed to submit product";
			Alert.alert("Error", errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const categories: Category[] = [
		{ label: "Fruits", value: "fruits" },
		{ label: "Vegetables", value: "vegetables" },
		{ label: "Grains", value: "grains" },
		{ label: "Dairy", value: "dairy" },
		{ label: "Herbs", value: "herbs" },
	];

	const handleInputChange = (name: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleImageUpload = async () => {
		try {
			const { status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission required",
					"Sorry, we need camera roll permissions to upload images."
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 1,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				setFormData((prev) => ({ ...prev, image: result.assets[0].uri }));
			}
		} catch (error) {
			console.error("Error picking image:", error);
			Alert.alert("Error", "Failed to pick image. Please try again.");
		}
	};

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				pressBehavior="close"
			/>
		),
		[]
	);

	const isFormValid =
		!!formData.name && !!formData.category && !!formData.price;

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={1}
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
			backdropComponent={renderBackdrop}
			enablePanDownToClose={true}
			keyboardBehavior="extend"
			keyboardBlurBehavior="restore"
			android_keyboardInputMode="adjustResize"
			style={styles.container}
			backgroundStyle={styles.background}
			handleIndicatorStyle={styles.handleIndicator}
		>
			<BottomSheetView>
				<ScrollView
					style={styles.scrollView}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					// contentContainerStyle={styles.scrollContent}
					// keyboardShouldPersistTaps="handled"
				>
					{/* Image Preview at the Top */}
					{formData.image ? (
						<View style={styles.imagePreviewContainer}>
							<Image
								source={{ uri: formData.image }}
								style={styles.imagePreview}
								resizeMode="cover"
							/>
							<TouchableOpacity
								style={styles.removeImageButton}
								onPress={() => handleInputChange("image", "")}
							>
								<Ionicons name="close" size={20} color={Colors.light.surface} />
							</TouchableOpacity>
						</View>
					) : (
						<TouchableOpacity
							style={styles.uploadArea}
							onPress={handleImageUpload}
						>
							<Ionicons name="camera" size={40} color={Colors.light.primary} />
							<Text style={styles.uploadAreaText}>Upload Product Image</Text>
						</TouchableOpacity>
					)}

					<View style={styles.contentContainer}>
						<Text style={styles.header}>List Your Produce</Text>

						{/* Name Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Name of Produce *</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., Organic Apples"
								value={formData.name}
								onChangeText={(text) => handleInputChange("name", text)}
								placeholderTextColor={Colors.light.secondary}
								returnKeyType="next"
							/>
						</View>

						{/* Category Picker */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Category *</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={formData.category}
									onValueChange={(value) =>
										handleInputChange("category", value)
									}
									style={styles.picker}
									dropdownIconColor={Colors.light.text}
								>
									<Picker.Item label="Select a category..." value="" />
									{categories.map((category) => (
										<Picker.Item
											key={category.value}
											label={category.label}
											value={category.value}
										/>
									))}
								</Picker>
							</View>
						</View>

						{/* Description */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Description</Text>
							<TextInput
								style={[styles.input, styles.multilineInput]}
								placeholder="Describe your produce..."
								value={formData.description}
								onChangeText={(text) => handleInputChange("description", text)}
								multiline
								numberOfLines={4}
								placeholderTextColor={Colors.light.secondary}
								returnKeyType="next"
							/>
						</View>

						{/* Price */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Price ($) *</Text>
							<TextInput
								style={styles.input}
								placeholder="0.00"
								value={formData.price}
								onChangeText={(text) => handleInputChange("price", text)}
								keyboardType="decimal-pad"
								placeholderTextColor={Colors.light.secondary}
								returnKeyType="next"
							/>
						</View>

						{/* Quantity (Optional) */}
						<View style={styles.inputContainer}>
							<Text style={styles.label}>Quantity (optional)</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., 1 kg, 5 pieces"
								value={formData.quantity}
								onChangeText={(text) => handleInputChange("quantity", text)}
								placeholderTextColor={Colors.light.secondary}
								returnKeyType="done"
							/>
						</View>

						<TouchableOpacity
							style={[
								styles.submitButton,
								!isFormValid && styles.disabledButton,
							]}
							onPress={handleSubmit}
							disabled={!isFormValid || isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<Text style={styles.submitButtonText}>List My Produce</Text>
							)}
						</TouchableOpacity>
					</View>
				</ScrollView>
			</BottomSheetView>
		</BottomSheet>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1, // Add this
	},
	background: {
		backgroundColor: Colors.light.surface,
		borderRadius: 20,
	},
	handleIndicator: {
		backgroundColor: Colors.light.secondary,
		opacity: 0.3,
		width: 40,
		height: 5,
	},
	scrollView: {
		// flex: 1,
		paddingHorizontal: 16,
		paddingBottom: responsive.Dh(50),
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 30,
	},
	imagePreviewContainer: {
		height: 200,
		borderRadius: 12,
		marginBottom: 20,
		overflow: "hidden",
	},
	imagePreview: {
		width: "100%",
		height: "100%",
	},
	uploadArea: {
		height: 150,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: Colors.light.primary,
		borderStyle: "dashed",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	uploadAreaText: {
		marginTop: 10,
		color: Colors.light.primary,
		fontWeight: "500",
	},
	removeImageButton: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: Colors.status.error,
		borderRadius: 15,
		width: 30,
		height: 30,
		alignItems: "center",
		justifyContent: "center",
	},
	contentContainer: {
		flex: 1,
	},
	header: {
		fontSize: 22,
		fontWeight: "bold",
		color: Colors.light.primary,
		marginBottom: 20,
		textAlign: "center",
	},
	inputContainer: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		color: Colors.light.text,
		marginBottom: 8,
		fontWeight: "500",
	},
	input: {
		backgroundColor: Colors.light.background,
		borderRadius: 8,
		padding: Platform.OS === "ios" ? 12 : 8,
		fontSize: 16,
		color: Colors.light.text,
		borderWidth: 1,
		borderColor: Colors.light.primary,
	},
	multilineInput: {
		minHeight: 80,
		textAlignVertical: "top",
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: Colors.light.primary,
		borderRadius: 8,
		backgroundColor: Colors.light.background,
		overflow: "hidden",
	},
	picker: {
		width: "100%",
		color: Colors.light.text,
	},
	submitButton: {
		backgroundColor: Colors.light.primary,
		borderRadius: 8,
		padding: 16,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 20,
		marginBottom: 50,
	},
	disabledButton: {
		backgroundColor: "#cccccc",
	},
	submitButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default SellBottomSheet;
