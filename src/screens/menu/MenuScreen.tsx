import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Searchbar, Chip, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { RootStackParamList } from '../../routes';
import { Product, productService } from '../../services/productService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'pizza', name: 'Pizzas' },
  { id: 'drink', name: 'Bebidas' },
  { id: 'dessert', name: 'Sobremesas' },
];

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 48) / 2;

export const MenuScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('MenuScreen: Iniciando carregamento de produtos...');
      const data = await productService.getProducts();
      console.log('MenuScreen: Produtos carregados:', {
        count: data?.length || 0,
        categories: [...new Set(data.map(p => p.category))],
      });

      setProducts(data);
    } catch (error: any) {
      console.error('MenuScreen: Erro ao carregar produtos:', error);
      setError(error.message || 'Erro ao carregar produtos. Por favor, tente novamente.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (productId: number) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => handleProductPress(item.id)}
      style={styles.cardContainer}
    >
      <Card style={styles.card}>
        <Card.Cover 
          source={{ uri: item.image_url }} 
          style={styles.cardImage}
        />
        <Card.Content>
          <Text variant="titleMedium" style={styles.productName}>
            {item.name}
          </Text>
          <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <Text variant="titleMedium" style={styles.price}>
            R$ {item.price.toFixed(2)}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Chip
            selected={selectedCategory === item.id}
            onPress={() => setSelectedCategory(item.id)}
            style={styles.categoryChip}
            mode="outlined"
          >
            {item.name}
          </Chip>
        )}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.Content title="Cardápio" />
        {user && (
          <Appbar.Action 
            icon="cart" 
            onPress={() => navigation.navigate('Cart')}
            disabled={items.length === 0}
          />
        )}
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar produtos"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.header}>
        {renderCategories()}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadProducts} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>Nenhum produto encontrado</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    padding: 8,
  },
  retryText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  productList: {
    padding: 16,
    paddingBottom: 32,
  },
  cardContainer: {
    width: cardWidth,
    padding: 8,
  },
  card: {
    flex: 1,
  },
  cardImage: {
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  productName: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  price: {
    marginTop: 8,
    color: '#1976D2',
  },
});
