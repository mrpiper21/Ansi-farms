import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
	SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "../../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useChat } from "../../../context/chatContext";
import { useNavigation } from "@react-navigation/native";
import { baseUrl } from "../../../config/api";
import axios from "axios";
import useAuthStore from "../../../store/auth-store";
import { Ionicons } from "@expo/vector-icons";

const SessionScreen = () => {
	const [activeTab, setActiveTab] = useState("chat");
	const { user } = useAuthStore((state) => state);
	const { activeChats, markAsRead, setActiveChats } = useChat();
	const [loading, setLoading] = useState(true);
	const navigation = useNavigation() as any;

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const response = await axios.get(
					`${baseUrl}/api/chats/all/${user?.id}`
				);
				const data = await response.data;
				setActiveChats(data);
			} catch (error) {
				console.error("Error fetching chats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchChats();
	}, []);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.light.primary} />
				<Text style={styles.loadingText}>Loading conversations...</Text>
			</View>
		);
	}

	console.log(JSON.stringify(activeChats));

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Messages</Text>
				{/* <TouchableOpacity style={styles.newChatButton}>
					<Ionicons name="add" size={24} color={Colors.light.primary} />
				</TouchableOpacity> */}
			</View>

			{/* Tab Bar */}
			{/* <View style={styles.tabBar}>
				<TouchableOpacity
					style={[
						styles.tabButton,
						activeTab === "chat" && styles.activeTabButton,
					]}
					onPress={() => setActiveTab("chat")}
				>
					<Text
						style={[
							styles.tabButtonText,
							activeTab === "chat" && styles.activeTabButtonText,
						]}
					>
						Chats
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.tabButton,
						activeTab === "orders" && styles.activeTabButton,
					]}
					onPress={() => setActiveTab("orders")}
				>
					<Text
						style={[
							styles.tabButtonText,
							activeTab === "orders" && styles.activeTabButtonText,
						]}
					>
						Orders
					</Text>
				</TouchableOpacity>
			</View> */}

			{/* Chat List */}
			<FlatList
				data={activeChats}
				keyExtractor={(item) => item._id}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() => {
							markAsRead(item._id);
							navigation.navigate("dynamicNavigator", {
								params: { chatId: item._id },
								screen: "chat-screen",
							});
						}}
						style={styles.chatItem}
					>
						<View style={styles.avatarContainer}>
							<View style={styles.avatarText}>
								<Text
									style={{
										color: Colors.light.surface,
										fontSize: 24,
										fontWeight: "600",
										textAlign: "center",
										textAlignVertical: "center",
									}}
								>
									{item.participants[1].userName.charAt(0) +
										item.participants[1].userName.charAt(1)}
								</Text>
							</View>
							{item.unreadCount > 0 && (
								<View style={styles.unreadBadge}>
									<Text style={styles.unreadCount}>{item.unreadCount}</Text>
								</View>
							)}
						</View>

						<View style={styles.chatContent}>
							<View style={styles.chatHeader}>
								<Text style={styles.chatName}>
									{item.participants[1].userName}
								</Text>
								<Text style={styles.chatTime}>
									{new Date(item.updatedAt).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</Text>
							</View>
							<Text
								style={[
									styles.chatMessage,
									item.unreadCount > 0 && styles.unreadMessage,
								]}
								numberOfLines={1}
							>
								{item.lastMessage?.content || "New chat"}
							</Text>
						</View>
					</TouchableOpacity>
				)}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons
							name="chatbubbles-outline"
							size={64}
							color={Colors.light.text}
						/>
						<Text style={styles.emptyStateText}>No conversations yet</Text>
					</View>
				}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.background,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.light.background,
	},
	loadingText: {
		marginTop: 16,
		color: Colors.light.text,
		fontSize: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
		backgroundColor: Colors.light.background,
		borderBottomWidth: 1,
		borderBottomColor: Colors.light.text,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: Colors.light.primary,
	},
	newChatButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: Colors.light.accent,
	},
	tabBar: {
		flexDirection: "row",
		marginHorizontal: 16,
		marginTop: 8,
		borderRadius: 12,
		backgroundColor: Colors.light.surface,
		overflow: "hidden",
	},
	tabButton: {
		flex: 1,
		paddingVertical: 14,
		alignItems: "center",
		backgroundColor: "transparent",
	},
	activeTabButton: {
		backgroundColor: Colors.light.primary,
	},
	tabButtonText: {
		fontSize: 16,
		fontWeight: "500",
		color: Colors.light.text,
	},
	activeTabButtonText: {
		color: Colors.light.surface,
	},
	listContent: {
		// paddingHorizontal: 16,
		// paddingTop: 16,
	},
	chatItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		// marginBottom: 12,
		borderBottomWidth: 0.5,
		borderColor: "lightgray",
		backgroundColor: "white",
	},
	avatarContainer: {
		position: "relative",
		marginRight: 16,
	},
	avatarText: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: Colors.light.secondary,
		alignItems: "center",
		justifyContent: "center",
	},
	unreadBadge: {
		position: "absolute",
		top: -4,
		right: -4,
		backgroundColor: Colors.light.accent,
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: Colors.light.surface,
	},
	unreadCount: {
		color: Colors.light.surface,
		fontSize: 12,
		fontWeight: "700",
	},
	chatContent: {
		flex: 1,
	},
	chatHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	chatName: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.light.text,
	},
	chatTime: {
		fontSize: 12,
		color: Colors.light.text,
	},
	chatMessage: {
		fontSize: 14,
		color: Colors.light.text,
	},
	unreadMessage: {
		color: Colors.light.text,
		fontWeight: "500",
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 100,
	},
	emptyStateText: {
		marginTop: 16,
		fontSize: 18,
		color: Colors.light.text,
	},
});

export default SessionScreen;
