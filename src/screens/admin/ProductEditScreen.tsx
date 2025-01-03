import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Product } from '../../types';
import { productService } from '../../services/supabaseService';

type RouteParams = {
  product?: Product;
};

export const ProductEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params as RouteParams;

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [category, setCategory] = useState(product?.category || 'pizza');
  const [imageUri, setImageUri] = useState(product?.imageUrl || '');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Precisamos de permissão para acessar suas fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let imageUrl = imageUri;
      
      // Se a imagem foi alterada (é uma URI local), faz o upload
      if (imageUri && !imageUri.startsWith('http')) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        imageUrl = await productService.uploadImage(imageUri, filename);
      }

      const productData: Product = {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
      };

      if (product?.id) {
        await productService.updateProduct(product.id, productData);
      } else {
        await productService.addProduct(productData);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Button icon="camera">Adicionar Foto</Button>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        label="Nome do Produto"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <TextInput
        label="Preço"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <TextInput
        label="Categoria"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        style={styles.button}
      >
        Salvar
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
  },
});
