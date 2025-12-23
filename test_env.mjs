// Test script to check if environment variables are loaded correctly
import dotenv from 'dotenv';
import { config } from 'dotenv';

// Load environment variables from .env.local
const result = config({ path: '.env.local' });

if (result.error) {
    console.error('Error loading .env.local file:', result.error);
} else {
    console.log('.env.local file loaded successfully');
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '***** (set)' : 'NOT SET');
    console.log('Environment variables available:', Object.keys(result.parsed).length > 0);
    console.log('Available variables:', Object.keys(result.parsed));
}