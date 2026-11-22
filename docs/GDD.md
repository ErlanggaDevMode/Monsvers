# 🐉 Game Design Document — Monsvers: The Battle Monster

**Version:** 1.0  
**Genre:** Turn-Based Monster Battle RPG (Story / Campaign)  
**Visual Style:** Pixel Art Semi-Modern (HD-2D inspired crisp pixel sprites + modern particles, shaders/lighting & smooth tweens)  
**Platform Target:** Mobile-First Landscape Web (`16:9`, logical canvas `640×360` with `Phaser.Scale.FIT` & crisp pixel rendering — nyaman dua jempol di HP landscape & tampil penuh di desktop, dilengkapi hint otomatis bila dibuka di portrait)  
**Tech Stack:** **Phaser 3 + Vite** (Client) + **C++20 → WebAssembly (Emscripten)** (Deterministic Battle & AI Core)

---

## 1. Story & World Setting

Di benua **Aetheria**, manusia (**Tamer**) dan makhluk elemental (**Monsver**) hidup berdampingan menjaga harmoni enam elemen: **Fire**, **Water**, **Nature**, **Electric**, **Shadow**, dan **Neutral**.

Suatu malam, retakan energi purba bernama **Eclipse Rift** terbuka di puncak **Menara Eclipse**, memancarkan aura korup yang membuat para **Apex Guardian** mengamuk. Kamu adalah Tamer muda dari **Desa Solara** yang menerima Monsver pertamamu dari **Prof. Orin** untuk menempuh perjalanan 4 Chapter, melatih & mengevolusikan tim Monsver-mu, mengalahkan para Rival & Rift Warden, dan menyegel kembali Eclipse Rift.

### Campaign Chapters (4 Chapters, 12+ Story Nodes)
1. **Chapter 1 — Hutan Solara (Starter & Awakening):**
   - Cutscene pembuka & pilih 1 dari 3 starter (**Pyrofang** 🔥, **Aquafin** 💧, **Verdantix** 🌿).
   - Wild encounters + Rival Battle (**Kael**) + Chapter Boss (**Thornback**, Nature Guardian).
2. **Chapter 2 — Teluk Azure (Capture & Synergy):**
   - Fitur menangkap Wild Monsver menggunakan **Rift Orb** untuk melengkapi party 3 Monsver.
   - Encounter baru (Water & Electric) + Chapter Boss (**Tidebreaker**, Water Guardian).
3. **Chapter 3 — Kawah Ignis (Evolution & Mastery):**
   - Monsver mencapai **Evolution** (Stage 2) pada Lv. 10 dengan stat boost & signature skill baru.
   - Rival Rematch (**Kael**) + Chapter Boss (**Volcarok**, Fire/Electric Warden).
4. **Chapter 4 — Menara Eclipse (Final Showdown):**
   - Gauntlet Rift Guardians + Final Boss multi-phase (**Umbravex**, Shadow Apex Guardian) + Ending Cutscene & Post-Game Arena.

---

## 2. Core Gameplay & Turn-Based Mechanics

### 2.1 Party & Roster
- Pemain membawa hingga **3 Monsver aktif** dalam party (+ Storage untuk Monsver tangkapan).
- **12+ Monsver unik** (termasuk lini evolusi starter + wild + bosses):
  - 🔥 **Pyrofang** → **Blazefang** (Fire)
  - 💧 **Aquafin** → **Tidecrest** (Water)
  - 🌿 **Verdantix** → **Sylvanox** (Nature)
  - ⚡ **Sparkit** → **Voltlynx** (Electric)
  - 🌑 **Shadeling** → **Umbravex** (Shadow)
  - ⭐ **Pebblit** / **Galewing** (Neutral)

