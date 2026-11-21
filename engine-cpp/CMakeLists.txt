cmake_minimum_required(VERSION 3.16)
project(monsvers_engine VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(monsvers_core STATIC
    src/battle_engine.cpp
)

target_include_directories(monsvers_core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

if(EMSCRIPTEN)
    add_executable(monsvers_wasm
        src/wasm_bindings.cpp
    )
    target_link_libraries(monsvers_wasm PRIVATE monsvers_core)
    set_target_properties(monsvers_wasm PROPERTIES
        OUTPUT_NAME "monsvers_engine"
        SUFFIX ".js"
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/../client-phaser/public/wasm"
    )
    target_link_options(monsvers_wasm PRIVATE
        "--bind"
        "-sMODULARIZE=1"
        "-sEXPORT_ES6=1"
        "-sEXPORT_NAME=createMonsversEngine"
        "-sENVIRONMENT=web"
    )
else()
    enable_testing()
    add_executable(test_battle_engine
        tests/test_battle_engine.cpp
    )
    target_link_libraries(test_battle_engine PRIVATE monsvers_core)
    add_test(NAME BattleEngineTests COMMAND test_battle_engine)
endif()
