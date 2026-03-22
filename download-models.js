const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsUrl = 'https://vladmandic.github.io/face-api/model/';
const modelsDir = path.join(__dirname, 'frontend', 'public', 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const files = [
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2'
];

async function download(file) {
    const dest = path.join(modelsDir, file);
    return new Promise((resolve, reject) => {
        https.get(modelsUrl + file, (res) => {
            if (res.statusCode !== 200) return reject(new Error(`Failed to download ${file}`));
            const fileStream = fs.createWriteStream(dest);
            res.pipe(fileStream);
            fileStream.on('finish', () => resolve(true));
        }).on('error', reject);
    });
}

(async () => {
    for (const file of files) {
        console.log(`Downloading ${file}...`);
        try {
            await download(file);
        } catch (e) {
            console.error(e.message);
        }
    }
    console.log('Done.');
})();
