const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
 if(['.git','node_modules','.vercel'].includes(item.name))return [];
 const full=path.join(dir,item.name);return item.isDirectory()?walk(full):[full];
});}
test('Repository and deploy output contain no PHP files or PHP/Composer runtime',()=>{
 const bad=walk(root).filter(p=>/\.(?:php\d*|phtml|phar)$/i.test(p)||/^composer\.(json|lock)$/i.test(path.basename(p))||path.basename(p)==='php.ini');
 assert.deepEqual(bad,[]);
 for(const name of ['package.json','vercel.json'])assert.ok(!/php|composer/i.test(fs.readFileSync(path.join(root,name),'utf8')),name);
});
