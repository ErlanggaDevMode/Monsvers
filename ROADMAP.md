# 🗺️ Development Roadmap — Monsvers: The Battle Monster

Roadmap pengembangan bertahap menggunakan tim Paperclip (`Antigravity`, `Bima`, `Raka`, `Sari`, `Dina`, `Arif`).

---

## Sprint 1 — Foundation: C++20/WASM Engine + Mobile-First Pixel Art Core
- [ ] **M1.1 (DevOps / Toolchain):** Install `g++`, `cmake`, dan `emscripten` di VPS; compile & verifikasi `monsvers_engine.wasm` + native `CTest`.
- [ ] **M1.2 (C++ Core — Battle Engine v2):** Expand `engine-cpp/` dengan full Turn Manager, 4-skill SP/Accuracy system, Status Effects (`Burn`, `Poison`, `Paralyze`, `Shield`, `AttackUp`), Guard action, Capture probability (Rift Orb), XP/Level-Up/Evolution calculator, dan Tactical Enemy AI (`Wild`, `Rival`, `Boss`).
- [ ] **M1.3 (Phaser Mobile Portrait & Pixel Art System):** Refactor `client-phaser/` ke layout **Mobile-First Portrait (`360×640`)**, procedural crisp pixel-art monster spritesheet generator (starter + enemies + arena parallax), modern pixel HUD, HP/SP/XP bars, dan battle juice (particles, screen shake, floating damage numbers).
- [ ] **M1.4 (WASM Integration & QA):** Sambungkan `battleBridge.js` ke binary `monsvers_engine.wasm` asli, tes native CTest + build Vite + live preview di `https://nayakacode.web.id/monsvers/`.

---

## Sprint 2 — Story Campaign, Dialogue System & Party Progression
- [ ] **M2.1 (Title & Starter Select Scene):** Title screen pixel-art semi-modern, New Game / Continue, intro cutscene Prof. Orin, dan pilih starter (**Pyrofang**, **Aquafin**, **Verdantix**).
- [ ] **M2.2 (Campaign World Map Scene):** Interactive 4-Chapter node map (Hutan Solara → Teluk Azure → Kawah Ignis → Menara Eclipse) dengan unlock progression, node status badges, dan Boss markers.
- [ ] **M2.3 (Dialogue & Cutscene Overlay):** Typewriter dialogue engine dengan portrait karakter (Prof. Orin, Rival Kael, Rift Wardens), pre-battle & post-battle story scripts.
- [ ] **M2.4 (Party, Bag, Capture & Save System):** Party management (3 active Monsvers + switch), Item Bag (`Potion`, `Super Potion`, `Antidote`, `Rift Orb`), wild capture mechanic, XP/Level-up/Evolution ceremony, dan auto-save `localStorage`.

---

## Sprint 3 — Polish, Audio, Boss Phases & Release v1.0
- [ ] **M3.1 (Chiptune-Modern Web Audio):** Procedural BGM (Title, Map, Battle, Boss) + SFX (attack, elemental hit, crit, heal, capture, level-up, UI click) dengan kontrol volume/mute.
- [ ] **M3.2 (Full 4-Chapter Content & Boss AI):** Lengkapi seluruh 12+ Monsver (termasuk Stage 2 Evolution), 12+ story nodes, dan Final Boss multi-phase **Umbravex**.
- [ ] **M3.3 (QA Audit & Mobile Playtest):** Audit balancing C++ engine, pengujian headless Chromium pada resolusi mobile (`390×844`) & desktop, fix bugs, lalu rilis **v1.0** di `https://nayakacode.web.id/monsvers/`.
