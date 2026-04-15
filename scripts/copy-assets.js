const fs = require('node:fs');
const path = require('node:path');

const assetCopies = [
	{
		from: path.join(__dirname, '..', 'src', 'nodes', 'AbacusErp', 'abacus.svg'),
		to: path.join(__dirname, '..', 'dist', 'nodes', 'AbacusErp', 'abacus.svg'),
	},
];

for (const asset of assetCopies) {
	fs.mkdirSync(path.dirname(asset.to), { recursive: true });
	fs.copyFileSync(asset.from, asset.to);
}

console.log(`Copied ${assetCopies.length} asset(s).`);
