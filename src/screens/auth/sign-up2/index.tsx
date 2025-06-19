import { useState, useRef, useCallback } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	Keyboard,
	TouchableWithoutFeedback,
	KeyboardTypeOptions,
	useColorScheme,
	Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, {
	BottomSheetView,
	useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors } from "../../../constants/Colors";
import useAuthStore, { IUser } from "../../../store/auth-store";
import { useForm } from "../../../store/form-store";
import FormTextInput from "../../../components/input-elements/form-text-input";
import Button from "../../../components/buttons/basic-button";
import responsive from "../../../helpers/responsive";
import GoogleIcon from "../../../../assets/icons/GOOGLE";

export default function SignUpScreen2() {
	const colorScheme = useColorScheme();
	const colors = Colors[colorScheme ?? "light"];
	const bottomSheetRef = useRef<BottomSheet>(null);
	const [createFucntionIsCalled, setCreateFuctionIsCalled] =
		useState<boolean>(false);
	const snapPoints = ["75%"];
	const { setFormValues, formValues, clearFormValues } = useForm();
	const { register, isLoading } = useAuthStore();

	const handleDismissKeyboard = useCallback(() => {
		Keyboard.dismiss();
	}, []);

	const handleCreate = async () => {
		try {
			setCreateFuctionIsCalled(true);

			// Early validation
			if (formValues.password !== formValues.confirm_password) {
				Alert.alert("Passwords do not match");
				return;
			}

			const payload: IUser = {
				email: formValues.email,
				userName: formValues.name,
				location: formValues.location,
				type: formValues.userType,
			};
			await register(payload, formValues.confirm_password);

			// Handle success
			Alert.alert("Registration successful");
			clearFormValues();
		} catch (error: any) {
			Alert.alert(error?.message || "Registration failed");
		} finally {
			setCreateFuctionIsCalled(false);
		}
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View
				style={{ flex: 1, backgroundColor: colors.background }}
				onTouchStart={handleDismissKeyboard}
			>
				{/* Hero Section */}
				<View style={styles.heroContainer}>
					<Image
						source={require("../../../../assets/images/african-people-harvesting-vegetables.jpg")}
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
							Join Our Farming Community
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
					handleComponent={null}
					enablePanDownToClose={false}
					enableOverDrag={false}
					enableHandlePanningGesture={false}
					enableContentPanningGesture={false}
					backgroundStyle={{
						backgroundColor: colors.surface,
						borderTopLeftRadius: 32,
						borderTopRightRadius: 32,
					}}
				>
					<TouchableWithoutFeedback onPress={handleDismissKeyboard}>
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
									}}
								/>
								<View
									style={{
										padding: 4,
										backgroundColor: colors.primary,
										borderRadius: 20,
										width: 40,
									}}
								/>
							</View>
							{[
								{
									label: "Email Address",
									icon: "email",
									props: {
										keyboardType: "email-address" as KeyboardTypeOptions,
									},
								},
								{ label: "Password", icon: "lock", secure: true },
								{ label: "Confirm Password", icon: "lock-reset", secure: true },
							].map((field) => {
								if (formValues.userType === "farmer" && field.icon === "email")
									return null;
								return (
									<FormTextInput
										onChangeText={(text) =>
											setFormValues(
												field.icon === "email"
													? "email"
													: field.icon === "lock"
													? "password"
													: "confirm_password",
												text
											)
										}
										key={field.label}
										label={field.label}
										placeholder={
											field.label === "Email Address"
												? "john@farmershub.com"
												: "••••••••"
										}
										secure={field.secure}
										iconLeft={
											<MaterialIcons
												name={field.icon as any}
												size={20}
												color={colors.text + "80"}
											/>
										}
										error={
											createFucntionIsCalled &&
											field.icon === "lock-reset" &&
											formValues.password !== formValues.confirm_password
												? "Passwords do not match"
												: undefined
										}
										style={{ marginBottom: 20 }}
										{...field.props}
									/>
								);
							})}

							<Button
								size="lg"
								variant="primary"
								onPress={handleCreate}
								style={{ marginBottom: 24 }}
								loading={isLoading}
							>
								Create Account
							</Button>
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
							</View>

							<Button
								variant="outline"
								iconLeft={<GoogleIcon />}
								onPress={() => {}}
							>
								Continue with Google
							</Button> */}
						</BottomSheetView>
					</TouchableWithoutFeedback>
				</BottomSheet>
			</View>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
  heroContainer: {
    height: '45%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  heroContent: {
    position: 'absolute',
    top: responsive.Dh(5),
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    maxWidth: '80%',
  },
  bottomSheetContent: {
    padding: 24,
    flex: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    paddingHorizontal: 12,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  expandButton: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});