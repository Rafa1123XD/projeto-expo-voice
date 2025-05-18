import { StyleSheet } from 'react-native';

const getStyles = (colorScheme: 'light' | 'dark' | null | undefined) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: colorScheme === 'dark' ? '#ffffff' : '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: colorScheme === 'dark' ? '#8e8e93' : '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#4CAF50',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export { getStyles };
