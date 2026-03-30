/**
 * Test NemoClaw Integration
 * Run with: node scripts/test-nemoclaw.js
 */
// require('dotenv').config();

async function testIntegration() {
    console.log('Testing NemoClaw Connection...');
    console.log('Endpoint:', process.env.NEMOCLAW_ENDPOINT || 'http://localhost:3000/api/chat');

    try {
        const response = await fetch(process.env.NEMOCLAW_ENDPOINT || 'http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system: "You are a helpful assistant.",
                prompt: "Say 'The Brain is Alive!'"
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success!');
            console.log('Response:', data.response || data.content);
        } else {
            console.error('❌ Failed:', response.status, response.statusText);
            console.log('Hint: Make sure START_MY_AI.bat is running!');
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
        console.log('Hint: Make sure START_MY_AI.bat is running!');
    }
}

testIntegration();
