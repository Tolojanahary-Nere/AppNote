import React, { useState, useEffect } from 'react';
import { View, TextInput, ScrollView, StyleSheet, Text, useColorScheme, Button, Alert } from 'react-native';
import { loadNotes, addNote, updateNote } from '../utils/storage';

const NoteEditScreen = ({ route, navigation }) => {
  const { noteId, isNew, newNote } = route.params || {};
  const colorScheme = useColorScheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [initialTitle, setInitialTitle] = useState('');
  const [initialContent, setInitialContent] = useState('');

  // Vérifier les paramètres de navigation
  useEffect(() => {
    if (!route.params || !noteId) {
      Alert.alert('Erreur', 'Paramètres de navigation manquants.', [
        { text: 'OK', onPress: () => navigation.navigate('NotesList') },
      ]);
    }
  }, [route.params, noteId, navigation]);

  // Charger la note existante ou la nouvelle
  useEffect(() => {
    const loadNote = async () => {
      try {
        const notes = await loadNotes();
        if (isNew && newNote) {
          setTitle(newNote.title || '');
          setContent(newNote.content || '');
          setInitialTitle(newNote.title || '');
          setInitialContent(newNote.content || '');
        } else {
          const note = notes.find(n => n.id === noteId);
          if (note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setInitialTitle(note.title || '');
            setInitialContent(note.content || '');
          } else {
            console.warn('Note not found for ID:', noteId);
          }
        }
        console.log('Loaded note - title:', title, 'content:', content);
      } catch (error) {
        console.error('Error loading note:', error);
        Alert.alert('Erreur', 'Échec du chargement de la note.');
      }
    };
    loadNote();
  }, [noteId, isNew, newNote]);

  // Mettre à jour le titre de l'écran
  useEffect(() => {
    navigation.setOptions({
      headerTitle: title || 'Nouvelle Note',
      headerRight: () => (
        <Button
          title="Enregistrer"
          onPress={() => {
            console.log('Before save alert - title:', title, 'content:', content);
            Alert.alert(
              'Confirmer l\'enregistrement',
              'Voulez-vous enregistrer cette note ?',
              [
                { text: 'Annuler', style: 'cancel', onPress: () => {} },
                {
                  text: 'Confirmer',
                  onPress: () => handleSave(title, content), // Passer title et content
                },
              ]
            );
          }}
        />
      ),
    });
  }, [title, content, navigation]); // Ajout de content comme dépendance

  // Détecter les modifications
  useEffect(() => {
    setIsModified(title !== initialTitle || content !== initialContent);
    console.log('Modification check - title:', title, 'content:', content);
  }, [title, content, initialTitle, initialContent]);

  // Détecter les changements de content
  useEffect(() => {
    console.log('Content state changed:', content);
  }, [content]);

  // Gérer le retour (bouton back logiciel ou physique)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isModified) {
        return;
      }

      e.preventDefault();

      console.log('Before remove - title:', title, 'content:', content);
      Alert.alert(
        'Modifications non enregistrées',
        'Voulez-vous enregistrer vos modifications avant de quitter ?',
        [
          { text: 'Annuler', style: 'cancel', onPress: () => {} },
          {
            text: 'Quitter sans enregistrer',
            style: 'destructive',
            onPress: () => navigation.navigate('NotesList'),
          },
          {
            text: 'Enregistrer',
            onPress: () => handleSave(title, content), // Passer title et content
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isModified, title, content, noteId, isNew]);

  // Fonction pour sauvegarder manuellement la note
  const handleSave = async (saveTitle, saveContent) => {
    try {
      console.log('Saving note:', { id: noteId, title: saveTitle, content: saveContent });
      const updatedNote = { id: noteId, title: saveTitle, content: saveContent };
      const notes = await loadNotes();
      console.log('Current notes before save:', notes);
      if (isNew && !notes.find(n => n.id === noteId)) {
        await addNote(updatedNote);
      } else {
        await updateNote(updatedNote);
      }
      const updatedNotes = await loadNotes();
      console.log('Notes after save:', updatedNotes);
      setIsModified(false);
      setInitialTitle(saveTitle);
      setInitialContent(saveContent);
      navigation.navigate('NotesList');
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Erreur', 'Échec de l\'enregistrement de la note.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: 'white' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <TextInput
        style={[styles.title, { color: colorScheme === 'dark' ? '#333' : 'black' }]}
        placeholder="Titre"
        placeholderTextColor={colorScheme === 'dark' ? '#666' : '#6B7280'}
        value={title}
        onChangeText={(text) => {
          console.log('Title updated:', text);
          setTitle(text);
        }}
      />
      <TextInput
        style={[styles.content, { color: colorScheme === 'dark' ? '#333' : 'black' }]}
        placeholder="Contenu"
        placeholderTextColor={colorScheme === 'dark' ? '#666' : '#6B7280'}
        value={content}
        onChangeText={(text) => {
          console.log('Content updated:', text);
          setContent(text);
        }}
        onEndEditing={(e) => {
          console.log('Content editing ended:', e.nativeEvent.text);
          setContent(e.nativeEvent.text); // Verrouiller la valeur
        }}
        multiline
        textAlignVertical="top"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, backgroundColor: 'white' },
  content: { flex: 1, marginBottom: 16, backgroundColor: 'white', minHeight: 200 },
});

export default NoteEditScreen;