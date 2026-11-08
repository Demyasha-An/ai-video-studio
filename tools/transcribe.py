"""Transcribe audio with faster-whisper: SRT + JSON segments + text verification.

Usage: python transcribe.py <audio> <srt_out> <json_out> [initial_prompt]
"""
import sys
import json

from faster_whisper import WhisperModel


def ts(seconds: float) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> None:
    audio, srt_out, json_out = sys.argv[1], sys.argv[2], sys.argv[3]
    prompt = sys.argv[4] if len(sys.argv) > 4 else ""

    model = WhisperModel("small", device="cpu", compute_type="int8")
    # vad_filter=False: на чистой TTS-озвучке VAD съедает начало дорожки
    segments, info = model.transcribe(
        audio, language="ru", initial_prompt=prompt or None,
        vad_filter=False, word_timestamps=True,
    )

    segs = []
    with open(srt_out, "w", encoding="utf-8") as f:
        for i, seg in enumerate(segments, 1):
            text = seg.text.strip()
            f.write(f"{i}\n{ts(seg.start)} --> {ts(seg.end)}\n{text}\n\n")
            words = [
                {"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)}
                for w in (seg.words or [])
            ]
            segs.append({"i": i, "start": round(seg.start, 3), "end": round(seg.end, 3), "text": text, "words": words})

    with open(json_out, "w", encoding="utf-8") as f:
        json.dump({"language": info.language, "duration": info.duration, "segments": segs}, f, ensure_ascii=False, indent=1)

    print(f"[OK] {len(segs)} segments, lang={info.language}, audio={info.duration:.2f}s")


if __name__ == "__main__":
    main()
