import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Icon name="fitness-center" size={80} color="#1976d2" />
        <Text style={styles.title}>البسنديلي جيم</Text>
        <ActivityIndicator size="large" color="#1976d2" style={styles.loader} />
        <Text style={styles.loadingText}>جاري تحميل التطبيق...</Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 10,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default LoadingScreen;
