import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

interface LoadingIndicatorProps {
  size?: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 32 }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#E3000B" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
