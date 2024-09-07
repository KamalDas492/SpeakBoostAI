import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const intervalRef = useRef(null); // Reference for the interval

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => Math.max(prevTime - 100, 0));
        console.log(timeLeft);
        
      }, 100);
    }

    if (timeLeft === 0 || !isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, timeLeft]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access microphone is required.');
        return;
      }

      recordingRef.current = new Audio.Recording();
      await recordingRef.current.prepareToRecordAsync(Audio.RecordingOptionsPresets.QUALITY_HIGH);
      await recordingRef.current.startAsync();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const { sound, status } = await recordingRef.current.createNewLoadedSoundAsync();
        setTimeLeft(status.durationMillis);
        setAudioUri(recordingRef.current.getURI());
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const clearRecording = () => {
    setAudioUri(null);
    setIsPlaying(false);
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    clearInterval(intervalRef.current); // Clear the interval when clearing recording
  };

  const playSound = async () => {
    if(timeLeft === 0) return;
    try {
      if (soundRef.current && !isPlaying) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        if(timeLeft > 0) {
          console.log("play now....");
        } else {
          console.log("alreday finished man!...");
          
        }
        
      } else if (audioUri) {
        const { sound: newSound, status } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });
        
        await newSound.setProgressUpdateIntervalAsync(20);
        newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
          if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
            setIsPlaying(false);
            setTimeLeft(0);
          }
        });

        soundRef.current = newSound;
        setIsPlaying(true);
      } else {
        console.error('Audio URI is not available');
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const pauseSound = async () => {
    if (soundRef.current && isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      clearInterval(intervalRef.current); // Clear the interval when pausing
      console.log("pausing", timeLeft);
      
    }
  };

  return (
    <View style={styles.RecordingPage}>
      <Text style={styles.appTitle}>speakboost.ai</Text>

      {!audioUri && (
        <View style={styles.bgMic}>
          <FontAwesome6 name="microphone" size={0.36 * width} style={styles.micIcon} />
        </View>
      )}

      {audioUri && (
        <View>
          {!isPlaying ? (
            <Pressable onPress={playSound}>
              <FontAwesome6 name="circle-play" size={0.45 * width} color={timeLeft === 0 ? "#41b3a266" : "#41B3A2"} style={styles.playBtn} />
            </Pressable>
          ) : (
            <Pressable onPress={pauseSound}>
              <FontAwesome6 name="circle-pause" size={0.45 * width} color="#41B3A2" style={styles.playBtn} />
            </Pressable>
          )}
        </View>
      )}

      {isRecording ? (
        <Pressable style={styles.clearRecordBtn} onPress={stopRecording}>
          <Text style={styles.clearBtnText}>Stop Recording</Text>
        </Pressable>
      ) : (
        !audioUri && (
          <Pressable style={styles.recordBtn} onPress={startRecording}>
            <Text style={styles.btnText}>Start Recording</Text>
          </Pressable>
        )
      )}

      {audioUri && (
        <View>
          <Pressable style={styles.recordBtn} onPress={() => console.log(audioUri)}>
            <Text style={styles.btnText}>Process Recording</Text>
          </Pressable>
          <Pressable style={styles.clearRecordBtn} onPress={clearRecording}>
            <Text style={styles.clearBtnText}>Clear Recording</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  micIcon: { color: '#fff' },
  bgMic: {
    backgroundColor: '#41B3A2',
    width: 0.5 * width,
    height: 0.5 * width,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0.5 * width,
    marginTop: 0.22 * height,
    marginBottom: 0.18 * height,
  },
  playBtn: { marginTop: 0.22 * height, marginBottom: 0.18 * height },
  recordBtn: {
    alignItems: 'center',
    width: 0.45 * width,
    backgroundColor: '#41B3A2',
    paddingVertical: 0.017 * height,
    borderRadius: 0.2 * width,
    borderColor: '#41B3A2',
    borderWidth: 2,
  },
  btnText: { fontSize: 0.04 * width, color: '#fff', fontFamily: 'Nunito_500Medium' },
  RecordingPage: { alignItems: 'center', backgroundColor: '#E1F7F5', minHeight: height },
  appTitle: { fontFamily: 'JosefinSans_700Bold', marginTop: 0.02 * height, fontSize: 0.1 * width, color: '#0D7C66' },
  clearRecordBtn: {
    alignItems: 'center',
    width: 0.45 * width,
    borderColor: '#41B3A2',
    paddingVertical: 0.017 * height,
    borderRadius: 0.2 * width,
    borderWidth: 2,
    marginTop: 0.012 * height,
  },
  clearBtnText: { fontSize: 0.04 * width, color: '#41B3A2', fontFamily: 'Nunito_600SemiBold' },
});

export default Record;
