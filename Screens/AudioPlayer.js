import React, { useState, useEffect } from 'react';
import { View, Button } from 'react-native';
import { Audio } from 'expo-av';

const AudioPlayer = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Cleanup function to unload sound on component unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayPause = async () => {
    if (sound === null) {
      // Load the sound if not already loaded
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/test.mp3'), // Replace with your audio file path
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false); // Reset to play button when audio finishes
          console.log('finished');
          
        }
      });
    } else {
      // Toggle between play and pause
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false); // Ensure button is reset to play when audio finishes
          }
        });
      }
    }
  };

  return (
    <View>
      <Button
        title={isPlaying ? 'Pause' : 'Play'}
        onPress={handlePlayPause}
      />
    </View>
  );
};

export default AudioPlayer;
