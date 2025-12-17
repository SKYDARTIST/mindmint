/**
 * MindMint Internal Execution Engine
 * Implements the 3-step process: UNDERSTAND → STRUCTURE → GENERATE
 * Strictly grounded in input text without generalization or fabrication
 */

import { AppMode, MindmapLayout, FlashcardLayout, QuizLayout, SummaryLayout, InfographicLayout } from '../types';

export interface TextAnalysis {
  domain: string;
  intent: string;
  audienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  keyConcepts: string[];
  structure: 'linear' | 'hierarchical' | 'procedural' | 'descriptive' | 'comparative' | 'narrative';
  contentType: 'educational' | 'informational' | 'technical' | 'business' | 'academic' | 'casual';
  extractedIdeas: string[];
}

export interface StructuredPlan {
  mode: AppMode;
  layout: string;
  structure: any;
  groundingRules: string[];
  outputConstraints: any;
}

/**
 * STEP 1: UNDERSTAND - Extract ALL distinct ideas for grounded expansion
 * GROUNDED EXPANSION RULE: May split/paraphrase/group input ideas, but MUST NOT add external concepts
 */
export function analyzeInputText(inputText: string): TextAnalysis {
  if (!inputText || typeof inputText !== 'string') {
    return {
      domain: 'unknown',
      intent: 'unknown',
      audienceLevel: 'mixed',
      keyConcepts: [],
      structure: 'descriptive',
      contentType: 'informational',
      extractedIdeas: []
    };
  }

  const text = inputText.trim();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);

  // Domain detection based on content analysis
  const domain = detectDomain(text, words);
  
  // Intent detection
  const intent = detectIntent(text, sentences);
  
  // Audience level detection
  const audienceLevel = detectAudienceLevel(text, words);
  
  // Key concepts extraction
  const keyConcepts = extractKeyConcepts(words, sentences);
  
  // Structure detection
  const structure = detectStructure(text, sentences);
  
  // Content type detection
  const contentType = detectContentType(text, words);
  
  // Extract ALL distinct ideas for grounded expansion
  const extractedIdeas = extractAllIdeas(text, sentences);

  return {
    domain,
    intent,
    audienceLevel,
    keyConcepts,
    structure,
    contentType,
    extractedIdeas
  };
}

function extractAllIdeas(text: string, sentences: string[]): string[] {
  const ideas: string[] = [];
  
  // Extract individual sentences as base ideas
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 10) {
      ideas.push(trimmed);
    }
  });
  
  // Split longer sentences into multiple concepts
  const expandedIdeas: string[] = [];
  ideas.forEach(idea => {
    if (idea.length > 100) {
      // Split long sentences by conjunctions and commas
      const subIdeas = idea.split(/[,;]|(?:\s+and\s+)|(?:\s+but\s+)|(?:\s+or\s+)/i)
        .map(sub => sub.trim())
        .filter(sub => sub.length > 15);
      expandedIdeas.push(...subIdeas);
    } else {
      expandedIdeas.push(idea);
    }
  });
  
  // Extract key phrases and concepts
  const words = text.toLowerCase().split(/\W+/);
  const importantPhrases: string[] = [];
  
  // Find noun phrases (simple extraction)
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 4 && words[i + 1].length > 3) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (!importantPhrases.includes(phrase)) {
        importantPhrases.push(phrase);
      }
    }
  }
  
  // Combine all ideas, ensuring we have enough for minimum requirements
  const allIdeas = [...expandedIdeas];
  
  // Add important phrases if we need more content
  if (allIdeas.length < 6) {
    allIdeas.push(...importantPhrases.slice(0, 6 - allIdeas.length));
  }
  
  // Remove duplicates and filter
  const uniqueIdeas = [...new Set(allIdeas)]
    .filter(idea => idea.length > 8)
    .slice(0, 15); // Limit to prevent over-generation
  
  return uniqueIdeas.length > 0 ? uniqueIdeas : sentences.map(s => s.trim()).filter(s => s.length > 10);
}

