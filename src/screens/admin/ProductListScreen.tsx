import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { Text, Button, FAB, Searchbar, IconButton, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../../types';
import { LoadingIndicator } from '../../components/LoadingIndicator';

export const ProductListScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Substituir por lógica de busca real
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela, tomate e manjericão',
        price: 45.90,
        category: 'pizza',
        imageUrl: 'https://example.com/margherita.jpg',
      },
      {
        id: '2',
        name: 'Coca-Cola 2L',
        description: 'Refrigerante sabor cola',
        price: 12.90,
        category: 'drink',
        imageUrl: 'https://example.com/coca.jpg',
      }
    ];

    setProducts(mockProducts);
    setLoading(false);
  }, []);

  const handleEdit = (product: Product) => {
    navigation.navigate('AdminProductEdit', { product });
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      console.log('Deletando produto:', selectedProduct.name);
      
      // Simular tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDeleteDialogVisible(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text variant="titleMedium" style={styles.title}>{item.name}</Text>
        <Text variant="bodyMedium" style={styles.price}>
          R$ {item.price.toFixed(2)}
        </Text>
        <Text variant="bodySmall" style={styles.category}>{item.category}</Text>
      </View>
      <View style={styles.actions}>
        <IconButton
          icon="pencil"
          size={20}
          onPress={() => handleEdit(item)}
        />
        <IconButton
          icon="delete"
          size={20}
          onPress={() => {
            setSelectedProduct(item);
            setDeleteDialogVisible(true);
          }}
        />
      </View>
    </View>
  );

  if (loading) {
    return <LoadingIndicator size={24} />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar produtos"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AdminProductEdit')}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Confirmar exclusão</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Tem certeza que deseja excluir {selectedProduct?.name}?
              Esta ação não pode ser desfeita.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleDelete}>Excluir</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  title: {
    marginBottom: 4,
  },
  price: {
    color: '#4CAF50',
    marginBottom: 4,
  },
  category: {
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
