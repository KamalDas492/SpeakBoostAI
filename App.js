import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Record from './Screens/Record';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JosefinSans_400Regular, JosefinSans_500Medium, JosefinSans_600SemiBold, JosefinSans_700Bold, useFonts } from '@expo-google-fonts/josefin-sans';
import { Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import AudioPlayer from './Screens/AudioPlayer';


const Stack = createNativeStackNavigator();

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    JosefinSans_400Regular, 
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
    JosefinSans_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <NavigationContainer style={styles.container}>
      <Stack.Navigator>
        <Stack.Screen name="Recording" component={Record} options={{headerShown: false}}></Stack.Screen>
        {/* <Stack.Screen name="AudioPlayer" component={AudioPlayer} options={{headerShown: false}}></Stack.Screen>
       */}
      </Stack.Navigator>
      <StatusBar />
    </NavigationContainer>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  
});
