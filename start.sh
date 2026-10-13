#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p npm install --no-audit --no-fund
/usr/bin/time -p env CI=false npm run build
/usr/bin/time -p node -e "const fs=require('fs'),path=require('path');const project=process.cwd();const directory=path.join(project,'build');if(!fs.existsSync(path.join(directory,'index.html')))throw new Error('build/index.html missing');if(process.env.OPENCODE_WEB_DIR)fs.writeFileSync(path.join(process.env.OPENCODE_WEB_DIR,'deployment-output.json'),JSON.stringify({project,directory}));"
/usr/bin/time -p node ./omgithub-serve.mjs build
