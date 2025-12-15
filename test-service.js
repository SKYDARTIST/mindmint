// Simple test script to verify the OpenAI functionality
const { generateContent } = require('./services/openaiService.ts');
const { AppMode } = require('./types.ts');

// Mock test data
const testText = `
Machine Learning Basics
Machine learning is a subset of artificial intelligence that focuses on algorithms.
Neural networks are computational models inspired by biological neural networks.
Deep learning uses multiple layers to progressively extract higher-level features.
Training data is essential for machine learning models to learn patterns.
Testing validates the performance of machine learning models.
`;

async function testMockFunctionality() {
  console.log('🧪 Testing MindMint AI Mock Functionality\n');
  
  try {
    // Test Mindmap
    console.log('1. Testing Mindmap Generation:');
    const mindmap = await generateContent(AppMode.MINDMAP, testText, 'classic');
    console.log('✅ Mindmap generated:', mindmap.substring(0, 100) + '...\n');

    // Test Flashcards
    console.log('2. Testing Flashcard Generation:');
    const flashcards = await generateContent(AppMode.FLASHCARDS, testText, 'classic');
    console.log('✅ Flashcards generated:', flashcards.length, 'cards');
    console.log('Sample card:', flashcards[0], '\n');

    // Test Quiz
    console.log('3. Testing Quiz Generation:');
    const quiz = await generateContent(AppMode.QUIZ, testText, 'classic');
    console.log('✅ Quiz generated:', quiz.length, 'questions');
    console.log('Sample question:', quiz[0].question, '\n');

    // Test Infographic
    console.log('4. Testing Infographic Generation:');
    const infographic = await generateContent(AppMode.INFOGRAPHIC, testText, 'classic');
    console.log('✅ Infographic generated:', infographic.title);
    console.log('Steps:', infographic.steps.length, '\n');

    // Test Summary
    console.log('5. Testing Summary Generation:');
    const summary = await generateContent(AppMode.SUMMARY, testText, 'bullet');
    console.log('✅ Summary generated:', summary.substring(0, 100) + '...\n');

    console.log('🎉 All mock functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMockFunctionality();