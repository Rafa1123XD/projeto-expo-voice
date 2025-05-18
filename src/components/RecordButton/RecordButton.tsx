import { Button } from 'react-native';

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
}

export function RecordButton({ isRecording, onPress }: RecordButtonProps) {
  return (
    <Button
      title={isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
      onPress={onPress}
    />
  );
}

export default RecordButton; 