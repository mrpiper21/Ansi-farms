import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Linking,
    Share,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/Colors";
import YouTubePlayer from "../../../components/video/youtube-card";
import { baseUrl } from "../../../config/api";
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
    'resource-details': { id: string };
  };
  
  type ResourceRouteProp = RouteProp<RootStackParamList, 'resource-details'>;
  
  interface ResourceDetailsProps {
    route: ResourceRouteProp;
  }

const ResourceDetailScreen = ({ route }: ResourceDetailsProps) => {

    const { id } = route.params;

    console.log("iddddddd----", id)

    const {
        data: resource,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["resource", id],
        queryFn: async () => {
            const response = await axios.get(`${baseUrl}/api/resource/get/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch resource");
            }
            return response.data.data;
        },
        retry: 1,
    });

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this farming resource: ${resource.title}\n${baseUrl}/resource/get/${id}`,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleOpenInBrowser = () => {
        if (resource.contentType === "video") {
            Linking.openURL(`https://www.youtube.com/watch?v=${resource.videoUrl}`);
        } else {
            Linking.openURL(resource.imageUrl);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <MaterialCommunityIcons
                    name="leaf"
                    size={48}
                    color={Colors.light.primary}
                />
                <Text style={styles.loadingText}>Loading resource...</Text>
            </View>
        );
    }

    if (!resource) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons
                    name="error-outline"
                    size={48}
                    color={Colors.light.error}
                />
                <Text style={styles.errorText}>Resource not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header with media */}
            <View style={styles.mediaContainer}>
                {resource.contentType === "video" ? (
                    <YouTubePlayer videoId={resource.videoUrl} />
                ) : (
                    <Image
                        source={{ uri: resource.imageUrl }}
                        style={styles.media}
                        resizeMode="cover"
                    />
                )}
                <LinearGradient
                    colors={["rgba(0,0,0,0.7)", "transparent"]}
                    style={styles.gradient}
                />
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                        <MaterialIcons name="share" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleOpenInBrowser}
                    >
                        <MaterialIcons
                            name="open-in-new"
                            size={24}
                            color={Colors.light.text}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content section */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <View
                        style={[
                            styles.categoryBadge,
                            { backgroundColor: Colors.light.text },
                        ]}
                    >
                        <Text
                            style={[styles.categoryText, { color: Colors.light.background }]}
                        >
                            {resource.category}
                        </Text>
                    </View>
                </View>

                <Text style={styles.title}>{resource.title}</Text>
                <Text style={styles.description}>{resource.description}</Text>

                {resource.content && (
                    <View style={styles.contentBox}>
                        <Text style={styles.contentText}>{resource.content}</Text>
                    </View>
                )}

                {/* Metadata footer */}
                <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                        <MaterialCommunityIcons
                            name={resource.contentType === "video" ? "play-circle" : "text"}
                            size={20}
                            color={Colors.light.secondary}
                        />
                        <Text style={styles.metaText}>
                            {resource.contentType === "video" ? "Video" : "Article"}
                        </Text>
                    </View>

                    {resource.duration && (
                        <View style={styles.metaItem}>
                            <MaterialIcons
                                name="access-time"
                                size={20}
                                color={Colors.light.secondary}
                            />
                            <Text style={styles.metaText}>{resource.duration}</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
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

export default ResourceDetailScreen;
