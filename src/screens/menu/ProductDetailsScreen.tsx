import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, IconButton, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { productService } from '../../services/productService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes';

interface ProductSize {
  id: string;
  name: string;
  price: number;
}

interface ProductEdge {
  id: string;
  name: string;
  price: number;
}

const mockSizes: ProductSize[] = [
  { id: '1', name: 'Pequena (4 fatias)', price: 35.90 },
  { id: '2', name: 'Média (6 fatias)', price: 45.90 },
  { id: '3', name: 'Grande (8 fatias)', price: 55.90 },
  { id: '4', name: 'Família (12 fatias)', price: 65.90 },
];

const mockEdges: ProductEdge[] = [
  { id: '1', name: 'Sem Borda', price: 0 },
  { id: '2', name: 'Catupiry', price: 5.90 },
  { id: '3', name: 'Cheddar', price: 5.90 },
  { id: '4', name: 'Chocolate', price: 7.90 },
];

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

export const ProductDetailsScreen = ({ route, navigation }: Props) => {
  const { productId } = route.params;
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ProductEdge | null>(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('ProductDetailsScreen: Carregando produto:', productId);
      
      const data = await productService.getProductById(productId);
      console.log('ProductDetailsScreen: Produto carregado:', data);
      
      setProduct(data);
      
      if (data?.category === 'pizza') {
        setSelectedSize(mockSizes[1]); // Média como padrão para pizzas
        setSelectedEdge(mockEdges[0]); // Sem borda como padrão para pizzas
      }
    } catch (error: any) {
      console.error('ProductDetailsScreen: Erro ao carregar produto:', error);
      setError(error.message || 'Erro ao carregar produto');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (increment: boolean) => {
    setQuantity((prev) => {
      const newQuantity = increment ? prev + 1 : prev - 1;
      return Math.max(1, newQuantity); // Não permite quantidade menor que 1
    });
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let total = product.price;
    
    if (selectedSize) {
      total = selectedSize.price;
    }
    
    if (selectedEdge) {
      total += selectedEdge.price;
    }
    
    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      product,
      quantity,
    });

    navigation.goBack();
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadProduct} style={styles.retryButton}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Produto não encontrado</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.retryButton}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            {product.name}
          </Text>
          
          <Text variant="bodyLarge" style={styles.description}>
            {product.description}
          </Text>

          {product.category === 'pizza' && (
            <>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Tamanho
              </Text>
              <RadioButton.Group
                onValueChange={value => 
                  setSelectedSize(mockSizes.find(size => size.id === value) || null)
                }
                value={selectedSize?.id || ''}
              >
                {mockSizes.map(size => (
                  <View key={size.id} style={styles.radioItem}>
                    <RadioButton.Android value={size.id} />
                    <Text style={styles.radioLabel}>{size.name}</Text>
                    <Text style={styles.radioPrice}>
                      R$ {size.price.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </RadioButton.Group>

              <Text variant="titleMedium" style={styles.sectionTitle}>
                Borda
              </Text>
              <RadioButton.Group
                onValueChange={value =>
                  setSelectedEdge(mockEdges.find(edge => edge.id === value) || null)
                }
                value={selectedEdge?.id || ''}
              >
                {mockEdges.map(edge => (
                  <View key={edge.id} style={styles.radioItem}>
                    <RadioButton.Android value={edge.id} />
                    <Text style={styles.radioLabel}>{edge.name}</Text>
                    <Text style={styles.radioPrice}>
                      {edge.price > 0 ? `+ R$ ${edge.price.toFixed(2)}` : 'Grátis'}
                    </Text>
                  </View>
                ))}
              </RadioButton.Group>
            </>
          )}

          <View style={styles.quantityContainer}>
            <Text variant="titleMedium">Quantidade:</Text>
            <View style={styles.quantityControls}>
              <IconButton
                icon="minus"
                size={20}
                onPress={() => handleQuantityChange(false)}
                mode="contained"
                containerColor="#8B5CF6"
                iconColor="#fff"
                disabled={quantity <= 1}
              />
              <Text variant="titleLarge" style={styles.quantity}>
                {quantity}
              </Text>
              <IconButton
                icon="plus"
                size={20}
                onPress={() => handleQuantityChange(true)}
                mode="contained"
                containerColor="#8B5CF6"
                iconColor="#fff"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text variant="titleMedium">Total:</Text>
          <Text variant="headlineSmall" style={styles.totalPrice}>
            R$ {calculateTotalPrice().toFixed(2)}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleAddToCart}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
        >
          Adicionar ao Carrinho
        </Button>
      </View>
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
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    flex: 1,
    marginLeft: 8,
  },
  radioPrice: {
    marginLeft: 8,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalPrice: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
  },
  addButtonContent: {
    height: 48,
  },
});
