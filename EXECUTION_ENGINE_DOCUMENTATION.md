# MindMint Internal Execution Engine

## Overview

The MindMint Internal Execution Engine implements a strict 3-step process for content generation that ensures all output is grounded in the source material without generalization or fabrication.

## 3-Step Process

### STEP 1: UNDERSTAND (Silent Analysis)
**Purpose**: Extract structural information from input text without assumptions

**Implementation**: `analyzeInputText()` function in `lib/executionEngine.ts`

**Analysis Components**:
- **Domain Detection**: Identifies subject area (technology, science, business, education, etc.)
- **Intent Classification**: Determines communication purpose (explanatory, instructive, analytical, etc.)
- **Audience Level Assessment**: Evaluates complexity level (beginner, intermediate, advanced, mixed)
- **Key Concept Extraction**: Identifies most important terms and ideas from frequency analysis
- **Structure Recognition**: Detects underlying organization (linear, hierarchical, procedural, etc.)
- **Content Type Categorization**: Classifies material type (educational, technical, business, academic, etc.)

**Grounding Principle**: All analysis uses only explicit information present in the input text.

### STEP 2: STRUCTURE (Silent Planning)
**Purpose**: Create detailed generation plan based on MODE and LAYOUT rules

**Implementation**: `createStructuredPlan()` function in `lib/executionEngine.ts`

**Structure Components**:
- **Layout-Specific Requirements**: Defines structural rules for each layout type
- **Grounding Rules**: Explicit constraints to prevent generalization
- **Output Constraints**: Limits based on analysis and layout requirements
- **Generation Strategy**: Step-by-step approach for each content type

**Layout Enforcement**:
- **Classic Mindmap**: Hub-and-spoke with central root node
- **Chain Mindmap**: Linear sequence with single connections
- **Layered Mindmap**: Multi-level hierarchy (minimum 3 levels)
- **Flow Mindmap**: Left-to-right process flow
- **Summary Executive**: Concise paragraph format
- **Summary Bullet**: Action-oriented bullet points
- **Summary Notes**: Study-style labeled format
- **Summary Structured**: Hierarchical markdown format

### STEP 3: GENERATE (Strict Execution)
**Purpose**: Produce output using only input text information

**Implementation**: `executeStructuredPlan()` function in `lib/executionEngine.ts`

**Generation Principles**:
- **Content Extraction**: All elements derived directly from input sentences
- **No Fabrication**: Zero invented examples, terminology, or concepts
- **No Generalization**: Information limited to what appears explicitly in text
- **Preservation**: Maintains original subject matter and intent

## Code Architecture

### Core Files

#### `lib/executionEngine.ts`
Main execution engine with three core functions:

```typescript
// Step 1: UNDERSTAND
export function analyzeInputText(inputText: string): TextAnalysis

// Step 2: STRUCTURE  
export function createStructuredPlan(
  analysis: TextAnalysis, 
  mode: AppMode, 
  layout: string
): StructuredPlan

// Step 3: GENERATE
export function executeStructuredPlan(
  plan: StructuredPlan, 
  inputText: string
): any

// Complete execution
export function executeMindMintEngine(
  inputText: string, 
  mode: AppMode, 
  layout: string
): any
```

#### `services/openaiService.ts`
Updated to integrate execution engine:

```typescript
export const generateContent = async (
  mode: AppMode,
  inputText: string,
  layout: LayoutType = 'classic',
  useExecutionEngine: boolean = true  // Default to true
): Promise<any>
```

#### `app/actions.ts`
Updated to use execution engine by default:

```typescript
const result = await generateContent(mode, inputText, layout as any, true);
```

### Data Types

```typescript
interface TextAnalysis {
  domain: string;
  intent: string;
  audienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  keyConcepts: string[];
  structure: 'linear' | 'hierarchical' | 'procedural' | 'descriptive' | 'comparative' | 'narrative';
  contentType: 'educational' | 'informational' | 'technical' | 'business' | 'academic' | 'casual';
}

interface StructuredPlan {
  mode: AppMode;
  layout: string;
  structure: any;
  groundingRules: string[];
  outputConstraints: any;
}
```

