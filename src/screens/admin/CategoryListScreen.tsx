import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, IconButton, FAB, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';

interface Category {
  id: string;
  name: string;
  description?: string;
}

export const CategoryListScreen = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 'pizza', name: 'Pizzas', description: 'Pizzas tradicionais e especiais' },
    { id: 'drink', name: 'Bebidas', description: 'Refrigerantes, sucos e bebidas alcoólicas' },
    { id: 'dessert', name: 'Sobremesas', description: 'Doces e sobremesas' },
  ]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const showDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description || '');
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDescription('');
    }
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
  };

  const handleSave = async () => {
    try {
      const newCategory = {
        id: categoryName.toLowerCase().replace(/\s+/g, '_'),
        name: categoryName,
        description: categoryDescription,
      };

      if (editingCategory) {
        // Atualizar categoria existente
        const { error } = await supabase
          .from('categories')
          .update(newCategory)
          .eq('id', editingCategory.id);

        if (error) throw error;

        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? newCategory : cat
        ));
      } else {
        // Criar nova categoria
        const { error } = await supabase
          .from('categories')
          .insert([newCategory]);

        if (error) throw error;

        setCategories([...categories, newCategory]);
      }

      hideDialog();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.filter(cat => cat.id !== categoryId));
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.categoryInfo}>
          <Text variant="titleMedium" style={styles.categoryName}>
            {item.name}
          </Text>
          {item.description && (
            <Text variant="bodyMedium" style={styles.categoryDescription}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            mode="contained"
            containerColor="#8B5CF6"
            iconColor="#fff"
            size={20}
            onPress={() => showDialog(item)}
          />
          <IconButton
            icon="delete"
            mode="contained"
            containerColor="#EF4444"
            iconColor="#fff"
            size={20}
            onPress={() => handleDelete(item.id)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">Nenhuma categoria encontrada</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => showDialog()}
        color="#fff"
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome da Categoria"
              value={categoryName}
              onChangeText={setCategoryName}
              style={styles.input}
            />
            <TextInput
              label="Descrição"
              value={categoryDescription}
              onChangeText={setCategoryDescription}
              style={styles.input}
              multiline
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancelar</Button>
            <Button onPress={handleSave} mode="contained">
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 16,
  },
  categoryName: {
    fontWeight: 'bold',
  },
  categoryDescription: {
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B5CF6',
  },
  input: {
    marginBottom: 16,
  },
});
