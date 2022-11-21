#!/bin/sh

echo ">> Building contract"

# near-sdk-js build src/contract.ts build/contract.wasm
near-sdk-js build src/WordleContract.ts build/wordle_contract.wasm