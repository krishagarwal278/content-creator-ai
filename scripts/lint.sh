#!/bin/bash
# Ensure we use the correct Node version for ESLint
export ELECTRON_RUN_AS_NODE=
exec /usr/local/bin/node ./node_modules/.bin/eslint "$@"
