const fs = require('fs');
const mammoth = require('mammoth');
const process = require('process');
const {exec} = require('child_process');

function rename(path) {
    const pure_name = path.split('.docx');
    pure_name.pop();
    const new_name = pure_name.join('.docx') + '.txt';
    return new_name;
}

async function parseDoc(path, dir) {
    const result = await mammoth.extractRawText({ path: dir + '/' + path, });
    console.log(`- parsing ${path}:`);
    result.messages.forEach(m => `  [${m.type}] ${m.message}`);
    fs.writeFileSync(dir + '/' + rename(path), result.value);
    return;
}

function match(docx_name, dict) {
    const name = rename(docx_name);
    return name in dict;
}



function runDotnet(path, dir) {
    const file = dir + '\\' + rename(path);
    const cmd = `dotnet run -- --file "${file}"`;
    console.log('running > ', cmd);
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error executing command: ${cmd}`);
          console.error(stderr);
          return;
        }
      
        console.log(stdout);
      });
}

const dir = process.argv[2];


async function main(dir) {
    const files = fs.readdirSync(dir);
    const docx = files.filter(f => f.endsWith('.docx'));
    const txt = files.filter(f => f.endsWith('.txt')).reduce((d, s) => ({ ...d, [s]: true }), {});
    for (const doc of docx) {
        if (!match(doc, txt)) {
            await parseDoc(doc, dir);
        }
        runDotnet(doc, dir);
    }
}

main(dir).catch(e => {
    console.error(e);
    process.exit(1);
})
