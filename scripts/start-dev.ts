import { spawn } from 'child_process';

// Start Next.js dev server
const nextProcess = spawn('pnpm', ['dev'], {
  stdio: 'inherit',
  shell: true
});

// Start ngrok
const ngrokProcess = spawn('ngrok', ['http', '3000', '--hostname=tolerant-bengal-hideously.ngrok-free.app'], {
  stdio: 'inherit',
  shell: true
});

// Handle process cleanup
process.on('SIGINT', () => {
  nextProcess.kill();
  ngrokProcess.kill();
  process.exit();
});
