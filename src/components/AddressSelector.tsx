import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, RadioButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { Address } from '../types/address';

interface AddressSelectorProps {
  onSelect: (address: Address) => void;
  selectedAddress: Address | null;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  onSelect,
  selectedAddress,
}) => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const { data: addressesData, error } = await supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddresses(addressesData || []);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    navigation.navigate('Addresses' as never);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando endereços...</Text>
      </View>
    );
  }

  if (addresses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Nenhum endereço cadastrado</Text>
        <Button mode="contained" onPress={handleAddAddress} style={styles.button}>
          Adicionar Endereço
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RadioButton.Group
        onValueChange={(value) => {
          const address = addresses.find((a) => a.id === value);
          if (address) {
            onSelect(address);
          }
        }}
        value={selectedAddress?.id || ''}
      >
        {addresses.map((address) => (
          <View key={address.id} style={styles.addressItem}>
            <RadioButton.Item
              label={`${address.street}, ${address.number}${
                address.complement ? ` - ${address.complement}` : ''
              }\n${address.neighborhood} - ${address.city}/${address.state}\nCEP: ${
                address.cep
              }`}
              value={address.id}
              style={styles.radioButton}
              labelStyle={styles.radioLabel}
            />
          </View>
        ))}
      </RadioButton.Group>

      <Button
        mode="outlined"
        onPress={handleAddAddress}
        style={styles.addButton}
      >
        Adicionar Novo Endereço
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  addressItem: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  radioButton: {
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    marginTop: 16,
  },
});
