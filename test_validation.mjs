import { validateInputLength } from './lib/validation.js';

function createWords(count) {
    return Array(count).fill('word').join(' ');
}

const testCases = [
    {
        name: "Free plan - Exactly 600 words",
        text: createWords(600),
        plan: 'free',
        expected: { valid: true }
    },
    {
        name: "Free plan - 601 words (INVALID)",
        text: createWords(601),
        plan: 'free',
        expected: {
            valid: false,
            message: "Your Free plan is limited to 600 words; please upgrade to Pro for longer inputs."
        }
    },
    {
        name: "Pro plan - Exactly 2500 words",
        text: createWords(2500),
        plan: 'pro',
        expected: { valid: true }
    },
    {
        name: "Pro plan - 2501 words (INVALID)",
        text: createWords(2501),
        plan: 'pro',
        expected: {
            valid: false,
            message: "Your Pro plan is limited to 2500 words per input."
        }
    },
    {
        name: "Empty input",
        text: "",
        plan: 'free',
        expected: { valid: false, message: "Input text is required." }
    }
];

let failed = 0;

console.log("Running Validation Tests...\n");

testCases.forEach(tc => {
    const result = validateInputLength(tc.text, tc.plan);
    const passed = result.valid === tc.expected.valid &&
        (tc.expected.message === undefined || result.message === tc.expected.message);

    if (passed) {
        console.log(`✅ PASSED: ${tc.name}`);
    } else {
        console.log(`❌ FAILED: ${tc.name}`);
        console.log(`   Expected:`, tc.expected);
        console.log(`   Received:`, result);
        failed++;
    }
});

console.log(`\nTests completed: ${testCases.length}, Failed: ${failed}`);

if (failed > 0) {
    process.exit(1);
}
