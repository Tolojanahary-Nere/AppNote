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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import { loadNotes } from '../utils/storage';
import NoteCard from '../components/NoteCard';

const NotesListScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = async () => {
    const loadedNotes = await loadNotes();
    setNotes(loadedNotes);
    setFilteredNotes(loadedNotes);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = notes.filter(
      note =>
        (note.title || '').toLowerCase().includes(lowerQuery) ||
        (note.content || '').toLowerCase().includes(lowerQuery)
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

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

  return (
    <ImageBackground
      source={require('../assets/default-bg.jpg')}
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
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // ajuste l'opacité si nécessaire
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
  addButtonText: {
    color: 'white',
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
  },
});

export default NotesListScreen;