function detectDomain(text: string, words: string[]): string {
  const domainKeywords = {
    'technology': ['algorithm', 'software', 'system', 'code', 'programming', 'database', 'network', 'api', 'framework'],
    'science': ['research', 'study', 'experiment', 'hypothesis', 'theory', 'analysis', 'data', 'method'],
    'business': ['strategy', 'market', 'customer', 'revenue', 'profit', 'management', 'leadership', 'business'],
    'education': ['learning', 'student', 'teacher', 'course', 'lesson', 'curriculum', 'education', 'academic'],
    'health': ['medical', 'health', 'treatment', 'disease', 'patient', 'doctor', 'therapy', 'wellness'],
    'finance': ['investment', 'financial', 'banking', 'money', 'economy', 'trading', 'portfolio', 'risk']
  };

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(keyword => words.includes(keyword))) {
      return domain;
    }
  }

  return 'general';
}

function detectIntent(text: string, sentences: string[]): string {
  const intentPatterns = {
    'explanatory': ['explains', 'describes', 'illustrates', 'demonstrates', 'shows'],
    'instructive': ['steps', 'how to', 'process', 'procedure', 'method', 'guide'],
    'analytical': ['analyzes', 'compares', 'examines', 'evaluates', 'assesses'],
    'narrative': ['story', 'history', 'experience', 'happened', 'journey'],
    'descriptive': ['characteristics', 'features', 'properties', 'qualities']
  };

  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => text.toLowerCase().includes(pattern))) {
      return intent;
    }
  }

  return 'informational';
}

function detectAudienceLevel(text: string, words: string[]): 'beginner' | 'intermediate' | 'advanced' | 'mixed' {
  const beginnerWords = ['basic', 'simple', 'introduction', 'beginner', 'overview', 'fundamental'];
  const advancedWords = ['complex', 'sophisticated', 'advanced', 'detailed', 'comprehensive', 'nuanced'];
  
  const beginnerCount = words.filter(word => beginnerWords.includes(word)).length;
  const advancedCount = words.filter(word => advancedWords.includes(word)).length;
  
  if (beginnerCount > advancedCount && beginnerCount > 0) {
    return 'beginner';
  } else if (advancedCount > beginnerCount && advancedCount > 0) {
    return 'advanced';
  } else if (beginnerCount === 0 && advancedCount === 0) {
    return 'intermediate';
  }
  
  return 'mixed';
}

function extractKeyConcepts(words: string[], sentences: string[]): string[] {
  // Extract most frequent meaningful words
  const wordFreq = words.reduce((freq, word) => {
    freq[word] = (freq[word] || 0) + 1;
    return freq;
  }, {} as Record<string, number>);

  // Get top concepts excluding common words
  const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'];
  const concepts = Object.entries(wordFreq)
    .filter(([word]) => !stopWords.includes(word) && word.length > 4)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);

  return concepts;
}

function detectStructure(text: string, sentences: string[]): 'linear' | 'hierarchical' | 'procedural' | 'descriptive' | 'comparative' | 'narrative' {
  const structurePatterns = {
    linear: ['first', 'second', 'then', 'next', 'finally', 'after', 'before'],
    hierarchical: ['category', 'type', 'class', 'group', 'level', 'tier'],
    procedural: ['step', 'process', 'method', 'procedure', 'how to'],
    comparative: ['vs', 'versus', 'compared', 'difference', 'similar', 'contrast'],
    narrative: ['story', 'happened', 'experience', 'journey', 'history']
  };

  for (const [structure, patterns] of Object.entries(structurePatterns)) {
    if (patterns.some(pattern => text.toLowerCase().includes(pattern))) {
      return structure as any;
    }
  }

  return 'descriptive';
}

function detectContentType(text: string, words: string[]): 'educational' | 'informational' | 'technical' | 'business' | 'academic' | 'casual' {
  const technicalTerms = ['algorithm', 'system', 'protocol', 'architecture', 'framework', 'implementation'];
  const academicTerms = ['research', 'study', 'analysis', 'methodology', 'hypothesis', 'theory'];
  const businessTerms = ['strategy', 'market', 'revenue', 'customer', 'business', 'profit'];
  const educationalTerms = ['learn', 'student', 'course', 'lesson', 'teach', 'understand'];

  if (technicalTerms.some(term => words.includes(term))) return 'technical';
  if (academicTerms.some(term => words.includes(term))) return 'academic';
  if (businessTerms.some(term => words.includes(term))) return 'business';
  if (educationalTerms.some(term => words.includes(term))) return 'educational';

  return 'informational';
}

