# 🐉 Monsvers: The Battle Monster

**Monsvers: The Battle Monster** adalah game monster battle 2D berbasis **Phaser.js** (frontend renderer, animasi, audio, & UI arena) yang ditenagai oleh **C++20 Battle Engine** (simulasi turn-based, kalkulasi elemen, status effect, & AI lawan — dapat dikompilasi ke native binary untuk unit testing maupun WebAssembly/WASM untuk browser).

---

## 🧱 Arsitektur & Tech Stack

- **Game Client (`client-phaser/`)**: Phaser 3 + Vite (ES Modules)
- **Core Battle Engine (`engine-cpp/`)**: C++20 + CMake + Emscripten (WebAssembly bridge)
- **Bridge Layer (`client-phaser/src/bridge/battleBridge.js`)**: Menghubungkan Phaser.js ke modul WASM C++ dengan fallback otomatis bila WASM belum dikompilasi

```text
Monsvers/
├── engine-cpp/                     # C++20 deterministic battle & simulation core
│   ├── CMakeLists.txt              # Native build + CTest + Emscripten WASM target
│   ├── include/monsvers/
│   │   ├── types.hpp               # Element, Monster, Skill, TurnResult types
│   │   └── battle_engine.hpp       # Elemental multiplier & combat resolution API
│   ├── src/
│   │   ├── battle_engine.cpp       # Battle mechanics implementation
│   │   └── wasm_bindings.cpp       # Emscripten Embind export for JS/Phaser
│   └── tests/
│       └── test_battle_engine.cpp  # Native C++ unit tests
└── client-phaser/                  # Phaser 3 Web Game Client
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.js                 # Phaser.Game bootstrap
        ├── bridge/battleBridge.js  # C++ WASM <-> Phaser bridge
        └── scenes/
            ├── BootScene.js        # Asset & engine preload
            └── BattleScene.js      # Starter Monster Battle Arena
```

---

## 🚀 Quick Start

### 1. Jalankan Client Phaser.js
```bash
cd client-phaser
npm install
npm run dev
```

### 2. Build & Test Core C++ (Native)
```bash
cmake -S engine-cpp -B engine-cpp/build
cmake --build engine-cpp/build
ctest --test-dir engine-cpp/build --output-on-failure
```

### 3. Build Core C++ ke WebAssembly (Emscripten)
```bash
emcmake cmake -S engine-cpp -B engine-cpp/build-wasm
cmake --build engine-cpp/build-wasm
```
Output `monsvers_engine.js` & `monsvers_engine.wasm` akan disalin ke `client-phaser/public/wasm/`.

---

## 📄 Lisensi

Repository publik milik **Erlangga Dimas Suryadi** (`ErlanggaDevMode`).
