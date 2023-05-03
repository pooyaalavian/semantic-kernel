const { readFile, writeFile, mkdir } = require('fs/promises');
const { parse } = require('csv-parse/sync');

const default_prompt = ''
// `IT ticket database
// This document contains information regarding one IT ticket record., with Request ID "{Request_ID}" and Ticket ID "{Ticket_ID}".
// <null> means no value was provided for an item. 
// `;

const fillPrompt = (prompt, data) => prompt.replace(/{(.*?)}/g, (m, key) => data[key] || `{${key}}`);


const stringify = (obj) => {
    return Object.entries(obj).map(x => `- ${x[0]}: ${x[1] || "<null>"}`).join('\n')
}

async function parseCsv(csv_path, id_col, prompt = default_prompt) {
    const content = await readFile(csv_path);
    const data = parse(content, {
        delimiter: ",",
        columns: true,
        // trim: true,
    });
    const folder_path = `${csv_path}data`;
    await mkdir(folder_path, { recursive: true })
    data.map((row, id) => ({ ...row, _id: id_col ? row[id_col] : id })).forEach(row => {
        const filename = `${folder_path}/${row._id}.txt`;
        writeFile(filename, fillPrompt(prompt, row) + stringify(row));
    });
}


// parseCsv('../sample-docs/Cyber_Security_KnowledgeBaseOct-v1(1).csv').catch(e => console.error(e));
parseCsv('sample-docs/Detail_Data_ITSD_L1_CurrentMonth_No_PII.csv', 'Request_ID').catch(e => console.error(e));

module.exports = {
    parseCsv
}