/**
 * STEP 2: STRUCTURE
 * Plan output based on MODE and LAYOUT rules
 */
export function createStructuredPlan(
  analysis: TextAnalysis,
  mode: AppMode,
  layout: string
): StructuredPlan {
  const groundingRules = generateGroundingRules(analysis, mode);
  const outputConstraints = generateOutputConstraints(analysis, mode, layout);
  
  let structure: any = {};

  switch (mode) {
    case AppMode.MINDMAP:
      structure = planMindmapStructure(analysis, layout as MindmapLayout);
      break;
    case AppMode.FLASHCARDS:
      structure = planFlashcardStructure(analysis, layout as FlashcardLayout);
      break;
    case AppMode.QUIZ:
      structure = planQuizStructure(analysis, layout as QuizLayout);
      break;
    case AppMode.SUMMARY:
      structure = planSummaryStructure(analysis, layout as SummaryLayout);
      break;
    case AppMode.INFOGRAPHIC:
      structure = planInfographicStructure(analysis, layout as InfographicLayout);
      break;
  }

  // ENFORCE MINIMUM OUTPUT COUNTS
  const minRequirements = getMinimumRequirements(mode);
  structure.minOutputCount = minRequirements.count;
  structure.maxOutputCount = minRequirements.maxCount;
  structure.validationRequired = true;

  return {
    mode,
    layout,
    structure,
    groundingRules,
    outputConstraints
  };
}

function getMinimumRequirements(mode: AppMode): { count: number; maxCount: number } {
  switch (mode) {
    case AppMode.MINDMAP:
      return { count: 6, maxCount: 12 }; // 6–12 concepts
    case AppMode.FLASHCARDS:
      return { count: 5, maxCount: 10 }; // 5–10 concepts
    case AppMode.QUIZ:
      return { count: 4, maxCount: 6 }; // 4–6 testable statements
    case AppMode.SUMMARY:
      return { count: 3, maxCount: 8 }; // All major points grouped
    case AppMode.INFOGRAPHIC:
      return { count: 4, maxCount: 6 }; // headline + 3–6 sections
    default:
      return { count: 1, maxCount: 5 };
  }
}

function generateGroundingRules(analysis: TextAnalysis, mode: AppMode): string[] {
  const rules = [
    'Use ONLY information present in the input text',
    'DO NOT introduce examples, terminology, or concepts not explicitly mentioned',
    'DO NOT generalize beyond the input domain',
    'Preserve original subject matter and intent'
  ];

  // Mode-specific rules
  switch (mode) {
    case AppMode.SUMMARY:
      rules.push('Summarize conservatively rather than creatively');
      if (analysis.contentType === 'academic') {
        rules.push('Maintain academic tone and terminology');
      }
      break;
    case AppMode.FLASHCARDS:
      rules.push('Questions must be directly answerable from input text');
      rules.push('Answers must reflect exact concepts from input');
      break;
    case AppMode.QUIZ:
      rules.push('Questions must be based on explicit information in text');
      rules.push('Correct answers must be verifiable from input');
      break;
  }

  return rules;
}

function generateOutputConstraints(analysis: TextAnalysis, mode: AppMode, layout: string): any {
  const constraints: any = {
    maxItems: getMaxItems(mode),
    style: layout,
    complexity: analysis.audienceLevel,
    contentType: analysis.contentType
  };

  switch (mode) {
    case AppMode.MINDMAP:
      constraints.nodeCount = getMindmapNodeCount(layout);
      break;
    case AppMode.SUMMARY:
      constraints.length = getSummaryLength(layout as SummaryLayout);
      break;
    case AppMode.FLASHCARDS:
      constraints.cardCount = getFlashcardCount(layout as FlashcardLayout);
      break;
    case AppMode.QUIZ:
      constraints.questionCount = getQuizCount(layout as QuizLayout);
      break;
  }

  return constraints;
}

