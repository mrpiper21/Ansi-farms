import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../../../store/auth-store';
import { Colors } from '../../../constants/Colors';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '../../../components/ui/IconSymbol';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
	const { logout, user } = useAuthStore((state) => state);
	const navigation = useNavigation() as any;
	//TODO
	const isFarmer = user?.type === "farmer";
	const colorScheme = useColorScheme();
	const theme = Colors[colorScheme ?? "light"];

	const handleLogout = async () => {
		await logout();
		await AsyncStorage.clear();
		navigation.navigate("AuthNavigator", {
			screen: "loginScreen",
		});
	};

	if (!user) return null;

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			{/* Gradient Header */}
			<LinearGradient
				colors={[isFarmer ? theme.secondary : theme.primary, theme.background]}
				locations={[0, 0.6]}
				style={styles.header}
			>
				<BlurView intensity={30} style={styles.profileHeader}>
					{user.profilePicture ? (
						<Image
							source={{ uri: user.profilePicture }}
							style={styles.avatar}
						/>
					) : (
						<View style={[styles.avatar, { backgroundColor: theme.surface }]}>
							<IconSymbol name="person.fill" size={40} color={theme.text} />
						</View>
					)}
					<Text style={[styles.name, { color: theme.text }]}>
						{user.userName}
					</Text>
					<View style={[styles.userType, { backgroundColor: theme.surface }]}>
						<Text
							style={[
								styles.userTypeText,
								{ color: isFarmer ? theme.secondary : theme.primary },
							]}
						>
							{user.type.toUpperCase()}
						</Text>
					</View>
				</BlurView>
			</LinearGradient>

			{/* Stats Cards */}
			{user.type == "farmer" && (
				<View style={styles.statsContainer}>
					<StatCard
						icon="leaf.fill"
						value="12"
						label="Active Crops"
						color={theme.primary}
					/>
					<StatCard
						icon="star.fill"
						value="4.9"
						label="Rating"
						color={theme.accent}
					/>
				</View>
			)}

			{/* Profile Details */}
			<View
				style={[
					styles.detailsCard,
					{
						backgroundColor: theme.surface,
						borderWidth: 1,
						borderColor: "lightgray",
					},
				]}
			>
				<View style={{ gap: 4 }}>
					<Text style={{ fontSize: 20, fontWeight: "600" }}>Email Address</Text>
					<DetailRow icon="envelope.fill" value={user.email} />
				</View>
				{user.phoneNumber && (
					<View>
						<DetailRow icon="phone.fill" value={user.phoneNumber} />
					</View>
				)}
				<View style={{ gap: 4 }}>
					<Text style={{ fontSize: 20, fontWeight: "600" }}>Home Location</Text>
					{user.location && <DetailRow icon="map.fill" value={user.location} />}
				</View>
			</View>

			{/* Logout Button */}
			<TouchableOpacity
				style={[
					styles.logoutButton,
					{
						backgroundColor: theme.surface,
						borderWidth: 1,
						borderColor: "lightgray",
					},
				]}
				onPress={handleLogout}
			>
				<IconSymbol
					name="arrow.right.square.fill"
					size={24}
					color={theme.error}
				/>
				<Text style={[styles.logoutText, { color: theme.error }]}>
					Sign Out
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const StatCard = ({ icon, value, label, color }: any) => (
	<View
		style={[
			styles.statCard,
			{
				backgroundColor: color + "15",
				borderWidth: 1,
				borderColor: "lightgray",
			},
		]}
	>
		<IconSymbol name={icon} size={28} color={color} />
		<Text style={[styles.statValue, { color }]}>{value}</Text>
		<Text style={styles.statLabel}>{label}</Text>
	</View>
);

const DetailRow = ({ icon, value }: any) => {
	const theme = Colors[useColorScheme() ?? "light"];

	return (
		<View style={styles.detailRow}>
			<IconSymbol name={icon} size={20} color={theme.primary} />
			<Text style={[styles.detailText, { color: theme.text }]}>{value}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		height: 300,
		paddingTop: 60,
	},
	profileHeader: {
		alignItems: "center",
		padding: 20,
		borderRadius: 30,
		overflow: "hidden",
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		marginBottom: 15,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: "rgba(255,255,255,0.2)",
	},
	name: {
		fontSize: 26,
		fontWeight: "600",
		marginBottom: 8,
		letterSpacing: 0.5,
	},
	userType: {
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 20,
		marginTop: 8,
	},
	userTypeText: {
		fontSize: 13,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginTop: -40,
		marginBottom: 20,
	},
	statCard: {
		width: "48%",
		padding: 16,
		borderRadius: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
	},
	statValue: {
		fontSize: 24,
		fontWeight: "700",
		marginVertical: 8,
	},
	statLabel: {
		fontSize: 12,
		fontWeight: "500",
		opacity: 0.8,
	},
	detailsCard: {
		marginHorizontal: 20,
		borderRadius: 20,
		padding: 24,
		marginBottom: 20,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 18,
		gap: 12,
	},
	detailText: {
		fontSize: 16,
		flex: 1,
	},
	progressContainer: {
		marginTop: 16,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 12,
		opacity: 0.8,
	},
	progressBar: {
		height: 6,
		borderRadius: 3,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: 3,
	},
	progressText: {
		fontSize: 12,
		marginTop: 8,
		opacity: 0.8,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
		marginHorizontal: 20,
		padding: 16,
		borderRadius: 30,
		marginBottom: 40,
	},
	logoutText: {
		fontSize: 16,
		fontWeight: "600",
	},
});

export default ProfileScreen;