### 2.2 Battle Flow (1v1 Active + Party Switch)
Setiap turn:
1. Pemain memilih aksi dari panel bawah mobile-friendly: **Fight (4 Skills)**, **Party (Switch)**, **Bag (Potion / Antidote / Rift Orb)**, atau **Guard (Pulihkan SP & kurangi damage 40%)**.
2. Urutan aksi ditentukan oleh **Speed** (dengan priority skill tertentu seperti *Quick Strike* menyerang duluan).
3. **C++20/WASM Battle Engine** menghitung akurasi, STAB (`1.2×`), Elemental Effectiveness (`1.5×` / `0.75×`), Critical Hit (`1.5×`), serta status effect (`Burn`, `Poison`, `Paralyze`, `Shield`, `AttackUp`).
4. **Phaser 3 Client** mengeksekusi animasi serangan, particle burst elemen, hit-flash, camera shake, floating damage numbers, dan Chiptune-Modern Web Audio SFX.
5. Di akhir turn, status effect (Burn/Poison) dan regenerasi SP diproses.

### 2.3 Elemental Effectiveness Matrix
| Attacker \ Defender | Neutral | Fire | Water | Nature | Electric | Shadow |
|---|---|---|---|---|---|---|
| **Neutral** | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| **Fire** | 1.0 | 1.0 | 0.75 | **1.5** | 1.0 | 1.0 |
| **Water** | 1.0 | **1.5** | 1.0 | 0.75 | 0.75 | 1.0 |
| **Nature** | 1.0 | 0.75 | **1.5** | 1.0 | 1.0 | 1.0 |
| **Electric** | 1.0 | 1.0 | **1.5** | 0.75 | 1.0 | 1.0 |
| **Shadow** | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | **1.25** |

---

## 3. Arsitektur Teknis (Phaser.js + C++20/WASM)

### Keputusan Arsitektur C++
Core game simulation ditulis dalam **C++20** (`engine-cpp/`) dan dikompilasi menjadi dua target:
1. **Native Binary + CTest** — Untuk unit testing super cepat & deterministik di VPS/CI tanpa perlu browser.
2. **WebAssembly (`monsvers_engine.wasm` + `monsvers_engine.js`) via Emscripten** — Dimuat langsung oleh `client-phaser/src/bridge/battleBridge.js` sehingga seluruh kalkulasi combat, status effect, progression/XP/evolusi, dan Tactical Enemy AI berjalan native-speed di browser mobile (zero latency & offline-capable).

### Mobile-First Portrait Layout (`360×640` logical)
- **Top Bar (`y: 0–48`):** Chapter/Stage badge, Engine badge (`WASM`), Audio toggle, Menu.
- **Battle Stage (`y: 48–350`):** Parallax pixel arena background, enemy platform + sprite + HP/Status bar (kanan atas), player platform + sprite + HP/SP/XP bar (kiri bawah), particle layer & floating damage text.
- **Command & Dialogue Deck (`y: 350–640`):**
  - Battle Log / Story Dialogue box dengan typewriter text & karakter portrait.
  - 4 tombol besar thumb-friendly (min touch target `48px+`): 2×2 Skill Grid / Party Switch / Bag / Guard.

---

## 4. Visual & Audio Direction (Pixel Art Semi-Modern)
- **Rendering:** `pixelArt: true`, `roundPixels: true`, palet warna rich modern RPG (dark slate UI frames, vibrant elemental accents, rim highlights).
- **Sprites:** Procedural pixel-art sprite generator (16×16 / 32×32 scaled crisp 3×–4×) untuk seluruh monster & karakter, dirancang modular sehingga bisa langsung diganti PNG spritesheet custom tanpa ubah kode gameplay.
- **Juice & Feedback:** Idle breathing bobbing, attack lunge tween, elemental projectile particles, hit-stop 60ms, screen shake pada crit/boss skill, smooth HP bar drain.
- **Audio:** Procedural Web Audio API synthesizer (chiptune-modern battle BGM loop + attack/crit/heal/victory/UI click SFX dengan tombol mute).
