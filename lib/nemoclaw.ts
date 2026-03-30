/**
 * NemoClaw Local Brain Integration — v1.0
 * Connects Brand Growth OS to the private local AI hub.
 */
export async function callNemoClaw({
    system,
    prompt,
    maxTokens = 1000
}: {
    system: string;
    prompt: string;
    maxTokens?: number;
}) {
    try {
        console.log(`🧠 [NemoClaw] Sending request to brain: ${prompt.slice(0, 50)}...`);
        const endpoint = process.env.NEMOCLAW_ENDPOINT || 'http://localhost:3000/api/chat';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: prompt, // Use 'message' for bridge compatibility
                prompt,         // Keep 'prompt' for future-proofing
                system,         // Rule 1 & 2 Context Injection
                maxTokens
            }),
        });

        if (!response.ok) {
            throw new Error(`NemoClaw error: ${response.statusText}`);
        }

        const text = await response.text();
        console.log(`📡 [NemoClaw] Raw response: ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`);

        let content = '';
        try {
            const data = JSON.parse(text);
            content = data.response || data.content || '';
        } catch (e) {
            // If it's not JSON, it's the raw text response from the bridge
            content = text;
        }

        console.log(`✅ [NemoClaw] Response processed. Length: ${content.length}`);

        // Normalize response to match standard OpenAI/Llama structure for BGO compatibility
        return {
            choices: [
                {
                    message: {
                        content: content,
                        role: 'assistant'
                    }
                }
            ],
            model: 'qwen-local',
            usage: {}
        };
    } catch (error) {
        console.error('Error calling NemoClaw:', error);
        throw error;
    }
}
