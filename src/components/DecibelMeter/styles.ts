import { StyleSheet } from "react-native";

const getStyles = (colorScheme: 'light' | 'dark' | null | undefined) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f5',
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  meterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  decibelText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: colorScheme === 'dark' ? '#ffffff' : '#000000',
  },
  progressBarContainer: {
    width: '100%',
    height: 24,
    backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 12,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 12,
    color: colorScheme === 'dark' ? '#8e8e93' : '#666666',
  },
  peakContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  peakLabel: {
    fontSize: 16,
    color: colorScheme === 'dark' ? '#8e8e93' : '#666666',
    marginRight: 8,
  },
  peakValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colorScheme === 'dark' ? '#2c2c2e' : '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: colorScheme === 'dark' ? '#8e8e93' : '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export { getStyles };

