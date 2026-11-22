# 🗺️ Development Roadmap — Monsvers: The Battle Monster

Roadmap pengembangan bertahap menggunakan tim Paperclip (`Antigravity`, `Bima`, `Raka`, `Sari`, `Dina`, `Arif`).

---

## Sprint 1 — Foundation: C++20/WASM Engine + Mobile-First Pixel Art Core
- [x] **M1.1 (DevOps / Toolchain):** Install `g++`, `cmake`, dan `emscripten` di VPS; compile & verifikasi `monsvers_engine.wasm` + native `CTest`.
- [x] **M1.2 (C++ Core — Battle Engine v2):** Expand `engine-cpp/` dengan full Turn Manager, 4-skill SP/Accuracy system, Status Effects (`Burn`, `Poison`, `Paralyze`, `Shield`, `AttackUp`), Guard action, Capture probability (Rift Orb), XP/Level-Up/Evolution calculator, dan Tactical Enemy AI (`Wild`, `Rival`, `Boss`).
- [x] **M1.3 (Phaser Mobile Portrait & Pixel Art System):** Refactor `client-phaser/` ke layout **Mobile-First Portrait (`360×640`)**, procedural crisp pixel-art monster spritesheet generator (starter + enemies + arena parallax), modern pixel HUD, HP/SP/XP bars, dan battle juice (particles, screen shake, floating damage numbers).
- [x] **M1.4 (WASM Integration & QA):** Sambungkan `battleBridge.js` ke binary `monsvers_engine.wasm` asli, tes native CTest + build Vite + live preview di `https://nayakacode.web.id/monsvers/`.

---

## Sprint 2 — Story Campaign, Dialogue System & Party Progression
- [x] **M2.1 (Title & Starter Select Scene):** Title screen pixel-art semi-modern, New Game / Continue, intro cutscene Prof. Orin, dan pilih starter (**Pyrofang**, **Aquafin**, **Verdantix**).
- [x] **M2.2 (Campaign World Map Scene):** Interactive 4-Chapter node map (Hutan Solara → Teluk Azure → Kawah Ignis → Menara Eclipse) dengan unlock progression, node status badges, dan Boss markers.
- [x] **M2.3 (Dialogue & Cutscene Overlay):** Typewriter dialogue engine dengan portrait karakter (Prof. Orin, Rival Kael, Rift Wardens), pre-battle & post-battle story scripts.
- [x] **M2.4 (Party, Bag, Capture & Save System):** Party management (3 active Monsvers + switch), Item Bag (`Potion`, `Super Potion`, `Antidote`, `Rift Orb`), wild capture mechanic, XP/Level-up/Evolution ceremony, dan auto-save `localStorage`.

---

## Sprint 3 — Polish, Audio, Boss Phases, Landscape Mode & Release v1.0
- [x] **M3.1 (Chiptune-Modern Web Audio):** Procedural BGM (Title, Map, Battle, Boss) + SFX (attack, elemental hit, crit, heal, capture, level-up, UI click) dengan kontrol volume/mute.
- [x] **M3.2 (Full 4-Chapter Content, Landscape `640×360` & Boss Phases):** Lengkapi seluruh 12 Monsver, 12 story nodes, panoramic `640×360` Mobile-First Landscape UI & Arena, dan Final Boss multi-phase **Umbravex** (Phase 2 Awakening).
- [x] **M3.3 (QA Audit & Mobile Playtest):** Audit balancing C++ engine (multi-turn & Boss Phase 2 CTests), pengujian headless Chromium pada resolusi landscape, rilis **v1.0** di `https://nayakacode.web.id/monsvers/`.
