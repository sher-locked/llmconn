// CommonJS version of the test script
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAIConnection() {
  console.log('Testing OpenAI API connection...');
  
  try {
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in .env.local file');
    }
    
    console.log('API Key is set. Attempting to call OpenAI API...');
    
    // Make a simple API call
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using a cheaper model for testing
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello world!' }
      ],
      max_tokens: 10,
    });
    
    // Check response
    if (response.choices && response.choices.length > 0) {
      console.log('✅ OpenAI API connection successful!');
      console.log('Response:', response.choices[0].message.content);
    } else {
      console.log('⚠️ API call succeeded but returned an unexpected response format');
      console.log('Response:', response);
    }
  } catch (error) {
    console.error('❌ Error connecting to OpenAI API:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error message: ${error.response.data.error.message}`);
    } else {
      console.error(error.message || error);
    }
    
    // Provide troubleshooting tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Check that your API key is correct in .env.local');
    console.log('2. Verify that you have billing set up at https://platform.openai.com/account/billing');
    console.log('3. Check if you have usage limits set at https://platform.openai.com/account/billing/limits');
    console.log('4. Ensure you have sufficient credit in your OpenAI account');
  }
}

// Run the test
testOpenAIConnection(); 