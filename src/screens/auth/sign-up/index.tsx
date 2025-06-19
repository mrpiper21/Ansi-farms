import { useState, useRef, useCallback, useEffect } from "react";
import {
	View,
	Text,
	Image,
	Pressable,
	StyleSheet,
	Keyboard,
	TouchableWithoutFeedback,
	KeyboardTypeOptions,
	useColorScheme,
	Alert,
	ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useForm } from "../../../store/form-store";
import responsive from "../../../helpers/responsive";
import { Colors } from "../../../constants/Colors";
import FormTextInput from "../../../components/input-elements/form-text-input";
import Button from "../../../components/buttons/basic-button";
// import GoogleIcon from "../../../../assets/icons/GOOGLE";
import { useNavigation } from "@react-navigation/native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import axios from "axios";
import { baseUrl } from "../../../config/api";

const SignUpScreen = () => {
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme ?? "light"];
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = ["65%", "80%"];
	const { setFormValues, formValues, clearFormValues } = useForm();
	const navigation = useNavigation() as any;
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// const router = useRouter();

	const handleDismissKeyboard = useCallback(() => {
		Keyboard.dismiss();
	}, []);

	useEffect(() => {
		clearFormValues();
	}, []);

	const handleNext = async () => {
		// Validate required fields based on user type
		if (!formValues.name || !formValues.location) {
			Alert.alert("Error", "Name and location are required for all users");
			return;
		}

		if (formValues.userType === "farmer") {
			if (!formValues.email || !formValues.code) {
				Alert.alert("Error", "Email and code are required for farmers");
				return;
			}
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formValues.email)) {
				Alert.alert("Error", "Please enter a valid email address");
				return;
			}
			const codeRegex = /^\d{4}$/;
			if (!codeRegex.test(formValues.code)) {
				Alert.alert("Error", "Code must be a 4-digit number");
				return;
			}
		}

		setIsLoading(true);

		try {
			if (formValues.userType === "farmer") {
				const response = await axios.post(`${baseUrl}/api/users/validate`, {
					code: formValues.code,
					email: formValues.email,
				});

				if (response.status !== 200) {
					Alert.alert("Error", "Invalid code. Please contact admin.");
					setIsLoading(false);
					return;
				}
			}

			navigation.navigate("SignUpScreen2");
		} catch (error) {
			console.error("Validation error:", error);

			let errorMessage = "An error occurred during validation";
			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.message || error.message;
			}

			Alert.alert("Error", errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<TouchableWithoutFeedback onPress={handleDismissKeyboard}>
				<View
					style={{ flex: 1, backgroundColor: colors.background }}
					onTouchStart={handleDismissKeyboard}
				>
					{/* Hero Section */}
					<View style={styles.heroContainer}>
						<Image
							source={require("../../../../assets/images/countryside-workers-out-field.jpg")}
							style={styles.heroImage}
						/>
						<View
							style={[
								styles.heroOverlay,
								{ backgroundColor: colors.primary + "40" },
							]}
						/>
						<View style={styles.heroContent}>
							<Text style={[styles.heroTitle, { color: colors.surface }]}>
								Join The Ansah Farming Community
							</Text>
							<Text
								style={[styles.heroSubtitle, { color: colors.surface + "CC" }]}
							>
								Grow with modern agricultural solutions
							</Text>
						</View>
					</View>

					{/* Bottom Sheet Form */}
					<BottomSheet
						ref={bottomSheetRef}
						index={1}
						snapPoints={snapPoints}
						// backdropComponent={renderBackdrop}
						// animationConfigs={animationConfigs}
						handleIndicatorStyle={{
							backgroundColor: colors.text + "80",
							width: 40,
							height: 4,
						}}
						backgroundStyle={{
							backgroundColor: colors.surface,
							borderTopLeftRadius: 32,
							borderTopRightRadius: 32,
						}}
						enablePanDownToClose={false}
						keyboardBehavior="interactive"
						keyboardBlurBehavior="restore"
						android_keyboardInputMode="adjustPan"
					>
						<BottomSheetView style={styles.bottomSheetContent}>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "center",
									gap: 15,
								}}
							>
								<View
									style={{
										padding: 4,
										backgroundColor: colors.primary,
										borderRadius: 20,
										width: 40,
									}}
								/>
								<View
									style={{
										padding: 4,
										backgroundColor: "gray",
										borderRadius: 20,
									}}
								/>
							</View>
							<Pressable
								style={styles.userTypeContainer}
								onPress={() => {
									if (formValues.userType === "farmer") {
										setFormValues("userType", null);
										console.log("user type client", formValues.userType);
									} else {
										setFormValues("userType", "farmer");
										console.log("user type farmer", formValues.userType);
									}
								}}
								hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
							>
								<View
									style={[
										styles.checkbox,
										{
											borderColor: colors.primary,
											backgroundColor: formValues.userType
												? colors.primary
												: "transparent",
										},
									]}
								>
									{formValues.userType === "farmer" && (
										<MaterialIcons
											name="check"
											size={18}
											color={colors.surface}
										/>
									)}
								</View>
								<Text style={[styles.userTypeLabel, { color: colors.text }]}>
									I am a farmer
								</Text>
							</Pressable>

							{/* Form Inputs */}
							<FormTextInput
								onChangeText={(text: string) => setFormValues("name", text)}
								label="Full Name"
								placeholder="John Doe"
								iconLeft={
									<MaterialIcons
										name="person"
										size={20}
										color={colors.text + "80"}
									/>
								}
								style={{ marginBottom: 20 }}
							/>
							<FormTextInput
								onChangeText={(text: string) => setFormValues("location", text)}
								label="Location"
								placeholder="eg. Accra - East Legon"
								iconLeft={
									<MaterialIcons
										name="pin-drop"
										size={20}
										color={colors.text + "80"}
									/>
								}
								style={{ marginBottom: 20 }}
							/>

							{formValues?.userType === "farmer" && (
								<>
									<FormTextInput
										onChangeText={(text: string) => setFormValues("code", text)}
										label="CODE"
										placeholder="Provide your 4 digit pin"
										iconLeft={
											<IconSymbol
												name="lock"
												size={20}
												color={colors.text + "80"}
											/>
										}
										style={{ marginBottom: 20 }}
									/>
									<FormTextInput
										onChangeText={(text: string) =>
											setFormValues("email", text)
										}
										label="Email"
										placeholder="Email address"
										iconLeft={
											<IconSymbol
												name="mail"
												size={20}
												color={colors.text + "80"}
											/>
										}
										style={{ marginBottom: 20 }}
									/>
								</>
							)}
							<Button
								size="lg"
								variant="primary"
								onPress={handleNext}
								style={{ marginBottom: 24 }}
							>
								{isLoading ? (
									<ActivityIndicator color={Colors.light.secondary} />
								) : (
									<Text>Next</Text>
								)}
							</Button>

							{/* Divider */}
							{/* <View style={styles.dividerContainer}>
								<View
									style={[
										styles.dividerLine,
										{ backgroundColor: colors.text + "20" },
									]}
								/>
								<Text
									style={[styles.dividerText, { color: colors.text + "80" }]}
								>
									Or continue with
								</Text>
								<View
									style={[
										styles.dividerLine,
										{ backgroundColor: colors.text + "20" },
									]}
								/>
							</View> */}

							{/* Social Login */}
							{/* <Button
								variant="outline"
								iconLeft={<GoogleIcon />}
								onPress={() => {}}
							>
								Continue with Google
							</Button> */}

							{/* Existing Account */}
							<View style={styles.registerContainer}>
								<Text style={{ color: colors.text + "CC" }}>
									Already have an account?{" "}
								</Text>
								<Pressable>
									<Text
										style={{
											color: colors.accent,
											fontWeight: "600",
											textDecorationLine: "underline",
										}}
									>
										Log In
									</Text>
								</Pressable>
							</View>
						</BottomSheetView>
					</BottomSheet>
				</View>
			</TouchableWithoutFeedback>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	heroContainer: {
		height: "45%",
		position: "relative",
	},
	heroImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	heroOverlay: {
		...StyleSheet.absoluteFillObject,
		opacity: 0.8,
	},
	heroContent: {
		position: "absolute",
		top: responsive.Dh(5),
		paddingHorizontal: 24,
	},
	heroTitle: {
		fontSize: 32,
		fontWeight: "700",
		lineHeight: 38,
		marginBottom: 8,
	},
	heroSubtitle: {
		fontSize: 16,
		lineHeight: 22,
		maxWidth: "80%",
	},
	bottomSheetContent: {
		padding: 24,
		flex: 1,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 24,
	},
	dividerLine: {
		flex: 1,
		height: 1,
	},
	dividerText: {
		fontSize: 14,
		paddingHorizontal: 12,
	},
	registerContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: responsive.Dw(25),
		paddingHorizontal: 12,
	},
	userTypeContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 24,
		paddingVertical: 8,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 6,
		borderWidth: 2,
		marginRight: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	userTypeLabel: {
		fontSize: 16,
		fontWeight: "500",
	},
	expandButton: {
		...StyleSheet.absoluteFillObject,
		// zIndex: 1,
	},
});

export default SignUpScreen;
