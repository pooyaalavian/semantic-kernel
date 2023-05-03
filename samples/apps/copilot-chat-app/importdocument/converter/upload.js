const { readdir, readFile } = require('fs/promises');
const { exec: _exec } = require('child_process');
const FormData = require('form-data');
const axios = require('axios');
const https = require('https');
const url = 'https://localhost:40443/importDocument';

const exec = (cmd) => new Promise((resolve, reject) => {
    _exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error executing command: ${cmd}`);
            console.error(stderr);
            reject(stderr);
            return;
        }
        resolve(stdout);
    });
});

async function runDotnet(file_path) {
    const cmd = `dotnet run -- --file "${file_path}"`;
    console.log('running > ', cmd);
    try {
        await exec(cmd);
        return [file_path, true];
    }
    catch (e) {
        return [file_path, false];
    }
}

async function sendPost(file_path) {
    const fileBuffer = await readFile(file_path);

    const formData = new FormData();
    formData.append('file', fileBuffer, {
        filename: file_path.split('/').pop(),
        contentType: 'application/octet-stream'
    });

    try {
        // Send the form data in a POST request
        // At request level
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders()
            }, 
            httpsAgent,
        });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function upload_folder_all(folder, extension_match = /txt$/, n = 20) {
    const files = await readdir(folder);
    const resultsPromise = files
        .filter(s => s.match(extension_match))
        .filter((s, id) => n > 0 ? id < n : true)
        .map(file => runDotnet(`${folder}/${file}`));
    const results = await Promise.allSettled(resultsPromise);
    const success = results.map(r => r.value).filter(r => r[1]).map(r => r[0]);
    const failure = results.map(r => r.value).filter(r => !r[1]).map(r => r);
    console.log({ failure, success });
}

async function upload_folder_1x1(folder, extension_match = /txt$/, n = 0) {
    const files = await readdir(folder);
    const results = [];
    const arr = files
        .filter(s => s.match(extension_match))
        .filter((s, id) => n > 0 ? id < n : true);
    for (const file of arr) {
        try {
            // const res = await runDotnet(`${folder}/${file}`);
            const res = await sendPost(`${folder}/${file}`);
            results.push({ file, res, success: true });
        }
        catch (e) {
            results.push({ file, success: false });
            console.log(`FAIL: ${file}`);
        }
    }
    const success = results.filter(r => r.success);
    const failure = results.filter(r => !r.success);
    console.log({ failure, success: success.length });
}


const upload_folder = upload_folder_1x1;
// const upload_folder = upload_folder_all;
upload_folder('sample-docs/Detail_Data_ITSD_L1_CurrentMonth_No_PII.csvdata').catch(console.error);


module.exports = {
    upload_folder
}