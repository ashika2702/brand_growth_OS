async function simulateGoogleLead() {
  const clientId = 'client_c30nz9n1i'; // Using active client from logs
  const webhookUrl = `http://localhost:3000/api/webhooks/google/${clientId}`;
  
  console.log('--- SIMULATING GOOGLE ADS LEAD (M03) ---');
  
  const payload = {
    "lead_id": "999888777665544",
    "campaign_id": "123456789",
    "google_key": "test_google_ads_key_123", // We need to make sure this is in DB
    "user_column_data": [
      { "column_id": "FULL_NAME", "string_value": "Ad Testing User" },
      { "column_id": "EMAIL", "string_value": "ad-test@example.com" },
      { "column_id": "PHONE_NUMBER", "string_value": "+61400000000" }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('RESPONSE STATUS:', response.status);
    console.log('RESPONSE BODY:', result);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: Webhook received and processed.');
    } else {
      console.log('❌ FAILED: Check the logs or credentials.');
    }
  } catch (error) {
    console.error('ERROR SIMULATING LEAD:', error);
  }
}

simulateGoogleLead();
