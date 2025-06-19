import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'

const Loader = () => {
  return (
    <View style={styles.loadingContainer}>
				<MaterialCommunityIcons
					name="leaf"
					size={48}
					color={Colors.light.primary}
				/>
				<Text style={styles.loadingText}>Loading resource...</Text>
			</View>
  )
}

export default Loader

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
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        color: Colors.light.text,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        color: Colors.light.error,
        fontSize: 16,
    },
    mediaContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        position: "relative",
    },
    media: {
        width: "100%",
        height: "100%",
    },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 100,
    },
    content: {
        padding: 16,
        paddingTop: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
        position: "absolute",
        justifyContent: "flex-start",
        left: 5,
        bottom: 5,
    },
    iconButton: {
        padding: 8,
        backgroundColor: "white",
        borderRadius: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.light.text,
        marginBottom: 12,
        lineHeight: 34,
    },
    description: {
        fontSize: 16,
        color: Colors.light.text,
        opacity: 0.9,
        marginBottom: 24,
        lineHeight: 24,
    },
    contentBox: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
    },
    contentText: {
        fontSize: 15,
        color: Colors.light.text,
        lineHeight: 24,
    },
    metaContainer: {
        flexDirection: "row",
        gap: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.light.surface,
        paddingTop: 16,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: Colors.light.secondary,
    },
});