function getMaxItems(mode: AppMode): number {
  switch (mode) {
    case AppMode.MINDMAP: return 10;
    case AppMode.FLASHCARDS: return 12;
    case AppMode.QUIZ: return 10;
    case AppMode.SUMMARY: return 1;
    case AppMode.INFOGRAPHIC: return 6;
    default: return 8;
  }
}

function planMindmapStructure(analysis: TextAnalysis, layout: MindmapLayout): any {
  const baseStructure: any = {
    layout,
    hierarchy: getMindmapHierarchy(layout),
    connectionRules: getMindmapConnections(layout),
    nodeRules: getMindmapNodes(layout)
  };

  if (layout === 'layered') {
    baseStructure.levels = 3;
    baseStructure.minChildrenPerLevel1 = 3;
    baseStructure.minChildrenPerLevel2 = 1;
  }

  return baseStructure;
}

function getMindmapHierarchy(layout: MindmapLayout): string {
  switch (layout) {
    case 'classic': return 'hub-and-spoke';
    case 'chain': return 'linear';
    case 'flow': return 'horizontal';
    case 'layered': return 'multi-level';
    default: return 'hub-and-spoke';
  }
}

function getMindmapConnections(layout: MindmapLayout): string {
  switch (layout) {
    case 'classic': return 'radial-from-center';
    case 'chain': return 'sequential';
    case 'flow': return 'left-to-right';
    case 'layered': return 'parent-to-child';
    default: return 'radial-from-center';
  }
}

function getMindmapNodes(layout: MindmapLayout): any {
  return {
    centerNode: 'required',
    maxBranches: layout === 'classic' ? 6 : (layout === 'chain' ? 8 : 5),
    labelStyle: 'quoted',
    idPattern: layout === 'layered' ? 'hierarchical' : 'simple'
  };
}

function getMindmapNodeCount(layout: string): number {
  switch (layout) {
    case 'classic': return 7;
    case 'chain': return 6;
    case 'layered': return 9;
    case 'flow': return 6;
    default: return 7;
  }
}

function planFlashcardStructure(analysis: TextAnalysis, layout: FlashcardLayout): any {
  return {
    layout,
    style: getFlashcardStyle(layout),
    structure: getFlashcardStructure(layout),
    contentRules: getFlashcardContentRules(analysis)
  };
}

function getFlashcardStyle(layout: FlashcardLayout): string {
  switch (layout) {
    case 'minimal': return 'simple-qa';
    case 'qa': return 'detailed-qa';
    case 'keyword': return 'term-definition';
    case 'chunked': return 'grouped-concepts';
    case 'scenario': return 'situation-response';
    default: return 'simple-qa';
  }
}

function getFlashcardStructure(layout: FlashcardLayout): any {
  switch (layout) {
    case 'minimal':
      return { question: 'direct', answer: 'concise', tag: 'optional' };
    case 'qa':
      return { question: 'elaborate', answer: 'detailed', tag: 'required' };
    case 'keyword':
      return { question: 'term', answer: 'definition', tag: 'category' };
    case 'chunked':
      return { question: 'grouped', answer: 'related', tag: 'group' };
    case 'scenario':
      return { question: 'situation', answer: 'response', tag: 'context' };
    default:
      return { question: 'direct', answer: 'concise', tag: 'optional' };
  }
}

function getFlashcardContentRules(analysis: TextAnalysis): string[] {
  return [
    'Extract questions from explicit statements in text',
    'Answers must directly quote or paraphrase input',
    'Maintain original technical accuracy',
    'Preserve domain-specific terminology'
  ];
}

function getFlashcardCount(layout: FlashcardLayout): number {
  switch (layout) {
    case 'minimal': return 10;
    case 'qa': return 8;
    case 'keyword': return 12;
    case 'chunked': return 6;
    case 'scenario': return 8;
    default: return 8;
  }
}

