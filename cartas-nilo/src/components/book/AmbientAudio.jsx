import { useEffect, useRef, useState } from "react";

const AmbientAudio = () => {
    const audioRef = useRef(null);

    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.4);

    // volumen
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // play/pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (playing) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [playing]);

    return (
        <div className="audio-ui">

            <button
                className="btn"
                onClick={() => setPlaying(!playing)}
            >
                {playing ? "⏸ Música" : "▶ Música"}
            </button>

            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
            />

            <audio
                ref={audioRef}
                loop
                src="/audio/desifreemusic-echoes-of-the-desert-mystic-arabic-ambient-452059.mp3"
            />
        </div>
    );
};

export default AmbientAudio;