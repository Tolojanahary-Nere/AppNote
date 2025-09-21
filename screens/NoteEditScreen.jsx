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
        }
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
            Alert.alert(
              'Confirmer l\'enregistrement',
              'Voulez-vous enregistrer cette note ?',
              [
                { text: 'Annuler', style: 'cancel', onPress: () => {} },
                {
                  text: 'Confirmer',
                  onPress: handleSave,
                },
              ]
            );
          }}
        />
      ),
    });
  }, [title, navigation]);

  // Détecter les modifications
  useEffect(() => {
    setIsModified(title !== initialTitle || content !== initialContent);
  }, [title, content, initialTitle, initialContent]);

  // Gérer le retour (bouton back logiciel ou physique)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isModified) {
        return; // Laisser la navigation se faire si aucune modification
      }

      e.preventDefault();

      Alert.alert(
        'Modifications non enregistrées',
        'Voulez-vous enregistrer vos modifications avant de quitter ?',
        [
          { text: 'Annuler', style: 'cancel', onPress: () => {} },
          {
            text: 'Quitter sans enregistrer',
            style: 'destructive',
            onPress: () => navigation.navigate('NotesList'), // Naviguer directement
          },
          {
            text: 'Enregistrer',
            onPress: async () => {
              await handleSave();
              navigation.navigate('NotesList'); // Naviguer directement
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isModified, title, content, noteId, isNew]);

  // Fonction pour sauvegarder manuellement la note
  const handleSave = async () => {
    try {
      const updatedNote = { id: noteId, title, content };
      const notes = await loadNotes();
      if (isNew && !notes.find(n => n.id === noteId)) {
        await addNote(updatedNote);
      } else {
        await updateNote(updatedNote);
      }
      setIsModified(false);
      setInitialTitle(title); // Mettre à jour les valeurs initiales
      setInitialContent(content);
      navigation.navigate('NotesList'); // Naviguer vers NotesList
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'enregistrement de la note.');
      console.error(error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: 'white' }]} // Fond blanc
      contentContainerStyle={styles.contentContainer}
    >
      <TextInput
        style={[styles.title, { color: colorScheme === 'dark' ? '#333' : 'black' }]} // Texte lisible sur fond blanc
        placeholder="Titre"
        placeholderTextColor={colorScheme === 'dark' ? '#666' : '#6B7280'} // Placeholder lisible
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.content, { color: colorScheme === 'dark' ? '#333' : 'black' }]} // Texte lisible sur fond blanc
        placeholder="Contenu"
        placeholderTextColor={colorScheme === 'dark' ? '#666' : '#6B7280'} // Placeholder lisible
        value={content}
        onChangeText={setContent}
        multiline
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, backgroundColor: 'white' }, // Fond blanc pour cohérence
  content: { flex: 1, marginBottom: 16, backgroundColor: 'white' }, // Fond blanc pour cohérence
});

export default NoteEditScreen;