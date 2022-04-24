set -e

# Generate typescript declarations
npx tsc -p tsconfig.d.json -d

# Flatten typescript declarations
npx rollup -c rollup.config.types.js

# Replace export with closing brace for module declaration
sed -i='' '$s/export {.*};/}/' lib/index.d.ts

# Replace declare's with export's
sed -i='' 's/declare/export/g' lib/index.d.ts

# Prepend declare module line
sed -i='' '2s;^;declare module "../../web3.js/src" {\n;' lib/index.d.ts

# Run prettier
npx prettier --write lib/index.d.ts

# Check result
npx tsc lib/index.d.ts
