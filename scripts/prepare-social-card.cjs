// Optional authoring step. Uses the existing Sharp image tooling; never runs at deploy.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
async function run(){
 const root=path.resolve(__dirname,'..');
 const photo=await sharp(path.join(root,'assets/hero-project.jpg')).resize(780,630,{fit:'cover',position:'centre'}).jpeg({quality:86}).toBuffer();
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#17264e"/><rect x="780" width="10" height="630" fill="#ef762f"/><g fill="#fbf9f4" font-family="Arial,sans-serif"><text x="830" y="120" font-size="44" font-weight="700">Nijtec B.V.</text><text x="830" y="240" font-size="42">Lijmen, kitten</text><text x="830" y="300" font-size="42">en coatings</text><text x="830" y="430" font-size="25">Advies en montage</text><text x="830" y="475" font-size="25">vanuit Dalen</text><text x="830" y="570" font-size="30">nijtec.nl</text></g></svg>');
 const output=path.join(root,'assets/share/nijtec-social.jpg');
 await fs.mkdir(path.dirname(output),{recursive:true});
 const {size}=await sharp(svg).composite([{input:photo,left:0,top:0}]).jpeg({quality:82,mozjpeg:true}).toFile(output);
 if(size>=200000)throw Error('Social card exceeds 200 kB');
 console.log('Social card: 1200x630, '+size+' bytes; original photograph unchanged.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
