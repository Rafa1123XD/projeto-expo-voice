import { StyleSheet } from "react-native";

const getStyles = (colorScheme: 'light' | 'dark' | null | undefined) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
  },
  decibelText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 4,
    color: colorScheme === 'dark' ? '#ffffff' : '#000000',
  },
});

export { getStyles };
