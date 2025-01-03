import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, Card, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { addressService } from '../../services/addressService';
import { Address } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes';
import { cepMask } from '../../utils/masks';

interface AddressesScreenProps {
  navigation: any;
  route: {
    params?: {
      selectMode?: boolean;
    };
  };
}

export function AddressesScreen({ navigation, route }: AddressesScreenProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
  });

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      console.log('AddressesScreen: Carregando endereços...');
      const data = await addressService.getAddresses(user.id);
      console.log('AddressesScreen: Endereços carregados:', {
        count: data.length,
      });
      setAddresses(data);
    } catch (error: any) {
      console.error('AddressesScreen: Erro ao carregar endereços:', error);
      setError(error.message || 'Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setFormData({
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postal_code: '',
    });
    setDialogVisible(true);
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setFormData({
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
    });
    setDialogVisible(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      setLoading(true);
      await addressService.deleteAddress(addressId);
      await loadAddresses();
    } catch (error: any) {
      console.error('AddressesScreen: Erro ao deletar endereço:', error);
      setError(error.message || 'Erro ao deletar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const addressData = {
        user_id: user.id,
        ...formData,
      };

      if (selectedAddress) {
        await addressService.updateAddress(selectedAddress.id, addressData);
      } else {
        await addressService.createAddress(addressData);
      }

      setDialogVisible(false);
      await loadAddresses();
    } catch (error: any) {
      console.error('AddressesScreen: Erro ao salvar endereço:', error);
      setError(error.message || 'Erro ao salvar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    navigation.navigate('Checkout', { selectedAddress: address });
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <Card
      style={styles.card}
      onPress={() => handleSelectAddress(item)}
    >
      <Card.Content>
        <View style={styles.addressHeader}>
          <View style={styles.addressInfo}>
            <Text variant="titleMedium">{item.street}, {item.number}</Text>
            {item.complement && (
              <Text variant="bodyMedium">Complemento: {item.complement}</Text>
            )}
            <Text variant="bodyMedium">{item.neighborhood}</Text>
            <Text variant="bodyMedium">{item.city} - {item.state}</Text>
            <Text variant="bodyMedium">CEP: {item.postal_code}</Text>
          </View>
          <View style={styles.addressActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={(e) => {
                e.stopPropagation();
                handleEditAddress(item);
              }}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteAddress(item.id);
              }}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !dialogVisible) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadAddresses} style={styles.retryButton}>
            Tentar novamente
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text>Nenhum endereço cadastrado</Text>
              </View>
            }
          />

          <Button
            mode="contained"
            onPress={handleAddAddress}
            style={styles.addButton}
            icon="plus"
          >
            Adicionar Endereço
          </Button>

          <Portal>
            <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
              <Dialog.Title>
                {selectedAddress ? 'Editar Endereço' : 'Novo Endereço'}
              </Dialog.Title>
              <Dialog.Content>
                <TextInput
                  label="Rua"
                  value={formData.street}
                  onChangeText={(text) => setFormData({ ...formData, street: text })}
                  style={styles.input}
                />
                <TextInput
                  label="Número"
                  value={formData.number}
                  onChangeText={(text) => setFormData({ ...formData, number: text })}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  label="Complemento (opcional)"
                  value={formData.complement}
                  onChangeText={(text) => setFormData({ ...formData, complement: text })}
                  style={styles.input}
                />
                <TextInput
                  label="Bairro"
                  value={formData.neighborhood}
                  onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
                  style={styles.input}
                />
                <TextInput
                  label="Cidade"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  style={styles.input}
                />
                <TextInput
                  label="Estado"
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  style={styles.input}
                />
                <TextInput
                  label="CEP"
                  value={formData.postal_code}
                  onChangeText={(text) => setFormData({ ...formData, postal_code: cepMask(text) })}
                  style={styles.input}
                  keyboardType="numeric"
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
                <Button onPress={handleSaveAddress}>Salvar</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </>
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
    marginTop: 8,
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressInfo: {
    flex: 1,
  },
  addressActions: {
    flexDirection: 'row',
  },
  addButton: {
    margin: 16,
    backgroundColor: '#8B5CF6',
  },
  input: {
    marginBottom: 16,
  },
});
