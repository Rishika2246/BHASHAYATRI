import wave
import struct

def make_silent_wav(path, duration_s=1, rate=16000):
    nframes = int(duration_s * rate)
    with wave.open(path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(rate)
        for _ in range(nframes):
            wf.writeframes(struct.pack('<h', 0))

if __name__ == '__main__':
    make_silent_wav('examples/test_en.wav')
    make_silent_wav('examples/test_es.wav')
    make_silent_wav('examples/test_hi.wav')
    print('Created 3 silent test WAVs in examples/')
