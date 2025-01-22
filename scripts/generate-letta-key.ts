import { LettaKeyManager } from '../services/letta/letta-keys';

const apiKey = LettaKeyManager.generateKey();
console.log('Generated Letta API Key:', apiKey);
console.log('\nAdd this to your environment variables:');
console.log('LETTA_API_KEY=' + apiKey); 