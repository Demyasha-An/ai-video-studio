#!/usr/bin/env python3
"""voice-ru.py — русская озвучка для video-studio.

Движки:
  silero  (по умолчанию) — Silero v5_ru, локально, GPU (CUDA) или CPU, ударения/ё
  azure   — Azure Speech REST (F0: 500 тыс. символов/мес бесплатно), коммерчески чисто
  edge    — edge-tts (бесплатно, быстро, ударения не контролируются)
  piper   — локальный Piper (MIT), нужен --piper-model

Примеры:
  python tools/voice-ru.py --text "Блок 1" --text "Блок 2" --out audio/voice/demo.wav
  python tools/voice-ru.py --text "..." --out audio/voice/demo.wav --engine azure --voice ru-RU-SvetlanaNeural
  python tools/voice-ru.py --text "..." --out audio/voice/demo.wav --engine edge --voice ru-RU-DmitryNeural
  python tools/voice-ru.py --list-voices

Результат:
  <out>-block01.wav ... (+ .txt с расставленными ударениями)
  <out>-full.wav — склейка с паузами, 48 kHz stereo, -14 LUFS / -1.5 dBTP

© video-studio, MIT.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import wave
from pathlib import Path

SR = 48000
LUFS = -14.0
TRUE_PEAK = -1.5
LRA = 11.0
SILERO_VOICES = ["xenia", "baya", "kseniya", "aidar", "eugene"]

# --------------------------------------------------------------------------
# Числа и сокращения → слова
# --------------------------------------------------------------------------
_ONES_M = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
_ONES_F = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
_TEENS = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать",
          "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"]
_TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят",
         "шестьдесят", "семьдесят", "восемьдесят", "девяносто"]
_HUNDREDS = ["", "сто", "двести", "триста", "четыреста",
             "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"]
_SCALES = [
    (10 ** 9, ("миллиард", "миллиарда", "миллиардов"), False),
    (10 ** 6, ("миллион", "миллиона", "миллионов"), False),
    (10 ** 3, ("тысяча", "тысячи", "тысяч"), True),
]


def plural_ru(n: int, one: str, few: str, many: str) -> str:
    n = abs(n) % 100
    if 11 <= n <= 19:
        return many
    d = n % 10
    if d == 1:
        return one
    if 2 <= d <= 4:
        return few
    return many


def _triple(n: int, feminine: bool = False) -> list[str]:
    words: list[str] = []
    h, rem = divmod(n, 100)
    if h:
        words.append(_HUNDREDS[h])
    if rem >= 20:
        t, u = divmod(rem, 10)
        words.append(_TENS[t])
        if u:
            words.append((_ONES_F if feminine else _ONES_M)[u])
    elif rem >= 10:
        words.append(_TEENS[rem - 10])
    elif rem:
        words.append((_ONES_F if feminine else _ONES_M)[rem])
    return words


def int_to_words(n: int, feminine: bool = False) -> str:
    n = int(n)
    if n == 0:
        return "ноль"
    if n < 0:
        return "минус " + int_to_words(-n, feminine)
    out: list[str] = []
    for scale, forms, fem in _SCALES:
        if n >= scale:
            q, n = divmod(n, scale)
            out += _triple(q, fem)
            out.append(plural_ru(q, *forms))
    out += _triple(n, feminine)
    return " ".join(w for w in out if w)


def _decimal_words(num: str) -> str:
    """'12,5' → 'двенадцать с половиной' (предсказуемо и естественно для TTS)."""
    parts = re.split(r"[.,]", num)
    if len(parts) == 1:
        return int_to_words(int(parts[0]))
    whole = int_to_words(int(parts[0])) if parts[0] else "ноль"
    frac = parts[1]
    if frac == "5":
        return f"{whole} с половиной"
    frac_words = " ".join(int_to_words(int(ch)) for ch in frac if ch.isdigit())
    unit = "десятых" if len(frac) == 1 else "сотых" if len(frac) == 2 else "тысячных"
    return f"{whole} целых {frac_words} {unit}"


_ABBREV = [
    (r"\bт\.\s*д\.", "так далее"),
    (r"\bт\.\s*е\.", "то есть"),
    (r"\bт\.\s*к\.", "так как"),
    (r"\bт\.\s*п\.", "тому подобное"),
    (r"\bдр\.", "другое"),
    (r"\bпр\.", "прочее"),
    (r"\bг\.", "год"),
    (r"\bгг\.", "годы"),
    (r"\bул\.", "улица"),
    (r"\bкв\.", "квартира"),
    (r"\bруб\.", "рублей"),
]
# млн/млрд/тыс НЕ заменяем здесь: их обрабатывает _num_repl вместе с числом
# (иначе «2,5 млн» → «2,5 миллионов» и дробное согласование ломается).

# ВАЖНО: суффикс ограничен правой границей слова (?![а-яёa-z]) и НЕ съедает пробел,
# иначе "3 года" превращалось в "тригода", а "рублей" — в "рублейлей".
# Захватываем следующее слово: для одиночных числительных нужно согласование по роду
# ("1 квартира" → «одна квартира», "1 дом" → «один дом»); слово возвращаем на место.
_NUM_RE = re.compile(
    r"(\d+(?:[.,]\d+)?)(\s*)(%|₽|\$|€|руб\.?|тыс\.?|млн\.?|млрд\.?)?(?![а-яёa-z0-9])"
    r"(?:\s+([А-Яа-яЁё][А-Яа-яЁё-]*))?",
    re.IGNORECASE,
)
_TIME_RE = re.compile(r"\b(\d{1,2}):(\d{2})\b")
# Разряды через пробел: "3 500 000" → "3500000"
_GROUPED_RE = re.compile(r"(?<=\d)[ \u00a0](?=\d{3}(?!\d))")

_FEM_ENDINGS = ("а", "я", "ь")
_morph = None


def _get_morph():
    """pymorphy3 опционален: без него работает эвристика по окончанию."""
    global _morph
    if _morph is None:
        try:
            import pymorphy3  # type: ignore

            _morph = pymorphy3.MorphAnalyzer()
        except Exception:  # noqa: BLE001
            _morph = False
    return _morph


def word_is_feminine(word: str) -> bool | None:
    """None = морфология недоступна, согласование по роду пропускаем (безопаснее угадывания:
    эвристика по окончанию ошибается на «дом/дома», «лот/лота»)."""
    morph = _get_morph()
    if not morph:
        return None
    try:
        tag = morph.parse(word)[0].tag
    except Exception:  # noqa: BLE001
        return None
    if "femn" in tag:
        return True
    if "masc" in tag or "neut" in tag:
        return False
    return None


def _num_repl(m: re.Match) -> str:
    num, space, suffix, nxt = m.group(1), m.group(2), m.group(3), m.group(4)
    suffix = (suffix or "").rstrip(".")
    sep = space or " "
    tail = f" {nxt}" if nxt else ""
    fractional = bool(re.search(r"[.,]\d", num))
    try:
        n = int(float(num.replace(",", ".")))
    except ValueError:
        n = None

    # Род числительного: у одиночных числительных — по существительному справа
    # («одна квартира», «два лота»); у единиц измерения — по самому существительному.
    fem_next = bool(nxt) and (word_is_feminine(nxt) is True)

    def unit(the_n: int | None, forms: tuple[str, str, str], feminine: bool = False) -> str:
        """Число + согласованное существительное. Дробные — родительный ед.ч. ('два с половиной миллиона')."""
        head = int_to_words(the_n, feminine) if (the_n is not None and not fractional) else _decimal_words(num)
        if fractional:
            word = forms[1]
        elif the_n is not None:
            word = plural_ru(the_n, *forms)
        else:
            word = forms[2]
        return f"{head}{sep}{word}{tail}"

    if suffix == "%":
        return unit(n, ("процент", "процента", "процентов"))
    if suffix in ("₽", "руб"):
        return unit(n, ("рубль", "рубля", "рублей"))
    if suffix == "$":
        return unit(n, ("доллар", "доллара", "долларов"))
    if suffix == "€":
        return unit(n, ("евро", "евро", "евро"))
    if suffix == "тыс":
        return unit(n, ("тысяча", "тысячи", "тысяч"), feminine=True)
    if suffix == "млн":
        return unit(n, ("миллион", "миллиона", "миллионов"))
    if suffix == "млрд":
        return unit(n, ("миллиард", "миллиарда", "миллиардов"))

    if n is None or fractional:
        return _decimal_words(num) + tail
    # Род числительного — по существительному справа («одна квартира», «один лот»).
    # Существительное оставляем как в тексте: форму падежа задаёт автор текста, а не мы.
    return int_to_words(n, fem_next) + tail


def _time_repl(m: re.Match) -> str:
    h, mm = int(m.group(1)), int(m.group(2))
    if mm == 0:
        return f"{int_to_words(h, True)} часов"
    if mm == 30:
        return f"{int_to_words(h, True)} тридцать"
    return f"{int_to_words(h, True)} {int_to_words(mm, True)}"


def normalize_text(text: str) -> str:
    t = text.replace("\u00a0", " ").replace("«", "").replace("»", "").replace("\"", "")
    t = re.sub(r"[*_#`>]+", " ", t)
    t = _TIME_RE.sub(_time_repl, t)
    for pat, rep in _ABBREV:
        t = re.sub(pat, rep, t, flags=re.IGNORECASE)
    t = _GROUPED_RE.sub("", t)
    t = _NUM_RE.sub(_num_repl, t)
    t = re.sub(r"\s*[–—]\s*", ", ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


# --------------------------------------------------------------------------
# Ударения
# --------------------------------------------------------------------------
class Accentor:
    def __init__(self, pronunciation: Path | None, enabled: bool = True):
        self.enabled = enabled
        self.fn = None
        self.overrides: dict[str, str] = {}
        if pronunciation and pronunciation.exists():
            raw = json.loads(pronunciation.read_text("utf-8"))
            self.overrides = {k.lower(): v for k, v in raw.items() if not k.startswith("_")}
        if enabled:
            try:
                from silero_stress import load_accentor  # type: ignore
                self.fn = load_accentor()
            except Exception as exc:  # noqa: BLE001
                print(f"[voice-ru] ударения недоступны ({exc.__class__.__name__}), пропускаю", file=sys.stderr)

    def __call__(self, text: str) -> str:
        out = text
        if self.fn is not None:
            try:
                out = self.fn(text)
            except Exception as exc:  # noqa: BLE001
                print(f"[voice-ru] accentor failed: {exc}", file=sys.stderr)
                out = text
        for word, stressed in self.overrides.items():
            out = re.sub(rf"\b{re.escape(word)}\b", stressed, out, flags=re.IGNORECASE)
        return out


# --------------------------------------------------------------------------
# Движки синтеза: возвращают list[np.ndarray] float32 mono @ SR
# --------------------------------------------------------------------------
def synth_silero(texts: list[str], voice: str, device: str, sr: int) -> list:
    import numpy as np  # type: ignore
    import torch  # type: ignore

    if device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    model, _ = torch.hub.load(
        "snakers4/silero-models", "silero_tts",
        language="ru", speaker="v5_ru", trust_repo=True,
    )
    model.to(device)
    print(f"[voice-ru] silero v5_ru · {voice} · {device}", file=sys.stderr)
    out = []
    with torch.no_grad():
        for t in texts:
            audio = model.apply_tts(
                text=t, speaker=voice, sample_rate=sr,
                put_accent=False, put_yo=False,  # ударения уже расставлены нами
            )
            out.append(audio.detach().cpu().numpy().astype(np.float32))
    return out


def _mp3_to_array(mp3: Path, sr: int):
    import numpy as np  # type: ignore
    wav = mp3.with_suffix(".tmp.wav")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-ar", str(sr), "-ac", "1", str(wav)],
        check=True,
    )
    with wave.open(str(wav), "rb") as f:
        data = f.readframes(f.getnframes())
    wav.unlink(missing_ok=True)
    return np.frombuffer(data, dtype="<i2").astype(np.float32) / 32768.0


def synth_edge(texts: list[str], voice: str, rate: str) -> list:
    import edge_tts  # type: ignore

    # edge-tts (Microsoft) нестабилен: NoAudioReceived прилетает на любой голос.
    # Ретраи + fallback-голоса — иначе озвучка падает на ровном месте.
    fallbacks = [voice] + [v for v in (
        "ru-RU-DmitryNeural", "ru-RU-SvetlanaNeural", "ru-RU-DariyaNeural", "ru-RU-PavelNeural",
    ) if v != voice]

    async def one(text: str, path: Path) -> str:
        last: Exception | None = None
        for attempt in range(10):
            v = fallbacks[attempt % len(fallbacks)]
            try:
                await edge_tts.Communicate(text, v, rate=rate).save(str(path))
                if path.exists() and path.stat().st_size > 1024:
                    return v
                raise RuntimeError("пустой аудиофайл")
            except Exception as exc:  # noqa: BLE001
                last = exc
                await asyncio.sleep(3 + attempt)
        raise RuntimeError(f"edge-tts: 10 попыток не удались ({last})")

    print(f"[voice-ru] edge-tts · {voice} · rate={rate}", file=sys.stderr)
    out = []
    with tempfile.TemporaryDirectory() as td:
        for i, t in enumerate(texts):
            mp3 = Path(td) / f"b{i}.mp3"
            used = asyncio.run(one(t, mp3))
            if used != voice:
                print(f"[voice-ru] edge: блок {i + 1} озвучен fallback-голосом {used}", file=sys.stderr)
            out.append(_mp3_to_array(mp3, SR))
    return out


def synth_azure(texts: list[str], voice: str) -> list:
    key = os.environ.get("AZURE_SPEECH_KEY")
    region = os.environ.get("AZURE_SPEECH_REGION")
    if not key or not region:
        raise SystemExit("azure: нужны AZURE_SPEECH_KEY и AZURE_SPEECH_REGION")
    import numpy as np  # type: ignore
    from xml.sax.saxutils import escape

    url = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    print(f"[voice-ru] azure · {voice} · {region}", file=sys.stderr)
    out = []
    for t in texts:
        ssml = (
            "<speak version='1.0' xml:lang='ru-RU'>"
            f"<voice name='{voice}'><prosody rate='0%'>{escape(t)}</prosody></voice></speak>"
        )
        req = urllib.request.Request(
            url, data=ssml.encode("utf-8"), method="POST",
            headers={
                "Ocp-Apim-Subscription-Key": key,
                "Content-Type": "application/ssml+xml",
                "X-Microsoft-OutputFormat": "riff-48khz-16bit-mono-pcm",
                "User-Agent": "video-studio",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
            tf.write(raw)
            tmp = Path(tf.name)
        with wave.open(str(tmp), "rb") as f:
            data = f.readframes(f.getnframes())
        tmp.unlink(missing_ok=True)
        out.append(np.frombuffer(data, dtype="<i2").astype(np.float32) / 32768.0)
    return out


def synth_piper(texts: list[str], model: str) -> list:
    import numpy as np  # type: ignore
    if not model or not Path(model).exists():
        raise SystemExit("piper: укажи --piper-model path/to/ru_RU-*.onnx")
    exe = shutil.which("piper")
    if not exe:
        raise SystemExit("piper: бинарь piper не найден в PATH")
    print(f"[voice-ru] piper · {model}", file=sys.stderr)
    out = []
    with tempfile.TemporaryDirectory() as td:
        for i, t in enumerate(texts):
            wav = Path(td) / f"b{i}.wav"
            subprocess.run([exe, "-m", model, "-f", str(wav)],
                           input=t.encode("utf-8"), check=True)
            with wave.open(str(wav), "rb") as f:
                data = f.readframes(f.getnframes())
            out.append(np.frombuffer(data, dtype="<i2").astype(np.float32) / 32768.0)
    return out


# --------------------------------------------------------------------------
# Запись / мастеринг
# --------------------------------------------------------------------------
def write_wav(path: Path, samples, sr: int = SR) -> None:
    import numpy as np  # type: ignore
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(samples, -1.0, 1.0)
    pcm = (pcm * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes(pcm.tobytes())


def _measure_loudness(path: Path) -> dict | None:
    """Первый проход loudnorm: измеренные значения для точного второго прохода."""
    r = subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-nostats", "-i", str(path),
         "-af", f"loudnorm=I={LUFS}:TP={TRUE_PEAK}:LRA={LRA}:print_format=json",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


def _integrated_lufs(path: Path) -> float | None:
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
         "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    vals = re.findall(r"I:\s+(-?\d+\.\d+)\s+LUFS", r.stderr)
    return float(vals[-1]) if vals else None


def master(path: Path) -> None:
    """48 kHz stereo + loudnorm −14 LUFS / −1.5 dBTP (in-place).

    Два прохода: однопроходный loudnorm на коротких блоках (3–5 с) недобирает
    1–2 LU (проверено: −15.5 вместо −14), поэтому сначала измеряем, потом применяем.
    Третий шаг — контрольная подстройка усиления: loudnorm считает по своей шкале,
    ebur128 (по ней проверяет QC) может разойтись на 0.5 LU.
    """
    measured = _measure_loudness(path)
    if measured:
        af = (
            f"loudnorm=I={LUFS}:TP={TRUE_PEAK}:LRA={LRA}"
            f":measured_I={measured['input_i']}:measured_TP={measured['input_tp']}"
            f":measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}"
            f":offset={measured.get('target_offset', '0.0')}:linear=true"
        )
    else:
        af = f"loudnorm=I={LUFS}:TP={TRUE_PEAK}:LRA={LRA}"
    tmp = path.with_suffix(".master.wav")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(path),
         "-af", af, "-ar", str(SR), "-ac", "2", str(tmp)],
        check=True,
    )

    # Контрольный проход: доводим интегральную громкость до цели (±0.1 LU), не выше TP.
    actual = _integrated_lufs(tmp)
    if actual is not None and abs(actual - LUFS) > 0.1:
        gain = LUFS - actual
        fixed = path.with_suffix(".trim.wav")
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", str(tmp),
             "-af", f"volume={gain:.2f}dB,alimiter=limit={TRUE_PEAK}dB:level=false",
             "-ar", str(SR), "-ac", "2", str(fixed)],
            check=True,
        )
        fixed.replace(tmp)
    tmp.replace(path)


def duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True,
    )
    return round(float(r.stdout.strip()), 3)


def concat(blocks: list, gap_sec: float):
    import numpy as np  # type: ignore
    gap = np.zeros(int(SR * gap_sec), dtype=np.float32)
    parts = []
    for i, b in enumerate(blocks):
        if i:
            parts.append(gap)
        parts.append(b)
    return np.concatenate(parts) if parts else np.zeros(0, dtype=np.float32)


def extract_markdown_section(raw: str, heading: str) -> str:
    """Берёт содержимое раздела Markdown по заголовку (## ...) до следующего заголовка того же уровня.

    Зачем: сценарии студии — это .md с шапкой, таблицей раскадровки и разделом текста.
    Агенты естественно подают файл целиком в --text-file, и без этого шапка уходила бы в TTS.
    """
    lines = raw.splitlines()
    want = heading.strip().lower().lstrip("#").strip()
    out: list[str] = []
    level = 0
    inside = False
    for line in lines:
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            title = m.group(2).strip().lower()
            if not inside and want in title:
                inside = True
                level = len(m.group(1))
                continue
            if inside and len(m.group(1)) <= level:
                break
        if inside:
            out.append(line)
    if not out:
        raise SystemExit(f"--section: раздел «{heading}» не найден")
    return "\n".join(out)


def split_blocks(raw: str) -> list[str]:
    """Блоки через пустую строку. Строки-разделители '---' и Markdown-разметка отбрасываются."""
    cleaned = re.sub(r"^\s*-{3,}\s*$", "", raw, flags=re.MULTILINE)
    return [b.strip() for b in re.split(r"\n\s*\n", cleaned) if b.strip()]


# --------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser(description="Русская озвучка для video-studio")
    ap.add_argument("--text", action="append", default=[], help="блок текста (можно несколько)")
    ap.add_argument("--text-file", help="файл с текстом (блоки через пустую строку)")
    ap.add_argument("--section", default="",
                    help="взять из --text-file только этот Markdown-раздел, например 'Текст озвучки'")
    ap.add_argument("--out", help="audio/voice/<slug>.wav")
    ap.add_argument("--engine", default="silero", choices=["silero", "azure", "edge", "piper"])
    ap.add_argument("--voice", default="xenia", help="silero: xenia|baya|kseniya|aidar|eugene")
    ap.add_argument("--device", default="auto", choices=["auto", "cuda", "cpu"])
    ap.add_argument("--rate", default="+0%", help="edge-tts: +10%%, -5%%")
    ap.add_argument("--gap", type=float, default=0.35, help="пауза между блоками, сек")
    ap.add_argument("--fit", default="",
                    help="подогнать блоки под тайминг сценария: '5,5,5,5' или '5' (atempo, без сдвига питча)")
    ap.add_argument("--no-stress", action="store_true", help="не расставлять ударения")
    ap.add_argument("--pronunciation", default="config/pronunciation.json")
    ap.add_argument("--piper-model", default="")
    ap.add_argument("--list-voices", action="store_true")
    args = ap.parse_args()

    if args.list_voices:
        print("silero:", ", ".join(SILERO_VOICES))
        print("azure: ru-RU-SvetlanaNeural, ru-RU-DmitryNeural, ru-RU-DariyaNeural")
        print("edge:  ru-RU-SvetlanaNeural, ru-RU-DmitryNeural, ru-RU-DariyaNeural, ru-RU-PavelNeural")
        return 0

    if not args.out:
        ap.error("нужен --out")
    out = Path(args.out)
    slug = out.stem

    texts: list[str] = list(args.text)
    if args.text_file:
        raw = Path(args.text_file).read_text("utf-8")
        if args.section:
            raw = extract_markdown_section(raw, args.section)
        texts += split_blocks(raw)
    if not texts:
        ap.error("нужен --text или --text-file")

    # плейсхолдеры вида [ФАКТ: уточнить] TTS читает буквально — предупреждаем до синтеза
    for i, t in enumerate(texts, 1):
        for ph in re.findall(r"\[[^\]]{1,60}\]", t):
            print(f"[voice-ru] ВНИМАНИЕ: блок {i} содержит плейсхолдер {ph} — "
                  f"он будет прочитан буквально, замените текст", file=sys.stderr)

    accentor = Accentor(Path(args.pronunciation), enabled=not args.no_stress)
    prepared = [accentor(normalize_text(t)) for t in texts]

    # Целевые длительности блоков из сценария (--fit 5,5,5,5 или одно число для всех).
    # atempo меняет темп без сдвига питча; в пределах ±25% речь звучит естественно.
    fit_targets: list[float] = []
    if args.fit:
        fit_targets = [float(x) for x in args.fit.split(",") if x.strip()]
        if len(fit_targets) == 1:
            fit_targets *= len(prepared)
        if len(fit_targets) != len(prepared):
            ap.error(f"--fit: {len(fit_targets)} значений на {len(prepared)} блоков")

    if args.engine == "silero":
        audios = synth_silero(prepared, args.voice, args.device, SR)
    elif args.engine == "azure":
        audios = synth_azure(prepared, args.voice)
    elif args.engine == "edge":
        audios = synth_edge(prepared, args.voice, args.rate)
    else:
        audios = synth_piper(prepared, args.piper_model)

    warnings: list[str] = []
    if fit_targets:
        import numpy as np  # type: ignore
        fitted = []
        for i, (audio, target) in enumerate(zip(audios, fit_targets), start=1):
            actual = len(audio) / SR
            if actual <= 0:
                fitted.append(audio)
                continue
            tempo = actual / target
            if abs(tempo - 1) < 0.02:
                fitted.append(audio)
                continue
            if not 0.75 <= tempo <= 1.33:
                warnings.append(
                    f"блок {i}: для {target} с нужен темп x{tempo:.2f} (вне 0.75–1.33) — "
                    f"текст не влезает в тайминг, править сценарий"
                )
                tempo = min(max(tempo, 0.75), 1.33)
            tmp = Path(tempfile.gettempdir()) / f"fit{i}.wav"
            write_wav(tmp, audio)
            out_tmp = tmp.with_name(f"fit{i}-out.wav")
            subprocess.run(
                ["ffmpeg", "-y", "-v", "error", "-i", str(tmp),
                 "-af", f"atempo={tempo:.4f}", "-ar", str(SR), str(out_tmp)],
                check=True,
            )
            with wave.open(str(out_tmp), "rb") as f:
                data = f.readframes(f.getnframes())
            fitted.append(np.frombuffer(data, dtype="<i2").astype(np.float32) / 32768.0)
            tmp.unlink(missing_ok=True)
            out_tmp.unlink(missing_ok=True)
        audios = fitted

    out.parent.mkdir(parents=True, exist_ok=True)
    report = {"engine": args.engine, "voice": args.voice, "blocks": []}
    for i, (audio, txt) in enumerate(zip(audios, prepared), start=1):
        block = out.with_name(f"{slug}-block{i:02d}.wav")
        write_wav(block, audio)
        master(block)
        txt_path = block.with_suffix(".txt")
        txt_path.write_text(txt, "utf-8")
        entry = {
            "n": i, "path": str(block), "txt": str(txt_path),
            "duration": duration(block), "chars": len(txt),
        }
        if fit_targets:
            entry["target"] = fit_targets[i - 1]
        report["blocks"].append(entry)

    full = out.with_name(f"{slug}-full.wav")
    write_wav(full, concat(audios, args.gap))
    master(full)
    report["full"] = {"path": str(full), "duration": duration(full)}
    if warnings:
        report["warnings"] = warnings
        for w in warnings:
            print(f"[voice-ru] ВНИМАНИЕ: {w}", file=sys.stderr)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
