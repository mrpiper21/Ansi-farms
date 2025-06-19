import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../constants/Colors';

const ArticleDetailsScreen = () => {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const { article } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this farming article: ${article.title}\n\n${article.excerpt}`,
        title: article.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share article');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically save to user's bookmarks
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderContent = () => {
    // Split content by markdown headers (##)
    const sections = article.content.split(/(?=^## )/m);
    
    return sections.map((section: string, index: number) => {
      const lines = section.trim().split('\n');
      const header = lines[0];
      const content = lines.slice(1).join('\n').trim();
      
      if (header.startsWith('## ')) {
        const title = header.replace('## ', '');
        return (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionContent}>{content}</Text>
          </View>
        );
      } else {
        return (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionContent}>{section}</Text>
          </View>
        );
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmarked ? Colors.light.primary : Colors.light.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />

        {/* Article Meta */}
        <View style={styles.metaContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <Text style={styles.publishDate}>{formatDate(article.publishDate)}</Text>
        </View>

        {/* Article Title */}
        <Text style={styles.articleTitle}>{article.title}</Text>

        {/* Article Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="person-circle-outline" size={16} color={Colors.light.primary} />
            <Text style={styles.statText}>{article.author}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={Colors.light.text} />
            <Text style={styles.statText}>{article.readTime}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color={Colors.light.text} />
            <Text style={styles.statText}>{article.views} views</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statText}>{article.rating}</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {article.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Article Content */}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>

        {/* Related Articles Suggestion */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Articles</Text>
          <Text style={styles.relatedSubtitle}>
            Explore more pest control and farming guides
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  articleImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  publishDate: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: Colors.light.accent_green + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: Colors.light.accent_green,
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  sectionContent: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    opacity: 0.9,
  },
  relatedSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.light.surface,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  relatedSubtitle: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
});

export default ArticleDetailsScreen; 