import React from 'react';
import { Text, View, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { deleteNote } from '../utils/storage';

const NoteCard = ({ note, onDelete }) => {
  const navigation = useNavigation();

  const handleDelete = () => {
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer cette note ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            await deleteNote(note.id);
            onDelete();
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('NoteEdit', { noteId: note.id })}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{note.title || 'Sans titre'}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.delete}>❌</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.content} numberOfLines={2}>
        {note.content}
      </Text>
      {note.images && note.images.length > 0 && (
        <Image
          source={{ uri: note.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    margin: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  deleteButton: {
    padding: 8, // augmente la zone cliquable
    justifyContent: 'center',
    alignItems: 'center',
  },
  delete: {
    fontSize: 28, // icône plus grande
    color: 'red',
  },
  content: {
    color: 'gray',
    marginTop: 8,
  },
  image: {
    width: 64,
    height: 64,
    marginTop: 8,
    borderRadius: 8,
  },
});

export default NoteCard;
