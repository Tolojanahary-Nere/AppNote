import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = '@notes';

export const loadNotes = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
    const notes = jsonValue != null ? JSON.parse(jsonValue) : [];
    return notes.map((note) => ({
      id: note.id || '',
      title: note.title || '',
      content: note.content || '', // Assurer que content est toujours défini
      images: note.images || [],
      backgroundImage: note.backgroundImage || null,
    }));
  } catch (e) {
    console.error('Error loading notes:', e);
    return [];
  }
};

export const saveNotes = async (notes) => {
  try {
    console.log('Saving notes to AsyncStorage:', notes); // Debug: vérifier données sauvegardées
    const jsonValue = JSON.stringify(notes);
    await AsyncStorage.setItem(NOTES_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving notes:', e);
  }
};

export const addNote = async (newNote) => {
  try {
    const notes = await loadNotes();
    if (notes.find((note) => note.id === newNote.id)) {
      console.warn('Note with ID already exists:', newNote.id);
      return;
    }
    const updatedNotes = [...notes, { ...newNote, content: newNote.content || '' }];
    await saveNotes(updatedNotes);
  } catch (e) {
    console.error('Error adding note:', e);
  }
};

export const updateNote = async (updatedNote) => {
  try {
    const notes = await loadNotes();
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id ? { ...updatedNote, content: updatedNote.content || '' } : note
    );
    await saveNotes(updatedNotes);
  } catch (e) {
    console.error('Error updating note:', e);
  }
};

export const deleteNote = async (id) => {
  try {
    const notes = await loadNotes();
    const filteredNotes = notes.filter((note) => note.id !== id);
    await saveNotes(filteredNotes);
  } catch (e) {
    console.error('Error deleting note:', e);
  }
};