function planQuizStructure(analysis: TextAnalysis, layout: QuizLayout): any {
  return {
    layout,
    questionTypes: getQuizQuestionTypes(layout),
    difficulty: analysis.audienceLevel,
    contentGrounding: 'strict',
    structure: getQuizStructure(layout)
  };
}

function getQuizQuestionTypes(layout: QuizLayout): string[] {
  switch (layout) {
    case 'classic': return ['multiple-choice', 'true-false'];
    case 'mcq-heavy': return ['multiple-choice'];
    case 'tf-speed': return ['true-false'];
    case 'scenario': return ['multiple-choice', 'short-answer'];
    case 'mixed': return ['multiple-choice', 'true-false', 'short-answer'];
    default: return ['multiple-choice'];
  }
}

function getQuizStructure(layout: QuizLayout): any {
  return {
    questionCount: getQuizCount(layout),
    options: getQuizOptions(layout),
    explanation: 'required',
    difficulty: 'adaptive'
  };
}

function getQuizCount(layout: QuizLayout): number {
  switch (layout) {
    case 'classic': return 10;
    case 'mcq-heavy': return 12;
    case 'tf-speed': return 8;
    case 'scenario': return 8;
    case 'mixed': return 10;
    default: return 8;
  }
}

function getQuizOptions(layout: QuizLayout): number {
  switch (layout) {
    case 'mcq-heavy': return 5;
    case 'tf-speed': return 2;
    default: return 4;
  }
}

function planSummaryStructure(analysis: TextAnalysis, layout: SummaryLayout): any {
  return {
    layout,
    format: getSummaryFormat(layout),
    length: getSummaryLength(layout),
    structure: getSummaryStructure(layout),
    groundingLevel: 'strict'
  };
}

function getSummaryFormat(layout: SummaryLayout): string {
  switch (layout) {
    case 'executive': return 'paragraph';
    case 'bullet': return 'bullet-points';
    case 'notes': return 'labeled-notes';
    case 'infostructured': return 'headings-subpoints';
    default: return 'paragraph';
  }
}

function getSummaryLength(layout: SummaryLayout): any {
  switch (layout) {
    case 'executive': return { sentences: 4, maxWords: 80 };
    case 'bullet': return { bullets: 6, maxWordsPerBullet: 15 };
    case 'notes': return { lines: 8, maxWordsPerLine: 12 };
    case 'infostructured': return { sections: 4, maxWordsPerSection: 40 };
    default: return { sentences: 3, maxWords: 60 };
  }
}

function getSummaryStructure(layout: SummaryLayout): any {
  switch (layout) {
    case 'executive':
      return { style: 'concise-paragraph', tone: 'professional' };
    case 'bullet':
      return { style: 'action-oriented', bulletType: 'dash' };
    case 'notes':
      return { style: 'study-notes', labels: ['Definitions', 'Key Points'] };
    case 'infostructured':
      return { style: 'hierarchical', headers: 'markdown' };
    default:
      return { style: 'concise-paragraph', tone: 'neutral' };
  }
}

function planInfographicStructure(analysis: TextAnalysis, layout: InfographicLayout): any {
  return {
    layout,
    structure: getInfographicStructure(layout),
    visualRules: getInfographicVisualRules(layout),
    contentExtraction: 'sequential'
  };
}

function getInfographicStructure(layout: InfographicLayout): any {
  switch (layout) {
    case 'three_column': return { columns: 3, flow: 'top-to-bottom' };
    case 'timeline': return { orientation: 'horizontal', sequence: 'chronological' };
    case 'pillars': return { pillars: 3, base: 'shared' };
    case 'flow': return { direction: 'left-to-right', connections: 'sequential' };
    case 'comparison': return { sides: 2, criteria: 'parallel' };
    default: return { columns: 3, flow: 'top-to-bottom' };
  }
}

function getInfographicVisualRules(layout: InfographicLayout): any {
  return {
    icons: 'consistent-style',
    colors: 'limited-palette',
    typography: 'hierarchical',
    spacing: 'balanced'
  };
}

/**
 * STEP 3: GENERATE
 * Execute the structured plan using only input text information
 */
