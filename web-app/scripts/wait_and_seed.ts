import { execSync } from 'child_process';
import * as net from 'net';

function waitPort(port: number, timeout = 60000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        function check() {
            const socket = new net.Socket();
            socket.setTimeout(1000);
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            socket.on('error', () => {
                socket.destroy();
                if (Date.now() - start > timeout) reject(new Error(`Timeout waiting for port ${port}`));
                else setTimeout(check, 1000);
            });
            socket.connect(port, '127.0.0.1');
        }
        check();
    });
}

async function run() {
    try {
        console.log('⏳ Waiting for emulator ports (8080, 9099)...');
        await Promise.all([waitPort(8080), waitPort(9099)]);
        console.log('🚀 Ports ready! Starting onboarding and seeding...');
        
        execSync('npx tsx scripts/onboard_family.ts', { stdio: 'inherit' });
        execSync('npx tsx scripts/seed_historical_data.ts botswana-holding', { stdio: 'inherit' });
        execSync('npx tsx scripts/verify_headless.ts', { stdio: 'inherit' });
        
        console.log('✨ All systems go!');
    } catch (err) {
        console.error('❌ Failed:', err);
        process.exit(1);
    }
}

run();
