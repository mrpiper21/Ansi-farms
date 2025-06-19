import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

const VideoPlayer = ({ uri, thumbnail, duration }: { 
  uri: string; 
  thumbnail: string; 
  duration: string 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  // Initialize video player
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.play();
  });

  // Update playing state
  useEffect(() => {
    const subscription = player.addListener('playingChange', ({ isPlaying }) => {
      setIsPlaying(isPlaying);
      if (isPlaying) setShowPoster(false);
    });
    return () => subscription.remove();
  }, [player]);

  return (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        // posterSource={showPoster ? { uri: thumbnail } : undefined}
      />
      
      {/* Custom Play/Pause Overlay */}
      {!isPlaying && (
        <TouchableOpacity 
          style={styles.videoOverlay}
          onPress={() => player.play()}
          activeOpacity={0.9}
        >
          <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      )}
      
      {/* Duration Badge */}
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{duration}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  video: {
    flex: 1,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
  },
});

export default VideoPlayer;