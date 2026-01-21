const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to api.js
const apiFilePath = path.join(__dirname, '../src/services/api.js');

// Function to get local IP address
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                // This seems to be the most reliable way to pick the main interface
                // Usually it's the first non-internal IPv4
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback
}

const localIp = getLocalIpAddress();
console.log(`Detected Local IP: ${localIp}`);

try {
    let content = fs.readFileSync(apiFilePath, 'utf8');

    // Regex to assume the line is something like: const API_URL = 'http://.../api';
    // We want to replace the IP part.
    // Assuming format: const API_URL = 'http://<IP>:5000/api';
    const regex = /(const\s+API_URL\s*=\s*'http:\/\/)([\d\.]+)(:5000\/api';)/;

    if (regex.test(content)) {
        const newContent = content.replace(regex, `$1${localIp}$3`);

        // Only write if changed to avoid unnecessary writes/reloads
        if (newContent !== content) {
            fs.writeFileSync(apiFilePath, newContent, 'utf8');
            console.log(`Updated API_URL in ${apiFilePath} to ${localIp}`);
        } else {
            console.log(`API_URL is already up to date (${localIp})`);
        }
    } else {
        console.error('Could not find API_URL definition in api.js to update.');
    }
} catch (error) {
    console.error('Error updating API URL:', error);
}
