#!/usr/bin/env python3
"""Generate narration for 'Panchang with Chandra' with a natural Microsoft neural voice.

Run from Terminal on your Mac:
    cd ~/"Panchang with Chandra" && python3 generate_voice.py

Optional:  python3 generate_voice.py --voice en-IN-PrabhatNeural   (male Indian-English voice)
           python3 generate_voice.py --list                          (show Indian voices)
Creates a 'voice' folder with one small MP3 per line. Re-running skips lines already made.
"""
import asyncio, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "voice")

def ensure_edge_tts():
    try:
        import edge_tts  # noqa
    except ImportError:
        print("Installing edge-tts (one time)...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "--quiet", "edge-tts"])

async def main():
    ensure_edge_tts()
    import edge_tts
    args = sys.argv[1:]
    if "--list" in args:
        for v in await edge_tts.list_voices():
            if v["Locale"] in ("en-IN", "hi-IN"):
                print(v["ShortName"], v["Gender"])
        return
    voice = args[args.index("--voice") + 1] if "--voice" in args else "en-IN-NeerjaNeural"
    rate = args[args.index("--rate") + 1] if "--rate" in args else "-6%"
    items = json.load(open(os.path.join(HERE, "lines.json"), encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "voice.txt"), "w") as f:
        f.write(voice + "\n")
    todo = [it for it in items if not os.path.exists(os.path.join(OUT, it["id"] + ".mp3"))]
    print(f"Voice: {voice}   lines to make: {len(todo)} of {len(items)}")
    sem = asyncio.Semaphore(4)
    done = 0
    async def one(it):
        nonlocal done
        async with sem:
            path = os.path.join(OUT, it["id"] + ".mp3")
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(it["text"], voice, rate=rate).save(path + ".part")
                    os.replace(path + ".part", path)
                    break
                except Exception as e:
                    if attempt == 2:
                        print("  failed:", it["id"], e)
                    await asyncio.sleep(1.5)
            done += 1
            print(f"\r  {done}/{len(todo)}", end="", flush=True)
    await asyncio.gather(*(one(it) for it in todo))
    print("\nDone. Tell Claude the voice files are ready.")

asyncio.run(main())
