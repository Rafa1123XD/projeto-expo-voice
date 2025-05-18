import { memo } from 'react';
import { Button } from 'react-native';

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
}

export const RecordButton = memo(function RecordButton({ 
  isRecording, 
  onPress 
}: RecordButtonProps) {
  return (
    <Button
      title={isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
      onPress={onPress}
      color={isRecording ? '#ff4444' : '#4CAF50'}
    />
  );
});

export default RecordButton; 