## Implementation Details

### Content Extraction Methods

#### Mindmap Generation
- **Classic**: Extracts main topic as center, branches from remaining sentences
- **Chain**: Linear progression through ordered sentences
- **Layered**: Three-level hierarchy with root → categories → details
- **Flow**: Left-to-right progression maintaining sequence

#### Summary Generation
- **Executive**: First 4 sentences condensed into paragraph
- **Bullet**: Key phrases from sentences as action bullets
- **Notes**: Labeled sections with core concepts
- **Structured**: Markdown headers with organized content

#### Flashcard Generation
- **Questions**: Derived from explicit statements in text
- **Answers**: Direct quotes or close paraphrases from source
- **Tags**: Generated from content categories

#### Quiz Generation
- **Questions**: Based on explicit information in sentences
- **Options**: Generated from actual text content + distractors
- **Correct Answers**: Verifiable from input text
- **Explanations**: Direct quotes from source material

#### Infographic Generation
- **Steps**: Sequential extraction from text paragraphs
- **Icons**: Rotating set for visual consistency
- **Content**: Actual text content for descriptions

### Grounding Enforcement

Each content type includes specific grounding rules:

```typescript
const groundingRules = [
  'Use ONLY information present in the input text',
  'DO NOT introduce examples, terminology, or concepts not explicitly mentioned',
  'DO NOT generalize beyond the input domain',
  'Preserve original subject matter and intent'
];
```

### Layout-Specific Constraints

```typescript
// Mindmap node counts by layout
const nodeCounts = {
  classic: 7,    // 1 center + 6 branches
  chain: 6,      // Linear sequence
  layered: 9,    // 1 root + 3 level-1 + 5 level-2
  flow: 6        // Horizontal progression
};

// Summary lengths by layout
const summaryLengths = {
  executive: { sentences: 4, maxWords: 80 },
  bullet: { bullets: 6, maxWordsPerBullet: 15 },
  notes: { lines: 8, maxWordsPerLine: 12 },
  structured: { sections: 4, maxWordsPerSection: 40 }
};
```

## Testing and Validation

### Interactive Test Interface
`test_execution_engine.html` provides hands-on testing of the execution engine:

**Features**:
- Real-time 3-step process visualization
- Example inputs for different domains
- Mode and layout selection
- Step-by-step execution display
- Output validation

**Test Cases**:
- **Photosynthesis**: Scientific content with procedural structure
- **Business Strategy**: Business content with analytical structure  
- **Technical Tutorial**: Technical content with instructional structure

### Validation Principles

1. **Content Verification**: All output elements traceable to input
2. **Structure Compliance**: Layout requirements strictly enforced
3. **Grounding Check**: No external information introduced
4. **Domain Preservation**: Original subject matter maintained

## Benefits

### Strict Grounding
- Eliminates hallucination and fabrication
- Ensures accuracy to source material
- Maintains content integrity
- Prevents domain drift

### Predictable Structure
- Consistent layout enforcement
- Reproducible generation patterns
- Clear output expectations
- Quality assurance

### Scalable Architecture
- Modular design for easy extension
- Type-safe implementation
- Performance optimized
- Backwards compatible

## Integration Status

✅ **Implemented**: Complete 3-step execution engine  
✅ **Integrated**: Default content generation method  
✅ **Tested**: Interactive test interface  
✅ **Documented**: Comprehensive documentation  

## Usage

The execution engine is now the default generation method for all MindMint content types. Users will experience:

1. **Consistent Quality**: All content grounded in source material
2. **Predictable Output**: Layout-specific structures enforced
3. **No Fabrication**: Zero invented information
4. **Domain Preservation**: Original subject matter maintained

The system automatically analyzes input text, creates a structured plan, and generates content following strict grounding rules, ensuring reliable and accurate content generation for all use cases.