export function executeStructuredPlan(
  plan: StructuredPlan,
  inputText: string
): any {
  const { mode, layout, structure, outputConstraints } = plan;

  switch (mode) {
    case AppMode.MINDMAP:
      return generateMindmapFromPlan(inputText, structure, outputConstraints);
    case AppMode.FLASHCARDS:
      return generateFlashcardsFromPlan(inputText, structure, outputConstraints);
    case AppMode.QUIZ:
      return generateQuizFromPlan(inputText, structure, outputConstraints);
    case AppMode.SUMMARY:
      return generateSummaryFromPlan(inputText, structure, outputConstraints);
    case AppMode.INFOGRAPHIC:
      return generateInfographicFromPlan(inputText, structure, outputConstraints);
    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }
}

function generateMindmapFromPlan(
  inputText: string,
  structure: any,
  constraints: any
): string {
  // Use extracted ideas for better decomposition
  const analysis = analyzeInputText(inputText);
  const ideas = analysis.extractedIdeas;
  
  if (ideas.length < structure.minOutputCount) {
    // Regenerate with more ideas if needed
    return generateMindmapWithValidation(inputText, structure, constraints);
  }

  const mainTopic = ideas[0] || 'Main Topic';
  const branches = ideas.slice(1, structure.minOutputCount);

  let mermaidCode = '';

  switch (structure.layout) {
    case 'classic':
      mermaidCode = `graph TD\nA["${mainTopic.slice(0, 40)}"]\n`;
      branches.forEach((branch, i) => {
        const nodeId = String.fromCharCode(66 + i); // B, C, D, etc.
        mermaidCode += `${nodeId}["${branch.slice(0, 30)}"]\nA --> ${nodeId}\n`;
      });
      break;

    case 'chain':
      mermaidCode = `graph TD\n`;
      ideas.slice(0, structure.minOutputCount).forEach((idea, i) => {
        const nodeId = String.fromCharCode(65 + i); // A, B, C, etc.
        const label = idea;
        mermaidCode += `${nodeId}["${label.slice(0, 30)}"]\n`;
        if (i > 0) {
          const prevId = String.fromCharCode(64 + i);
          mermaidCode += `${prevId} --> ${nodeId}\n`;
        }
      });
      break;

    case 'layered':
      const level1Items = branches.slice(0, 3);
      const level2Items = branches.slice(3, 6);
      mermaidCode = `graph TD\nRoot["${mainTopic.slice(0, 30)}"]\n`;
      level1Items.forEach((item, i) => {
        const l1Id = `L1${String.fromCharCode(65 + i)}`;
        mermaidCode += `${l1Id}["${item.slice(0, 25)}"]\nRoot --> ${l1Id}\n`;
        const l2Item = level2Items[i] || `Detail ${i + 1}`;
        const l2Id = `L2${String.fromCharCode(65 + i)}1`;
        mermaidCode += `${l2Id}["${l2Item.slice(0, 20)}"]\n${l1Id} --> ${l2Id}\n`;
      });
      break;

    case 'flow':
      mermaidCode = `graph LR\nA["${mainTopic.slice(0, 25)}"]\n`;
      branches.forEach((branch, i) => {
        const nodeId = String.fromCharCode(66 + i);
        mermaidCode += `${nodeId}["${branch.slice(0, 25)}"]\n`;
        if (i === 0) {
          mermaidCode += `A --> ${nodeId}\n`;
        } else {
          const prevId = String.fromCharCode(65 + i);
          mermaidCode += `${prevId} --> ${nodeId}\n`;
        }
      });
      break;
  }

  return mermaidCode.trim();
}

function generateMindmapWithValidation(
  inputText: string,
  structure: any,
  constraints: any
): string {
  // Fallback: generate with sentence splitting
  const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const mainTopic = sentences[0]?.trim() || 'Main Topic';
  const branches = sentences.slice(1, structure.minOutputCount).map(s => s.trim());
  
  let mermaidCode = `graph TD\nA["${mainTopic.slice(0, 40)}"]\n`;
  branches.forEach((branch, i) => {
    const nodeId = String.fromCharCode(66 + i);
    mermaidCode += `${nodeId}["${branch.slice(0, 30)}"]\nA --> ${nodeId}\n`;
  });
  
  return mermaidCode.trim();
}

