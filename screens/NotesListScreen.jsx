import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  ImageBackground,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker'; // Importer expo-image-picker
import AsyncStorage from '@react-native-async-storage/async-storage'; // Pour stocker l'image
import { loadNotes } from '../utils/storage';
import NoteCard from '../components/NoteCard';

const NotesListScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(require('../assets/default-bg.jpg')); // Image par défaut

  // Charger les notes
  const fetchNotes = async () => {
    const loadedNotes = await loadNotes();
    setNotes(loadedNotes);
    setFilteredNotes(loadedNotes);
  };

  // Charger l'image de fond depuis AsyncStorage
  const loadBackgroundImage = async () => {
    try {
      const storedImageUri = await AsyncStorage.getItem('backgroundImage');
      if (storedImageUri) {
        setBackgroundImage({ uri: storedImageUri });
      } else {
        setBackgroundImage(require('../assets/default-bg.jpg')); // Image par défaut
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image de fond:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
      loadBackgroundImage(); // Charger l'image à chaque focus
    }, [])
  );

  // Filtrer les notes en fonction de la recherche
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = notes.filter(
      note =>
        (note.title || '').toLowerCase().includes(lowerQuery) ||
        (note.content || '').toLowerCase().includes(lowerQuery)
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  // Créer une nouvelle note
  const handleAddNote = async () => {
    try {
      const id = await Crypto.randomUUID();
      const newNote = { id, title: '', content: '', images: [], backgroundImage: null };
      navigation.navigate('NoteEdit', { noteId: id, isNew: true, newNote });
    } catch (e) {
      const id = Date.now().toString();
      const newNote = { id, title: '', content: '', images: [], backgroundImage: null };
      navigation.navigate('NoteEdit', { noteId: id, isNew: true, newNote });
    }
  };

  // Changer l'image de fond
  const handleChangeBackground = async () => {
    // Demander la permission d'accéder à la galerie
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour changer l\'image de fond.');
      return;
    }

    // Lancer le sélecteur d'image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      try {
        await AsyncStorage.setItem('backgroundImage', imageUri); // Stocker l'URI
        setBackgroundImage({ uri: imageUri }); // Mettre à jour l'image
      } catch (error) {
        Alert.alert('Erreur', 'Échec de l\'enregistrement de l\'image de fond.');
        console.error(error);
      }
    }
  };

  return (
    <ImageBackground
      source={backgroundImage} // Utiliser l'image dynamique
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay semi-transparent pour lisibilité */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colorScheme === 'dark' ? '#222' : '#fff',
              color: colorScheme === 'dark' ? 'white' : 'black',
            },
          ]}
          placeholder="Rechercher par titre ou contenu..."
          placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredNotes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NoteCard note={item} onDelete={fetchNotes} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        {/* Bouton pour changer l'image de fond */}
        <TouchableOpacity
          style={[styles.addButton, styles.changeBackgroundButton]}
          onPress={handleChangeBackground}
        >
          <Text style={styles.addButtonText}>🖼️</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // Ajuste l'opacité si nécessaire
  },
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  changeBackgroundButton: {
    bottom: 88, // Positionner au-dessus du bouton d'ajout
    backgroundColor: '#10b981', // Couleur différente pour distinction
  },
  addButtonText: {
    color: 'white',
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
  },
});

export default NotesListScreen;