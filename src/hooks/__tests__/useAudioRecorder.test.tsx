import { act, render } from '@testing-library/react-native';
import { Audio } from 'expo-av';
import React from 'react';
import { useAudioRecorder } from '../useAudioRecorder';

const mockStopAndUnloadAsync = jest.fn(() => Promise.resolve());
const mockGetURI = jest.fn();
const mockUnloadAsync = jest.fn(() => Promise.resolve());

class MockRecording {
  stopAndUnloadAsync = mockStopAndUnloadAsync;
  getURI = mockGetURI;
}

class MockSound {
  unloadAsync = mockUnloadAsync;
  playAsync = jest.fn(() => Promise.resolve());
}

jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
    Recording: {
      createAsync: jest.fn(),
    },
    Sound: {
      createAsync: jest.fn(),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

function TestComponent({ callback }: { callback: (state: any) => void }) {
  const recorder = useAudioRecorder();
  React.useEffect(() => {
    callback(recorder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder]);
  return null;
}

describe('useAudioRecorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStopAndUnloadAsync.mockReset();
    mockGetURI.mockReset();
    mockUnloadAsync.mockReset();
  });

  it('deve iniciar com estado inicial correto', () => {
    let state: any = null;
    render(<TestComponent callback={s => { state = s; }} />);
    expect(state.isRecording).toBe(false);
    expect(state.decibels).toBe(-160);
    expect(state.peakDecibels).toBe(-160);
    expect(state.error).toBe(null);
  });

  it('deve iniciar gravação quando permissão for concedida', async () => {
    (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (Audio.Recording.createAsync as jest.Mock).mockResolvedValue({
      recording: new MockRecording(),
    });
    let state: any = null;
    const { unmount } = render(<TestComponent callback={s => { state = s; }} />);
    await act(async () => {
      await state.startRecording();
    });
    expect(state.isRecording).toBe(true);
    expect(Audio.requestPermissionsAsync).toHaveBeenCalled();
    expect(Audio.setAudioModeAsync).toHaveBeenCalled();
    expect(Audio.Recording.createAsync).toHaveBeenCalled();
    unmount();
  });

  it('não deve iniciar gravação quando permissão for negada', async () => {
    (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    let state: any = null;
    render(<TestComponent callback={s => { state = s; }} />);
    await act(async () => {
      await state.startRecording();
    });
    expect(state.isRecording).toBe(false);
    expect(state.error).toBe('Precisamos de permissão para acessar o microfone');
  });

  it('deve parar gravação corretamente', async () => {
    mockGetURI.mockReturnValue('test-uri');
    (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (Audio.Recording.createAsync as jest.Mock).mockResolvedValue({
      recording: new MockRecording(),
    });
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: new MockSound(),
    });
    let state: any = null;
    const { unmount } = render(<TestComponent callback={s => { state = s; }} />);
    await act(async () => {
      await state.startRecording();
    });
    await act(async () => {
      await state.stopRecording();
    });
    expect(state.isRecording).toBe(false);
    expect(mockStopAndUnloadAsync).toHaveBeenCalled();
    expect(mockGetURI).toHaveBeenCalled();
    unmount();
    expect(mockUnloadAsync).toHaveBeenCalled();
  });
}); 