function generateFlashcardsFromPlan(
  inputText: string,
  structure: any,
  constraints: any
): any[] {
  const analysis = analyzeInputText(inputText);
  const ideas = analysis.extractedIdeas;
  const cards = [];

  // Ensure minimum card count
  const targetCount = Math.max(structure.minOutputCount, 5);

  switch (structure.layout) {
    case 'minimal':
      ideas.slice(0, targetCount).forEach((idea, i) => {
        cards.push({
          question: `What does the text explain about "${idea.slice(0, 40)}..."?`,
          answer: idea,
          tag: `basic-${Math.floor(i / 3) + 1}`
        });
      });
      break;

    case 'qa':
      ideas.slice(0, targetCount).forEach((idea, i) => {
        const keyTerm = extractKeyTerm(idea);
        cards.push({
          question: `Explain the concept of "${keyTerm}" as presented in the text.`,
          answer: idea,
          tag: `qa-${i + 1}`
        });
      });
      break;

    case 'keyword':
      const keywords = extractKeywords(inputText);
      keywords.slice(0, targetCount).forEach((keyword, i) => {
        const context = findKeywordContext(keyword, inputText);
        cards.push({
          question: keyword,
          answer: context || 'Definition not explicitly provided in text',
          tag: 'keyword'
        });
      });
      break;

    case 'chunked':
      // Group related ideas
      for (let i = 0; i < Math.min(targetCount, ideas.length); i += 2) {
        const group = ideas.slice(i, i + 2);
        cards.push({
          question: `Related concepts: ${group.map(g => g.slice(0, 20)).join(', ')}`,
          answer: group.join(' and '),
          tag: `group-${Math.floor(i / 2) + 1}`
        });
      }
      break;

    case 'scenario':
      ideas.slice(0, targetCount).forEach((idea, i) => {
        cards.push({
          question: `Given the information that "${idea.slice(0, 50)}...", what would be the appropriate response?`,
          answer: `Based on the text: ${idea}`,
          tag: `scenario-${i + 1}`
        });
      });
      break;
  }

  // Validation: ensure minimum count
  while (cards.length < structure.minOutputCount) {
    const extraIdea = ideas[cards.length] || 'Additional concept from text';
    cards.push({
      question: `What additional information does the text provide?`,
      answer: extraIdea,
      tag: `extra-${cards.length + 1}`
    });
  }

  return cards.slice(0, structure.maxOutputCount);
}

function generateQuizFromPlan(
  inputText: string,
  structure: any,
  constraints: any
): any[] {
  const analysis = analyzeInputText(inputText);
  const ideas = analysis.extractedIdeas;
  const questions = [];

  // Ensure minimum question count
  const targetCount = Math.max(structure.minOutputCount, 4);

  ideas.slice(0, targetCount).forEach((idea, i) => {
    const questionType = structure.questionTypes[i % structure.questionTypes.length];
    
    if (questionType === 'true-false') {
      questions.push({
        type: 'true-false',
        question: `Based on the text, is the following statement true: "${idea.slice(0, 60)}..."?`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: idea,
        meta: { difficulty: constraints.difficulty, style: structure.layout }
      });
    } else if (questionType === 'multiple-choice') {
      // Create multiple choice from the idea plus related ideas
      const relatedIdeas = ideas.filter((related, idx) => idx !== i).slice(0, 3);
      const options = [
        idea.slice(0, 40) + '...',
        ...relatedIdeas.map(ri => ri.slice(0, 35) + '...'),
        'None of the above'
      ];
      
      questions.push({
        type: 'multiple-choice',
        question: `According to the text, what is mentioned about "${idea.slice(0, 50)}..."?`,
        options: options.slice(0, 4),
        correctAnswer: idea.slice(0, 40) + '...',
        explanation: idea,
        meta: { difficulty: constraints.difficulty, style: structure.layout }
      });
    } else {
      questions.push({
        type: 'short-answer',
        question: `What does the text say about "${idea.slice(0, 50)}..."?`,
        options: [],
        correctAnswer: idea,
        explanation: idea,
        meta: { difficulty: constraints.difficulty, style: structure.layout }
      });
    }
  });

  // Validation: ensure minimum count
  while (questions.length < structure.minOutputCount) {
    const extraIdea = ideas[questions.length] || 'Additional concept from text';
    questions.push({
      type: 'true-false',
      question: `Based on the text, is this statement true: "${extraIdea.slice(0, 60)}..."?`,
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: extraIdea,
      meta: { difficulty: constraints.difficulty, style: structure.layout }
    });
  }

  return questions.slice(0, structure.maxOutputCount);
}

