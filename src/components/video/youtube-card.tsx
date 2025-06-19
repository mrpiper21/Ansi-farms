// components/YouTubePlayer.tsx
import YoutubePlayer from 'react-native-youtube-iframe';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';

const YouTubePlayer = ({ videoId }: { videoId: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <View style={styles.videoContainer}>
      <YoutubePlayer
        height={300}
        play={isPlaying}
        videoId={videoId}
        onChangeState={(event: string) => {
          if (event === 'playing') {
            setIsPlaying(true);
            setShowOverlay(false);
          } else {
            setIsPlaying(false);
            setShowOverlay(true);
          }
        }}
        webViewProps={{
          allowsFullscreenVideo: true,
          allowsInlineMediaPlayback: true,
        }}
      />

      {/* {showOverlay && (
        <TouchableOpacity 
          style={styles.videoOverlay}
          onPress={togglePlayback}
          activeOpacity={0.9}
        >
          <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      )} */}
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
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export default YouTubePlayer;