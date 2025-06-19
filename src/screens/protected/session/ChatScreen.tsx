import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert
} from 'react-native';
import { useChat } from '../../../context/chatContext';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { baseUrl } from '../../../config/api';
import axios from 'axios';
import useAuthStore from '../../../store/auth-store';

type RootFarmersParamList = {
  "chat-screen": { chatId: string; receiverId: string };
};

type FarmersDetailsRouteProp = RouteProp<RootFarmersParamList, "chat-screen">;

interface Props {
  route: FarmersDetailsRouteProp;
}

const formatTime = (dateString: string | Date) => {
	try {
		const date =
			typeof dateString === "string" ? new Date(dateString) : dateString;
		if (isNaN(date.getTime())) {
			return "";
		}
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch (e) {
		console.error("Error formatting date:", e, dateString);
		return "";
	}
};

const ChatScreen = ({ route }: Props) => {
	const { socket } = useChat();
	const [messages, setMessages] = useState<any[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const { chatId, receiverId: rId } = route.params;
	const { user } = useAuthStore((state) => state);
	const { activeChats } = useChat();
	const navigation = useNavigation() as any;

	const foundChat = activeChats.find((item) => item._id === chatId);
	const receiver = foundChat?.participants.find(
		(participant: any) => participant._id !== user?.id
	);
	const receiverId = receiver?._id ?? rId;

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await axios.get(
					`${baseUrl}/api/chats/${chatId}/${user?.id}/messages`
				);
				const data = await response.data;

				const sortedMessages = data.messages
					.map((msg: any) => ({
						...msg,
						// Ensure we have a valid date object
						createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
						timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
					}))
					.sort(
						(a: any, b: any) =>
							(a.timestamp || a.createdAt).getTime() -
							(b.timestamp || b.createdAt).getTime()
					);

				setMessages(sortedMessages);
			} catch (error) {
				console.error("Error fetching messages:", error);
			}
		};

		fetchMessages();

		// Socket listener remains the same
		const handleNewMessage = (message: any) => {
			if (message.chatId === chatId) {
				setMessages((prev) => [
					...prev,
					{
						...message,
						timestamp: message.timestamp
							? new Date(message.timestamp)
							: new Date(),
						createdAt: message.createdAt
							? new Date(message.createdAt)
							: new Date(),
					},
				]);
			}
		};

		socket?.on("newMessage", handleNewMessage);

		return () => {
			socket?.off("newMessage", handleNewMessage);
		};
	}, [chatId]);

	const sendMessage = async () => {
		if (!socket) {
			Alert.alert("Error", "Socket connection not established");
			return;
		}

		const tempId = Date.now().toString();
		const tempMessage = {
			_id: tempId,
			content: newMessage,
			sender: user?.id,
			createdAt: new Date(),
			read: false,
			chatId,
		};

		setMessages((prev) => [...prev, tempMessage]);
		setNewMessage("");

		try {
			socket.emit("sendMessage", {
				content: newMessage,
				chatId,
				senderId: user?.id,
				receiverId,
			});
		} catch (error) {
			console.error("Error sending message:", error);
			setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
		}
	};

	const formatTime = (date: Date) => {
		try {
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			console.error("Error formatting date:", e);
			return "";
		}
	};

	const renderMessage = ({ item }: { item: any }) => {
		// Ensure createdAt is a Date object
		const messageDate =
			item.createdAt instanceof Date
				? item.createdAt
				: new Date(item.createdAt);

		return (
			<View
				style={[
					styles.messageContainer,
					item.sender === user?.id
						? styles.userMessageContainer
						: styles.otherMessageContainer,
				]}
			>
				<View
					style={[
						styles.messageBubble,
						item.sender === user?.id ? styles.userBubble : styles.otherBubble,
					]}
				>
					<Text
						style={[
							styles.messageText,
							item.sender === user?.id
								? styles.userMessageText
								: styles.otherMessageText,
						]}
					>
						{item.content}
					</Text>
					<View style={styles.messageMeta}>
						<Text
							style={[
								styles.timeText,
								item.sender === user?.id
									? styles.userTimeText
									: styles.otherTimeText,
							]}
						>
							{formatTime(item.timestamp || item.createdAt)}
						</Text>
						{item.sender === user?.id && (
							<Ionicons
								name={item.read ? "checkmark-done" : "checkmark"}
								size={14}
								color={"white"}
								style={styles.statusIcon}
							/>
						)}
					</View>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
				</TouchableOpacity>
				<View style={styles.headerInfo}>
					<Text style={styles.receiverName}>
						{receiver?.userName || "User"}
					</Text>
					<Text style={styles.onlineStatus}>
						{receiver?.type?.toUpperCase()}
					</Text>
				</View>
			</View>

			{/* Chat Messages */}
			<FlatList
				data={messages}
				renderItem={renderMessage}
				keyExtractor={(item) => item._id}
				contentContainerStyle={styles.messagesContainer}
				inverted={false}
				showsVerticalScrollIndicator={false}
			/>

			{/* Input Area */}
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
				style={styles.inputContainer}
			>
				<TextInput
					style={styles.input}
					value={newMessage}
					onChangeText={setNewMessage}
					placeholder="Type a message..."
					placeholderTextColor={Colors.light.text}
					multiline
				/>
				<TouchableOpacity
					style={styles.sendButton}
					onPress={sendMessage}
					disabled={!newMessage.trim()}
				>
					<Ionicons
						name="send"
						size={24}
						color={newMessage.trim() ? Colors.light.primary : Colors.light.text}
					/>
				</TouchableOpacity>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "lightgrey",
		backgroundColor: Colors.light.surface,
	},
	headerInfo: {
		marginLeft: 16,
		gap: 5,
	},
	receiverName: {
		fontSize: 18,
		fontWeight: "600",
		color: Colors.light.text,
	},
	onlineStatus: {
		fontSize: 14,
		color: Colors.light.text,
	},
	messagesContainer: {
		paddingHorizontal: 16,
		paddingBottom: 16,
		paddingTop: 8,
	},
	messageContainer: {
		flexDirection: "row",
		marginVertical: 8,
	},
	userMessageContainer: {
		justifyContent: "flex-end",
	},
	otherMessageContainer: {
		justifyContent: "flex-start",
	},
	messageBubble: {
		maxWidth: "80%",
		padding: 12,
		borderRadius: 16,
	},
	userBubble: {
		backgroundColor: Colors.light.primary,
		borderBottomRightRadius: 4,
	},
	otherBubble: {
		backgroundColor: Colors.light.surface,
		borderBottomLeftRadius: 4,
	},
	messageText: {
		fontSize: 16,
		lineHeight: 22,
	},
	userMessageText: {
		color: Colors.light.surface,
	},
	otherMessageText: {
		color: Colors.light.text,
	},
	messageMeta: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		marginTop: 4,
	},
	timeText: {
		fontSize: 12,
	},
	userTimeText: {
		color: Colors.light.surface,
		opacity: 0.8,
	},
	otherTimeText: {
		color: Colors.light.text,
	},
	statusIcon: {
		marginLeft: 4,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		backgroundColor: Colors.light.surface,
		borderTopWidth: 1,
		borderTopColor: "lightgrey",
	},
	input: {
		flex: 1,
		backgroundColor: Colors.light.background,
		borderRadius: 24,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: Colors.light.text,
		maxHeight: 120,
	},
	sendButton: {
		marginLeft: 12,
		padding: 10,
	},
});

export default ChatScreen;