function generateSummaryFromPlan(
  inputText: string,
  structure: any,
  constraints: any
): string {
  const analysis = analyzeInputText(inputText);
  const ideas = analysis.extractedIdeas;
  
  switch (structure.layout) {
    case 'executive':
      // Combine multiple ideas into cohesive paragraph
      const keyPoints = ideas.slice(0, 4);
      return keyPoints.join('. ') + (keyPoints.length > 0 ? '.' : '');

    case 'bullet':
      // Create bullets from distinct ideas
      const bullets = ideas.slice(0, constraints.length.bullets).map(idea => 
        `• ${paraphraseForBullet(idea)}`
      );
      return bullets.join('\n');

    case 'notes':
      // Create study notes with labels
      const notes = [
        `Definitions: ${ideas[0] || 'Main concept'}`,
        `Key Points: ${ideas.slice(1, 4).map(idea => idea.slice(0, 30)).join('; ')}`,
        `Important: ${ideas[4] || 'Focus on primary relationships'}`,
        `Summary: ${ideas[0] || 'Central theme established'}`
      ];
      return notes.join('\n');

    case 'infostructured':
      return `## Overview
${ideas[0] || 'Main concept'}

## Key Elements
• ${ideas[1] || 'Primary element'}
• ${ideas[2] || 'Secondary element'}
• ${ideas[3] || 'Supporting element'}

## Summary
${ideas.slice(0, 2).join('. ')}`;

    default:
      return ideas.slice(0, 3).join('. ');
  }
}

function paraphraseForBullet(idea: string): string {
  // Simple paraphrasing for bullets
  const words = idea.split(' ');
  if (words.length > 12) {
    return words.slice(0, 12).join(' ') + '...';
  }
  return idea;
}

function generateInfographicFromPlan(
  inputText: string,
  structure: any,
  constraints: any
): any {
  const analysis = analyzeInputText(inputText);
  const ideas = analysis.extractedIdeas;
  
  const title = ideas[0] || 'Generated Infographic';
  const sections = ideas.slice(1, structure.minOutputCount);
  
  return {
    title: title,
    tagline: 'Structured information from input text',
    layout: structure.layout,
    steps: sections.map((section, i) => ({
      title: section.slice(0, 30) || `Section ${i + 1}`,
      description: section,
      icon: ['star', 'arrow', 'check', 'dot', 'bulb', 'target'][i % 6],
      accent: ['blue', 'green', 'purple', 'orange', 'red', 'gray'][i % 6]
    }))
  };
}

// Helper functions
function extractKeyTerm(sentence: string): string {
  const words = sentence.split(/\s+/).filter(w => w.length > 4);
  return words[0] || 'concept';
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 5);
  const freq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(freq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
}

function findKeywordContext(keyword: string, text: string): string {
  const sentences = text.split(/[.!?]+/);
  const sentence = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
  return sentence?.trim() || '';
}

/**
 * Main execution function that runs the complete 3-step process
 */
export function executeMindMintEngine(
  inputText: string,
  mode: AppMode,
  layout: string
): any {
  // Step 1: UNDERSTAND
  const analysis = analyzeInputText(inputText);
  
  // Step 2: STRUCTURE  
  const plan = createStructuredPlan(analysis, mode, layout);
  
  // Step 3: GENERATE
  const result = executeStructuredPlan(plan, inputText);
  
  return result;
}