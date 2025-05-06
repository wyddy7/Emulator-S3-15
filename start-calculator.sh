#!/bin/bash
cd "$(dirname "$0")"
open http://localhost:8080 || xdg-open http://localhost:8080
npm start 