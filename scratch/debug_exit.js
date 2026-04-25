import { spawn } from 'node:child_process';

console.log('--- Debugging Server Exit ---');
const proc = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, DEBUG: '*' }
});

proc.on('exit', (code, signal) => {
  console.log(`\n!!! Server process exited with code ${code} and signal ${signal}`);
});

proc.on('error', (err) => {
  console.error('Failed to start server:', err);
});
