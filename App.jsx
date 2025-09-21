import React from 'react';
import { ImageBackground, StyleSheet, View, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NotesListScreen from './screens/NotesListScreen';
import NoteEditScreen from './screens/NoteEditScreen';

const Stack = createStackNavigator();

const App = () => {
  const scheme = useColorScheme();

  return (
    <ImageBackground
      source={require('./assets/default-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay semi-transparent pour lisibilité du texte */}
      <View style={styles.overlay} />

      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
            headerTintColor: 'white',
            cardStyle: { opacity: 1, backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="NotesList" component={NotesListScreen} options={{ title: 'Mes Notes' }} />
          <Stack.Screen name="NoteEdit" component={NoteEditScreen} options={{ title: 'Note' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // Ajuste l'opacité selon tes besoins
  },
});

export default App;
