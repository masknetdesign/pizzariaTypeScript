import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export function SuccessScreen() {
  const navigation = useNavigation();

  const handleContinue = () => {
    navigation.navigate('Menu' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        <Text style={styles.title}>Pedido Confirmado!</Text>
        <Text style={styles.message}>
          Seu pagamento foi processado com sucesso.
          Você receberá uma confirmação por e-mail.
        </Text>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Voltar ao Menu
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#1a1a1a',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
