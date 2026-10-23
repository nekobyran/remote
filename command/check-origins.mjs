import { mkdir, readFile, writeFile } from 'node:fs/promises';

const phase=process.argv[2];
if(!['before','after'].includes(phase)) throw new Error('Use before or after.');
const urls=[
  'https://codexmax.nkbr.cc/console/',
  'https://codexmax.nkbr.cc/codex/health',
  'https://androidsimulator.nkbr.cc/download/windows',
  'https://skillcreator.nkbr.cc/api/release',
  'https://gamelauncher.nkbr.cc/release.json',
  'https://lanzouplus.nkbr.cc/latest.json',
  'https://flclashplus.nkbr.cc/release.json',
  'https://kacha.nkbr.cc/release.json',
];
const results=[];
for(const url of urls){
  const response=await fetch(url,{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(20000)});
  results.push({url,status:response.status,type:response.headers.get('content-type'),design:response.headers.get('x-nkbr-design')});
  console.log(`${response.status} ${url}`);
}
const directory=new URL('../verification/',import.meta.url);
await mkdir(directory,{recursive:true});
await writeFile(new URL(`origins-${phase}.json`,directory),JSON.stringify(results,null,2)+'\n');
if(phase==='after'){
  const before=JSON.parse(await readFile(new URL('origins-before.json',directory),'utf8'));
  for(const [index,result] of results.entries()){
    if(result.status!==before[index].status || result.type!==before[index].type || result.design!==null) throw new Error(`Origin changed: ${result.url}`);
  }
  console.log('All eight existing origin responses preserved.');
}
