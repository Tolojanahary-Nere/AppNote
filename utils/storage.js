import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = '@notes';

export const loadNotes = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
    const notes = jsonValue != null ? JSON.parse(jsonValue) : [];
    return notes.map((note) => ({
      ...note,
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
    const jsonValue = JSON.stringify(notes);
    await AsyncStorage.setItem(NOTES_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving notes:', e);
  }
};

export const addNote = async (newNote) => {
  const notes = await loadNotes();
  if (notes.find((note) => note.id === newNote.id)) {
    console.warn('Note with ID already exists:', newNote.id);
    return;
  }
  await saveNotes([...notes, newNote]);
};

export const updateNote = async (updatedNote) => {
  const notes = await loadNotes();
  const updatedNotes = notes.map((note) =>
    note.id === updatedNote.id ? updatedNote : note
  );
  await saveNotes(updatedNotes);
};

export const deleteNote = async (id) => {
  const notes = await loadNotes();
  const filteredNotes = notes.filter((note) => note.id !== id);
  await saveNotes(filteredNotes);
};