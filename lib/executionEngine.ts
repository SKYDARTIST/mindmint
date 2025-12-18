/**
 * MindMint Internal Execution Engine
 * Implements the 3-step process: UNDERSTAND → STRUCTURE → GENERATE
 * Strictly grounded in input text without generalization or fabrication
 */

import { AppMode, MindmapLayout, FlashcardLayout, QuizLayout, SummaryLayout, InfographicLayout } from '../types';

export interface ScoredIdea {
  content: string;
  importance: number;              // 1-100 importance score
}

/**
 * SEMANTIC COMPRESSION & DE-DUPLICATION
 * Prevents paragraph-level repetition, duplicated ideas, and filler output
 * while preserving strict grounding to input text
 */

/**
 * Compress ideas to prevent duplication and enforce mode-specific length limits
 * Editorial compression only - no creative rewriting
 */
function compressIdeas(
  ideas: ScoredIdea[],
  options: { maxLength: number; dedupeThreshold: number }
): ScoredIdea[] {
  if (!ideas || ideas.length === 0) return [];

  // Step 1: Length compression - shorten ideas that exceed max length
  const lengthCompressed = ideas.map(idea => ({
    ...idea,
    content: compressToLength(idea.content, options.maxLength)
  }));

  // Step 2: De-duplication based on token overlap
  const deduplicated = removeSemanticDuplicates(lengthCompressed, options.dedupeThreshold);

  // Step 3: Sort by importance and ensure uniqueness
  const uniqueSorted = deduplicated
    .sort((a, b) => b.importance - a.importance)
    .filter((idea, index, arr) =>
      // Keep only unique content strings
      arr.findIndex(i => i.content.toLowerCase().trim() === idea.content.toLowerCase().trim()) === index
    );

  return uniqueSorted;
}

/**
 * Compress content to specified length using only words present in original
 * Editorial compression to noun phrases or causal/process statements
 */
function compressToLength(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;

  // Extract key terms from the original content
  const words = content.split(/\W+/).filter(word => word.length > 2);
  const originalWords = new Set(words.map(w => w.toLowerCase()));

  // If it's a long sentence, try to extract the core concept
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 1) {
    // Use the shortest meaningful sentence as the compressed version
    const shortSentence = sentences
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .sort((a, b) => a.length - b.length)[0];
    
    if (shortSentence && shortSentence.length <= maxLength) {
      return shortSentence;
    }
  }

  // If it's a single long sentence, extract key noun phrase
  // Look for patterns like "[noun phrase] [verb] [object]" and keep just the noun phrase
  const keyPatterns = [
    /^(.{10,30})\s+(causes?|results?\s+in|leads?\s+to|means?|indicates?\s+)/i,
    /^(.{10,30})\s+(is\s+an?\s+|is\s+the\s+|represents?\s+|involves?\s+)/i,
    /^(.{10,30})\s+(process|mechanism|system|method|approach)/i
  ];

  for (const pattern of keyPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].length <= maxLength) {
      return match[1].trim();
    }
  }

  // Fallback: take first maxLength characters
  return content.slice(0, maxLength).trim() + (content.length > maxLength ? '...' : '');
}

/**
 * Remove semantically duplicated ideas based on token overlap threshold
 * Keeps the idea with higher importance score
 */
function removeSemanticDuplicates(ideas: ScoredIdea[], threshold: number): ScoredIdea[] {
  const result: ScoredIdea[] = [];
  
  for (const idea of ideas) {
    let isDuplicate = false;
    
    for (const existing of result) {
      const overlap = calculateTokenOverlap(idea.content, existing.content);
      if (overlap > threshold) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      result.push(idea);
    }
  }
  
  return result;
}

/**
 * Normalize text for similarity comparison by collapsing near-identical phrases
 */
function normalizeForSimilarity(text: string): string {
  return text
    .toLowerCase()
    .replace(/takes time/g, "process_cost")
    .replace(/you want to post/g, "creator_goal")
    .replace(/you're the average creator/g, "creator_identity")
    .replace(/before ai tools/g, "pre_ai")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate semantic similarity between two text strings using Jaccard similarity
 * Tokenize, lowercase, remove stopwords, return value between 0 and 1
 */
function semanticSimilarity(a: string, b: string): number {
  // Normalize text first
  const normalizedA = normalizeForSimilarity(a);
  const normalizedB = normalizeForSimilarity(b);

  // Extract meaningful tokens (ignore common stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'there',
    'here', 'where', 'when', 'what', 'which', 'who', 'whom', 'whose', 'why', 'how'
  ]);

  const tokens1 = normalizedA
    .split(/\W+/)
    .filter(token => token.length > 2 && !stopWords.has(token));

  const tokens2 = normalizedB
    .split(/\W+/)
    .filter(token => token.length > 2 && !stopWords.has(token));

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  // Calculate Jaccard similarity (intersection over union)
  const intersection = new Set([...set1].filter(token => set2.has(token)));
  const union = new Set([...set1, ...set2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Calculate semantic overlap between two text strings based on meaningful tokens
 * DEPRECATED: Use semanticSimilarity() instead
 */
function calculateTokenOverlap(text1: string, text2: string): number {
  return semanticSimilarity(text1, text2);
}

/**
 * Get mode-specific compression settings
 */
function getCompressionSettings(mode: AppMode): { maxLength: number; dedupeThreshold: number } {
  switch (mode) {
    case AppMode.MINDMAP:
      return { maxLength: 60, dedupeThreshold: 0.6 };
    case AppMode.FLASHCARDS:
      return { maxLength: 160, dedupeThreshold: 0.7 };
    case AppMode.QUIZ:
      return { maxLength: 120, dedupeThreshold: 0.6 };
    case AppMode.SUMMARY:
      return { maxLength: 240, dedupeThreshold: 0.5 };
    case AppMode.INFOGRAPHIC:
      return { maxLength: 80, dedupeThreshold: 0.6 };
    default:
      return { maxLength: 100, dedupeThreshold: 0.6 };
  }
}


export interface IdeaGraph {
  centralThesis: ScoredIdea;           // 1 sentence - main idea/claim with score
  supportingArguments: ScoredIdea[];   // 3-7 points that support the thesis
  mechanisms: ScoredIdea[];            // 2-5 how/why mechanisms or causes
  contrasts: ScoredIdea[];             // before-vs-after or contrast ideas if present
  conclusions: ScoredIdea[];           // conclusions or takeaways if present
}

/**
 * STEP 3.3: SEMANTIC COMPRESSION & DE-DUPLICATION GATE
 * Final processing function that enforces strict semantic compression and no-repeat rules
 * Before rendering any output (mindmap, flashcards, quiz, summary, infographic)
 */

/**
 * RENDER-SAFE INTERFACE
 * Creates strict boundary between engine metadata and render output
 */
export interface RenderableContent {
  text: string;
  role: SemanticRole;
}

export enum SemanticRole {
  THESIS = 'thesis',
  EVIDENCE = 'evidence',
  MECHANISM = 'mechanism',
  CONTRAST = 'contrast',
  EXTRA = 'extra'
}

interface FinalizedContent {
  thesis: string;
  primaryContent: string[];
  secondaryContent: string[];
  tertiaryContent: string[];
  semanticRoles: {
    centralThesis: string;
    supportingEvidence: string[];
    mechanisms: string[];
    contrasts: string[];
    extras: string[];
  };
}

/**
 * Final processing function that enforces strict semantic compression and no-repeat rules
 * MUST be called BEFORE rendering any output
 * Implements HARD thesis isolation to prevent central thesis duplication
 */
function finalizeContentForMode(mode: AppMode, selectedIdeas: PerspectiveAwareContent): FinalizedContent {
  const wordLimits = getWordLimits(mode);
  
  // Step 1: Extract and LOCK Central Thesis FIRST
  const lockedThesis = compressToWordLimit(selectedIdeas.thesis, wordLimits.thesis);
  
  // Step 2: Enforce word count limits and compress content
  const compressedPrimary = selectedIdeas.primaryContent
    .map(content => compressToWordLimit(content, wordLimits.primary))
    .filter(content => content.length > 0); // Remove empty content
  
  const compressedSecondary = selectedIdeas.secondaryContent
    .map(content => compressToWordLimit(content, wordLimits.secondary))
    .filter(content => content.length > 0);
    
  const compressedTertiary = selectedIdeas.tertiaryContent
    .map(content => compressToWordLimit(content, wordLimits.tertiary))
    .filter(content => content.length > 0);
  
  // Step 3: HARD THESIS ISOLATION - Drop any content too similar to locked thesis
  const thesisIsolationThreshold = 0.35; // Strict isolation threshold
  
  const isolatedPrimary = compressedPrimary.filter(content =>
    semanticSimilarity(content, lockedThesis) <= thesisIsolationThreshold
  );
  
  const isolatedSecondary = compressedSecondary.filter(content =>
    semanticSimilarity(content, lockedThesis) <= thesisIsolationThreshold
  );
  
  const isolatedTertiary = compressedTertiary.filter(content =>
    semanticSimilarity(content, lockedThesis) <= thesisIsolationThreshold
  );
  
  // Step 4: Cross-role semantic de-duplication with locked thesis
  const allContent = [
    { content: lockedThesis, role: 'thesis', importance: 100 },
    ...isolatedPrimary.map((content, i) => ({ content, role: 'primary', importance: 90 - i })),
    ...isolatedSecondary.map((content, i) => ({ content, role: 'secondary', importance: 80 - i })),
    ...isolatedTertiary.map((content, i) => ({ content, role: 'tertiary', importance: 70 - i }))
  ].filter(item => item.content && item.content.trim().length > 0);
  
  // Step 5: Apply FINAL SEMANTIC EXCLUSION as the ultimate quality gate
  const threshold = getSimilarityThreshold(mode);
  const finalExcluded = finalSemanticExclusion(allContent, threshold);

  // Step 6: Check for catastrophic collapse and engage fallback if needed
  const safeFinalExcluded = ensureMinimumIdeas(mode, allContent, finalExcluded);

  // Step 7: Convert back to FinalizedContent format for compatibility
  const thesis = safeFinalExcluded.find(item => item.role === 'central_thesis')?.content || '';
  const primaryContent = safeFinalExcluded.filter(item => item.role === 'primary').map(item => item.content);
  const secondaryContent = safeFinalExcluded.filter(item => item.role === 'secondary').map(item => item.content);
  const tertiaryContent = safeFinalExcluded.filter(item => item.role === 'tertiary').map(item => item.content);

  return {
    thesis,
    primaryContent,
    secondaryContent,
    tertiaryContent,
    semanticRoles: {
      centralThesis: thesis,
      supportingEvidence: primaryContent,
      mechanisms: secondaryContent,
      contrasts: tertiaryContent,
      extras: []
    }
  };
}

/**
 * Convert FinalizedContent to RenderableContent for safe UI consumption
 * This creates the strict boundary between engine metadata and render output
 */
function convertToRenderableContent(finalizedContent: FinalizedContent): RenderableContent[] {
  const renderableItems: RenderableContent[] = [];
  
  // Add thesis
  if (finalizedContent.thesis) {
    renderableItems.push({
      text: finalizedContent.thesis,
      role: SemanticRole.THESIS
    });
  }
  
  // Add primary content as evidence
  finalizedContent.primaryContent.forEach(content => {
    renderableItems.push({
      text: content,
      role: SemanticRole.EVIDENCE
    });
  });
  
  // Add secondary content as mechanisms
  finalizedContent.secondaryContent.forEach(content => {
    renderableItems.push({
      text: content,
      role: SemanticRole.MECHANISM
    });
  });
  
  // Add tertiary content as contrasts
  finalizedContent.tertiaryContent.forEach(content => {
    renderableItems.push({
      text: content,
      role: SemanticRole.CONTRAST
    });
  });
  
  // Add extras
  finalizedContent.semanticRoles.extras.forEach(content => {
    renderableItems.push({
      text: content,
      role: SemanticRole.EXTRA
    });
  });
  
  return renderableItems;
}

/**
 * Convert PerspectiveAwareContent to ModeSpecificContent for backward compatibility
 */
function convertToModeSpecificContent(perspectiveContent: PerspectiveAwareContent): ModeSpecificContent {
  return {
    thesis: perspectiveContent.thesis,
    primaryContent: perspectiveContent.primaryContent,
    secondaryContent: perspectiveContent.secondaryContent,
    tertiaryContent: perspectiveContent.tertiaryContent,
    selectionReason: perspectiveContent.selectionReason
  };
}

/**
 * Get word count limits for each mode
 */
function getWordLimits(mode: AppMode): { thesis: number; primary: number; secondary: number; tertiary: number } {
  switch (mode) {
    case AppMode.MINDMAP:
      return { thesis: 12, primary: 12, secondary: 12, tertiary: 12 };
    case AppMode.FLASHCARDS:
      return { thesis: 40, primary: 40, secondary: 40, tertiary: 40 };
    case AppMode.QUIZ:
      return { thesis: 20, primary: 20, secondary: 20, tertiary: 20 };
    case AppMode.SUMMARY:
      return { thesis: 18, primary: 18, secondary: 18, tertiary: 18 };
    case AppMode.INFOGRAPHIC:
      return { thesis: 25, primary: 25, secondary: 25, tertiary: 25 };
    default:
      return { thesis: 20, primary: 20, secondary: 20, tertiary: 20 };
  }
}

/**
 * Compress content to word limit using only existing words
 */
function compressToWordLimit(content: string, maxWords: number): string {
  if (!content || content.trim().length === 0) return '';
  
  const words = content.split(/\s+/);
  if (words.length <= maxWords) return content;
  
  // Try to extract most meaningful part within word limit
  // Prioritize keeping subject + verb + key object
  const meaningfulWords = words.filter(word =>
    word.length > 2 &&
    !['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from'].includes(word.toLowerCase())
  );
  
  if (meaningfulWords.length <= maxWords) {
    // If meaningful words fit, return them with minimal connectors
    return meaningfulWords.slice(0, maxWords).join(' ');
  }
  
  // Fallback: take first maxWords words
  return words.slice(0, maxWords).join(' ');
}

/**
 * FINAL SEMANTIC EXCLUSION QUALITY GATE
 * Runs AFTER all other processing steps and BEFORE rendering to UI
 * Ensures each rendered item represents a DISTINCT semantic idea
 */
function finalSemanticExclusion(
  items: { content: string; importance: number; role: string }[],
  similarityThreshold: number
): { content: string; role: string }[] {

  const result: { content: string; role: string }[] = [];
  
  // Sort by importance (descending) to keep higher-importance items
  const sortedItems = [...items].sort((a, b) => b.importance - a.importance);
  
  for (const item of sortedItems) {
    // HARD ROLE GUARDS: Only ONE central_thesis allowed
    if (
      item.role === "central_thesis" &&
      result.some(a => a.role === "central_thesis")
    ) {
      continue; // Skip this item, only one central_thesis allowed
    }

    let isDuplicate = false;

    // Compare against already accepted items
    for (const existing of result) {
      const similarity = semanticSimilarity(item.content, existing.content);

      // ROLE SAFETY: Special rules for cross-role similarity
      if (isCrossRoleSimilar(item.role, existing.role)) {
        // If thesis appears in other roles, always drop the lower-importance one
        if (item.role === 'thesis' || existing.role === 'thesis') {
          isDuplicate = true;
          break;
        }
        // Mechanisms should not repeat thesis meaning
        if ((item.role === 'mechanism' && existing.role === 'thesis') ||
            (item.role === 'thesis' && existing.role === 'mechanism')) {
          isDuplicate = true;
          break;
        }
        // Evidence should not restate mechanisms
        if ((item.role === 'evidence' && existing.role === 'mechanism') ||
            (item.role === 'mechanism' && existing.role === 'evidence')) {
          isDuplicate = true;
          break;
        }
      }

      // Standard similarity check
      if (similarity >= similarityThreshold) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      result.push({
        content: item.content,
        role: item.role
      });
    }
  }
  
  return result;
}

/**
 * Check if two roles represent cross-role similarity that should be prevented
 */
function isCrossRoleSimilar(role1: string, role2: string): boolean {
  const thesisRoles = ['thesis', 'central-thesis'];
  const mechanismRoles = ['mechanism', 'secondary', 'process'];
  const evidenceRoles = ['evidence', 'primary', 'support'];
  
  // Thesis should never appear in other roles
  if (thesisRoles.includes(role1) || thesisRoles.includes(role2)) {
    return thesisRoles.includes(role1) && thesisRoles.includes(role2);
  }
  
  // Mechanisms and evidence should be distinct
  return (mechanismRoles.includes(role1) && evidenceRoles.includes(role2)) ||
         (evidenceRoles.includes(role1) && mechanismRoles.includes(role2));
}

/**
 * Get similarity threshold for final exclusion based on mode
 */
function getSimilarityThreshold(mode: AppMode): number {
  switch (mode) {
    case AppMode.MINDMAP: return 0.45;
    case AppMode.FLASHCARDS: return 0.55;
    case AppMode.QUIZ: return 0.6;
    case AppMode.SUMMARY: return 0.5;
    case AppMode.INFOGRAPHIC: return 0.5;
    default: return 0.5;
  }
}

/**
 * Get minimum ideas per mode to prevent catastrophic collapse
 */
function getMinIdeas(mode: AppMode): number {
  switch (mode) {
    case AppMode.MINDMAP: return 5;
    case AppMode.FLASHCARDS: return 4;
    case AppMode.QUIZ: return 3;
    case AppMode.SUMMARY: return 4;
    case AppMode.INFOGRAPHIC: return 3;
    default: return 3;
  }
}

/**
 * Ensure minimum ideas per mode - fallback when semantic exclusion causes collapse
 */
function ensureMinimumIdeas(
  mode: AppMode,
  originalIdeas: Array<{content: string; importance: number; role: string}>,
  processedIdeas: Array<{content: string; role: string}>
): Array<{content: string; role: string}> {
  const minIdeas = getMinIdeas(mode);

  if (processedIdeas.length >= minIdeas) {
    return processedIdeas; // No collapse detected
  }

  // semantic collapse detected — fallback engaged
  const fallbackIdeas: Array<{content: string; role: string}> = [];

  // Get top-K ideas by importance, ensuring uniqueness and no thesis duplication
  const sortedOriginal = [...originalIdeas].sort((a, b) => b.importance - a.importance);
  const usedContent = new Set<string>();

  for (const idea of sortedOriginal) {
    // Skip if content already used
    if (usedContent.has(idea.content)) continue;

    // Skip thesis if we already have one (only one central thesis allowed)
    if (idea.role === 'central_thesis' && fallbackIdeas.some(f => f.role === 'central_thesis')) {
      continue;
    }

    fallbackIdeas.push({
      content: idea.content,
      role: idea.role
    });

    usedContent.add(idea.content);

    if (fallbackIdeas.length >= minIdeas) break;
  }

  return fallbackIdeas;
}

/**
 * Get deduplication threshold for mode
 */
function getDeduplicationThreshold(mode: AppMode): number {
  switch (mode) {
    case AppMode.MINDMAP: return 0.5; // Strict for distinct concepts
    case AppMode.FLASHCARDS: return 0.6; // Moderate for Q&A
    case AppMode.QUIZ: return 0.5; // Strict for unique options
    case AppMode.SUMMARY: return 0.4; // Lenient for comprehensive coverage
    case AppMode.INFOGRAPHIC: return 0.5; // Strict for visual clarity
    default: return 0.5;
  }
}

/**
 * Check if content has process/mechanism language
 */
function hasProcessLanguage(content: string): boolean {
  const processPatterns = [
    'process', 'method', 'system', 'mechanism', 'procedure', 'steps', 'through',
    'by', 'via', 'using', 'operates', 'works', 'function', 'technique', 'approach'
  ];
  
  const lowerContent = content.toLowerCase();
  return processPatterns.some(pattern => lowerContent.includes(pattern));
}

/**
 * Helper function to select top content from scored ideas array
 * Sorts by importance score (desc), slices to max, returns content strings
 */
function selectTopContent(ideas: ScoredIdea[], max: number): string[] {
  if (!ideas || ideas.length === 0) return [];
  return ideas
    .sort((a, b) => b.importance - a.importance)
    .slice(0, max)
    .map(idea => idea.content);
}

export interface TextAnalysis {
  domain: string;
  intent: string;
  audienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  keyConcepts: string[];
  structure: 'linear' | 'hierarchical' | 'procedural' | 'descriptive' | 'comparative' | 'narrative';
  contentType: 'educational' | 'informational' | 'technical' | 'business' | 'academic' | 'casual';
  extractedIdeas: string[];
  ideaGraph: IdeaGraph;            // NEW: Structured idea extraction
}

/**
 * Mode-aware idea selection interface
 * Each mode receives tailored, prioritized content based on its specific needs
 */
export interface ModeSpecificContent {
  thesis: string;              // Central thesis for all modes
  primaryContent: string[];    // Main content array (varies by mode)
  secondaryContent: string[];  // Supporting content (varies by mode)
  tertiaryContent: string[];   // Additional content (varies by mode)
  selectionReason: string;     // Explanation of selection logic
}

/**
 * Perspective enum for internal generation approach
 * Determines how content is ordered and framed without adding new content
 */
export enum GenerationPerspective {
  CAUSE_FIRST = 'cause-first',
  EFFECT_FIRST = 'effect-first',
  PROBLEM_FIRST = 'problem-first',
  SOLUTION_FIRST = 'solution-first',
  MECHANISM_FIRST = 'mechanism-first'
}

/**
 * Enhanced content structure with perspective consideration
 */
export interface PerspectiveAwareContent extends ModeSpecificContent {
  perspective: GenerationPerspective;  // Chosen perspective for this generation
  perspectiveReason: string;           // Why this perspective was chosen
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
      extractedIdeas: [],
      ideaGraph: {
        centralThesis: { content: '', importance: 0 },
        supportingArguments: [],
        mechanisms: [],
        contrasts: [],
        conclusions: []
      }
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

  // Extract structured idea graph BEFORE other analysis
  const ideaGraph = extractIdeaGraph(text, sentences);

  return {
    domain,
    intent,
    audienceLevel,
    keyConcepts,
    structure,
    contentType,
    extractedIdeas,
    ideaGraph
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

/**
 * INTERNAL: Extract structured IdeaGraph from input text
 * Runs BEFORE any generation - no user-facing output
 * Uses ONLY information from input text - never invents content
 */
function extractIdeaGraph(text: string, sentences: string[]): IdeaGraph {
  const cleanSentences = sentences.filter(s => s.trim().length > 10);
  
  // Extract central thesis (1 sentence) - usually the first or most comprehensive sentence
  const centralThesisText = extractCentralThesis(cleanSentences);
  const centralThesis = {
    content: centralThesisText,
    importance: calculateImportanceScore(centralThesisText, 0, cleanSentences.length, cleanSentences)
  };
  
  // Extract supporting arguments (3-7) - sentences that support the main idea
  const supportingArgumentTexts = extractSupportingArguments(cleanSentences, centralThesisText);
  const supportingArguments = supportingArgumentTexts.map((text, index) => ({
    content: text,
    importance: calculateImportanceScore(text, index + 1, cleanSentences.length, cleanSentences)
  })).sort((a, b) => b.importance - a.importance); // Sort by importance
  
  // Extract mechanisms/causes (2-5) - how/why explanations
  const mechanismTexts = extractMechanisms(cleanSentences);
  const mechanisms = mechanismTexts.map((text, index) => ({
    content: text,
    importance: calculateImportanceScore(text, index + 1, cleanSentences.length, cleanSentences)
  })).sort((a, b) => b.importance - a.importance); // Sort by importance
  
  // Extract contrasts (0+) - before-vs-after or contrast ideas if present
  const contrastTexts = extractContrasts(cleanSentences);
  const contrasts = contrastTexts.map((text, index) => ({
    content: text,
    importance: calculateImportanceScore(text, index + 1, cleanSentences.length, cleanSentences)
  })).sort((a, b) => b.importance - a.importance); // Sort by importance
  
  // Extract conclusions (0+) - final takeaways if present
  const conclusionTexts = extractConclusions(cleanSentences);
  const conclusions = conclusionTexts.map((text, index) => ({
    content: text,
    importance: calculateImportanceScore(text, cleanSentences.length - index - 1, cleanSentences.length, cleanSentences)
  })).sort((a, b) => b.importance - a.importance); // Sort by importance
  
  return {
    centralThesis,
    supportingArguments,
    mechanisms,
    contrasts,
    conclusions
  };
}

/**
 * Calculate importance score for an idea using specified heuristics
 */
function calculateImportanceScore(
  content: string,
  position: number,
  totalSentences: number,
  allSentences: string[]
): number {
  let score = 50; // Base score

  // Position heuristic: Intro/conclusion get higher scores
  if (position === 0) {
    score += 25; // First sentence (likely thesis)
  } else if (position >= totalSentences - 2) {
    score += 20; // Last 2 sentences (likely conclusion)
  }

  // Causal language heuristic
  if (hasCausalLanguage(content)) {
    score += 15;
  }

  // Repetition heuristic: Check how often key terms appear
  const repetitionScore = calculateRepetitionScore(content, allSentences);
  score += repetitionScore;

  // Cross-reference heuristic: Check if other sentences reference this one
  const crossReferenceScore = calculateCrossReferenceScore(content, allSentences);
  score += crossReferenceScore;

  // Ensure score is within 1-100 range
  return Math.max(1, Math.min(100, score));
}

function hasCausalLanguage(content: string): boolean {
  const causalPatterns = [
    'causes', 'caused by', 'results in', 'leads to', 'because', 'due to',
    'therefore', 'thus', 'hence', 'consequently', 'as a result',
    'this leads to', 'this results in', 'this causes', 'this means'
  ];
  
  const lowerContent = content.toLowerCase();
  return causalPatterns.some(pattern => lowerContent.includes(pattern));
}

function calculateRepetitionScore(content: string, allSentences: string[]): number {
  const contentWords = content.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3);
  
  let repetitionCount = 0;
  const contentWordSet = new Set(contentWords);
  
  for (const sentence of allSentences) {
    if (sentence === content) continue; // Don't count self-reference
    
    const sentenceWords = sentence.toLowerCase().split(/\W+/);
    const overlappingWords = sentenceWords.filter(word =>
      contentWordSet.has(word) && word.length > 3
    );
    
    repetitionCount += overlappingWords.length;
  }
  
  // Cap at 20 points for repetition
  return Math.min(20, repetitionCount * 2);
}

function calculateCrossReferenceScore(content: string, allSentences: string[]): number {
  const contentWords = content.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 4); // Focus on significant words
  
  let crossReferenceCount = 0;
  
  for (const sentence of allSentences) {
    if (sentence === content) continue;
    
    const sentenceLower = sentence.toLowerCase();
    
    // Check for explicit references
    if (sentenceLower.includes('this') || sentenceLower.includes('that')) {
      // Count how many of our significant words appear in referencing sentences
      const referencedWords = contentWords.filter(word => sentenceLower.includes(word));
      crossReferenceCount += referencedWords.length * 0.5;
    }
  }
  
  // Cap at 15 points for cross-reference
  return Math.min(15, crossReferenceCount);
}

function extractCentralThesis(sentences: string[]): string {
  if (sentences.length === 0) return '';
  
  // Usually the first sentence or the most comprehensive one
  // Look for sentences with definitive language or topic sentences
  const firstSentence = sentences[0].trim();
  
  // Check if first sentence is comprehensive enough (contains key terms)
  const words = firstSentence.toLowerCase().split(/\W+/);
  const hasKeyTerms = words.filter(w => w.length > 4).length >= 3;
  
  if (hasKeyTerms || sentences.length === 1) {
    return firstSentence;
  }
  
  // If first sentence is too short, look for most comprehensive sentence
  let longestSentence = sentences[0];
  for (const sentence of sentences) {
    if (sentence.length > longestSentence.length) {
      longestSentence = sentence;
    }
  }
  
  return longestSentence.trim();
}

function extractSupportingArguments(sentences: string[], centralThesis: string): string[] {
  const argumentsList: string[] = [];
  const thesisWords = centralThesis.toLowerCase().split(/\W+/);
  
  for (const sentence of sentences) {
    // Skip the central thesis itself
    if (sentence.trim() === centralThesis.trim()) continue;
    
    // Look for sentences that support or elaborate on the thesis
    const sentenceWords = sentence.toLowerCase().split(/\W+/);
    const commonWords = sentenceWords.filter(word =>
      thesisWords.includes(word) && word.length > 3
    );
    
    // If sentence shares significant vocabulary with thesis, it's likely supportive
    if (commonWords.length >= 2) {
      argumentsList.push(sentence.trim());
    }
    // Also include sentences with supportive language patterns
    else if (hasSupportiveLanguage(sentence)) {
      argumentsList.push(sentence.trim());
    }
  }
  
  // Ensure we have 3-7 arguments, pad with additional sentences if needed
  while (argumentsList.length < 3 && argumentsList.length < sentences.length - 1) {
    const remainingSentences = sentences.filter(s =>
      s.trim() !== centralThesis.trim() &&
      !argumentsList.includes(s.trim())
    );
    if (remainingSentences.length > 0) {
      argumentsList.push(remainingSentences[0].trim());
    } else {
      break;
    }
  }
  
  return argumentsList.slice(0, 7); // Cap at 7
}

function extractMechanisms(sentences: string[]): string[] {
  const mechanisms: string[] = [];
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    // Look for mechanism/cause indicators
    if (hasMechanismLanguage(lowerSentence)) {
      mechanisms.push(sentence.trim());
    }
  }
  
  return mechanisms.slice(0, 5); // Cap at 5
}

function extractContrasts(sentences: string[]): string[] {
  const contrasts: string[] = [];
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    // Look for contrast indicators
    if (hasContrastLanguage(lowerSentence)) {
      contrasts.push(sentence.trim());
    }
  }
  
  return contrasts; // Return all found (could be 0)
}

function extractConclusions(sentences: string[]): string[] {
  const conclusions: string[] = [];
  
  // Usually at the end, look for conclusive language
  for (let i = sentences.length - 1; i >= Math.max(0, sentences.length - 3); i--) {
    const sentence = sentences[i];
    const lowerSentence = sentence.toLowerCase();
    
    if (hasConclusionLanguage(lowerSentence)) {
      conclusions.push(sentence.trim());
    }
  }
  
  return conclusions; // Return all found (could be 0)
}

// Helper functions for language pattern detection
function hasSupportiveLanguage(sentence: string): boolean {
  const supportivePatterns = [
    'this means', 'therefore', 'thus', 'which shows', 'demonstrates',
    'indicates', 'suggests', 'proves', 'reveals', 'illustrates',
    'because', 'since', 'as a result', 'leads to', 'results in'
  ];
  
  const lowerSentence = sentence.toLowerCase();
  return supportivePatterns.some(pattern => lowerSentence.includes(pattern));
}

function hasMechanismLanguage(sentence: string): boolean {
  const mechanismPatterns = [
    'by', 'through', 'via', 'using', 'method', 'process', 'system',
    'mechanism', 'function', 'operates', 'works by', ' mechanism of',
    'caused by', 'results from', 'due to', 'because of', 'leads to'
  ];
  
  return mechanismPatterns.some(pattern => sentence.includes(pattern));
}

function hasContrastLanguage(sentence: string): boolean {
  const contrastPatterns = [
    'but', 'however', 'although', 'despite', 'whereas', 'while',
    'versus', 'vs', 'compared to', 'in contrast', 'on the other hand',
    'before', 'after', 'previously', 'formerly', 'historically'
  ];
  
  return contrastPatterns.some(pattern => sentence.includes(pattern));
}

function hasConclusionLanguage(sentence: string): boolean {
  const conclusionPatterns = [
    'in conclusion', 'to summarize', 'overall', 'finally', 'ultimately',
    'therefore', 'thus', 'hence', 'as a result', 'consequently',
    'this shows', 'this demonstrates', 'the key point is', 'the main idea'
  ];
  
  return conclusionPatterns.some(pattern => sentence.includes(pattern));
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
 * PERSPECTIVE SELECTION
 * Analyzes content to determine optimal generation perspective
 */
function selectGenerationPerspective(ideaGraph: IdeaGraph, mode: AppMode): GenerationPerspective {
  const allText = [
    ideaGraph.centralThesis.content,
    ...ideaGraph.supportingArguments.map(arg => arg.content),
    ...ideaGraph.mechanisms.map(mech => mech.content),
    ...ideaGraph.contrasts.map(contrast => contrast.content),
    ...ideaGraph.conclusions.map(conclusion => conclusion.content)
  ].join(' ').toLowerCase();

  // Score each perspective based on content characteristics
  const perspectiveScores = {
    [GenerationPerspective.CAUSE_FIRST]: 0,
    [GenerationPerspective.EFFECT_FIRST]: 0,
    [GenerationPerspective.PROBLEM_FIRST]: 0,
    [GenerationPerspective.SOLUTION_FIRST]: 0,
    [GenerationPerspective.MECHANISM_FIRST]: 0
  };

  // Cause-first indicators
  if (allText.includes('because') || allText.includes('due to') || allText.includes('caused by') ||
      allText.includes('origin') || allText.includes('source') || allText.includes('reason')) {
    perspectiveScores[GenerationPerspective.CAUSE_FIRST] += 2;
  }

  // Effect-first indicators
  if (allText.includes('therefore') || allText.includes('result') || allText.includes('outcome') ||
      allText.includes('consequence') || allText.includes('leads to') || allText.includes('thus')) {
    perspectiveScores[GenerationPerspective.EFFECT_FIRST] += 2;
  }

  // Problem-first indicators
  if (allText.includes('problem') || allText.includes('issue') || allText.includes('challenge') ||
      allText.includes('difficulty') || allText.includes('obstacle') || allText.includes('conflict')) {
    perspectiveScores[GenerationPerspective.PROBLEM_FIRST] += 2;
  }

  // Solution-first indicators
  if (allText.includes('solution') || allText.includes('method') || allText.includes('approach') ||
      allText.includes('strategy') || allText.includes('fix') || allText.includes('resolve')) {
    perspectiveScores[GenerationPerspective.SOLUTION_FIRST] += 2;
  }

  // Mechanism-first indicators
  if (allText.includes('how') || allText.includes('process') || allText.includes('mechanism') ||
      allText.includes('system') || allText.includes('work') || allText.includes('function')) {
    perspectiveScores[GenerationPerspective.MECHANISM_FIRST] += 2;
  }

  // Mode-specific biasing
  switch (mode) {
    case AppMode.QUIZ:
      // Quizzes benefit from cause-effect perspectives
      perspectiveScores[GenerationPerspective.CAUSE_FIRST] += 1;
      perspectiveScores[GenerationPerspective.EFFECT_FIRST] += 1;
      break;
    case AppMode.FLASHCARDS:
      // Flashcards work well with mechanism-first (how/why)
      perspectiveScores[GenerationPerspective.MECHANISM_FIRST] += 1;
      break;
    case AppMode.INFOGRAPHIC:
      // Infographics favor mechanism-first (process flow)
      perspectiveScores[GenerationPerspective.MECHANISM_FIRST] += 1;
      break;
    case AppMode.SUMMARY:
      // Summaries work with solution-first (logical flow)
      perspectiveScores[GenerationPerspective.SOLUTION_FIRST] += 1;
      break;
  }

  // Return the perspective with highest score
  const maxScore = Math.max(...Object.values(perspectiveScores));
  const selectedPerspective = Object.entries(perspectiveScores).find(([_, score]) => score === maxScore)?.[0] as GenerationPerspective;
  
  return selectedPerspective || GenerationPerspective.MECHANISM_FIRST; // Default fallback
}

/**
 * Apply perspective-based ordering to content
 * Rearranges content based on chosen perspective without adding new content
 */
interface OrderedPerspectiveContent {
  rootElement: string;
  orderedElements: string[];
  primaryGroup: string[];
  secondaryGroup: string[];
}

function applyPerspectiveOrdering(content: PerspectiveAwareContent): OrderedPerspectiveContent {
  const { perspective, thesis, primaryContent, secondaryContent, tertiaryContent } = content;
  const allElements = [thesis, ...primaryContent, ...secondaryContent, ...tertiaryContent].filter(Boolean);
  
  let rootElement = thesis;
  let orderedElements = [...primaryContent];
  
  switch (perspective) {
    case GenerationPerspective.CAUSE_FIRST:
      // Put cause-related content first
      const causeElements = allElements.filter(el =>
        el.toLowerCase().includes('because') || el.toLowerCase().includes('due to') ||
        el.toLowerCase().includes('origin') || el.toLowerCase().includes('reason')
      );
      orderedElements = [...causeElements, ...primaryContent.filter(el => !causeElements.includes(el))];
      break;
      
    case GenerationPerspective.EFFECT_FIRST:
      // Put effect/result content first
      const effectElements = allElements.filter(el =>
        el.toLowerCase().includes('therefore') || el.toLowerCase().includes('result') ||
        el.toLowerCase().includes('outcome') || el.toLowerCase().includes('leads to')
      );
      orderedElements = [...effectElements, ...primaryContent.filter(el => !effectElements.includes(el))];
      break;
      
    case GenerationPerspective.PROBLEM_FIRST:
      // Put problem-related content first
      const problemElements = allElements.filter(el =>
        el.toLowerCase().includes('problem') || el.toLowerCase().includes('issue') ||
        el.toLowerCase().includes('challenge') || el.toLowerCase().includes('difficulty')
      );
      orderedElements = [...problemElements, ...primaryContent.filter(el => !problemElements.includes(el))];
      break;
      
    case GenerationPerspective.SOLUTION_FIRST:
      // Put solution-related content first
      const solutionElements = allElements.filter(el =>
        el.toLowerCase().includes('solution') || el.toLowerCase().includes('method') ||
        el.toLowerCase().includes('approach') || el.toLowerCase().includes('strategy')
      );
      orderedElements = [...solutionElements, ...primaryContent.filter(el => !solutionElements.includes(el))];
      break;
      
    case GenerationPerspective.MECHANISM_FIRST:
    default:
      // Default: mechanisms/process first
      const mechanismElements = allElements.filter(el =>
        el.toLowerCase().includes('how') || el.toLowerCase().includes('process') ||
        el.toLowerCase().includes('mechanism') || el.toLowerCase().includes('system')
      );
      orderedElements = [...mechanismElements, ...primaryContent.filter(el => !mechanismElements.includes(el))];
      break;
  }
  
  return {
    rootElement,
    orderedElements: orderedElements.slice(0, 8), // Limit for mindmap practicality
    primaryGroup: orderedElements.slice(0, 3),
    secondaryGroup: orderedElements.slice(3, 6)
  };
}

/**
 * MODE-AWARE IDEA SELECTION LAYER WITH PERSPECTIVE AND COMPRESSION
 * Selects and prioritizes ideas based on mode-specific requirements and chosen perspective
 * Applies semantic compression and de-duplication to prevent repetition and enforce length limits
 * Uses importance scores to ensure highest-quality content for each mode
 */
export function selectModeSpecificContent(
  ideaGraph: IdeaGraph,
  mode: AppMode,
  layout: string
): PerspectiveAwareContent {
  const thesis = ideaGraph.centralThesis.content;
  const perspective = selectGenerationPerspective(ideaGraph, mode);
  const compressionSettings = getCompressionSettings(mode);
  
  // Apply compression to all idea categories AFTER importance scoring
  const compressedSupportingArguments = compressIdeas(ideaGraph.supportingArguments, compressionSettings);
  const compressedMechanisms = compressIdeas(ideaGraph.mechanisms, compressionSettings);
  const compressedContrasts = compressIdeas(ideaGraph.contrasts, compressionSettings);
  const compressedConclusions = compressIdeas(ideaGraph.conclusions, compressionSettings);
  
  switch (mode) {
    case AppMode.MINDMAP:
      // Mindmap: 1 thesis + 5–7 highest-importance arguments/mechanisms (after compression)
      const mindmapContent = [
        ...selectTopContent(compressedSupportingArguments, 4),
        ...selectTopContent(compressedMechanisms, 3)
      ];
      
      return {
        thesis: compressToLength(thesis, compressionSettings.maxLength),
        primaryContent: mindmapContent,
        secondaryContent: selectTopContent(compressedContrasts, 2),
        tertiaryContent: selectTopContent(compressedConclusions, 1),
        selectionReason: 'Selected highest-importance arguments and mechanisms for mindmap branches',
        perspective,
        perspectiveReason: `Chosen ${perspective} perspective for optimal mindmap structure`
      };

    case AppMode.FLASHCARDS:
      // Flashcards: convert arguments/mechanisms into why/how Q&A (after compression)
      const flashcardContent = [
        ...selectTopContent(compressedSupportingArguments, 4), // "why" focused
        ...selectTopContent(compressedMechanisms, 3)          // "how" focused
      ];
      
      return {
        thesis: compressToLength(thesis, compressionSettings.maxLength),
        primaryContent: flashcardContent,
        secondaryContent: selectTopContent(compressedContrasts, 2), // Comparison cards
        tertiaryContent: selectTopContent(compressedConclusions, 1), // Summary cards
        selectionReason: 'Prioritized arguments (why) and mechanisms (how) for Q&A format',
        perspective,
        perspectiveReason: `Applied ${perspective} perspective for effective question framing`
      };

    case AppMode.QUIZ:
      // Quiz: use mechanisms, contrasts, and conclusions only (cause-effect focus, after compression)
      const quizContent = [
        ...selectTopContent(compressedMechanisms, 3),    // Process questions
        ...selectTopContent(compressedContrasts, 2),     // Comparison questions
        ...selectTopContent(compressedConclusions, 2)    // Outcome questions
      ];
      
      return {
        thesis: compressToLength(thesis, compressionSettings.maxLength),
        primaryContent: quizContent,
        secondaryContent: selectTopContent(compressedSupportingArguments, 2), // Supporting evidence
        tertiaryContent: [],
        selectionReason: 'Focused on mechanisms, contrasts, and conclusions for cause-effect assessment',
        perspective,
        perspectiveReason: `Selected ${perspective} for optimal cause-effect question structure`
      };

    case AppMode.SUMMARY:
      // Summary: reorder ideas logically (thesis → arguments → conclusion), never preserve input order (after compression)
      const summaryContent = [
        compressToLength(thesis, compressionSettings.maxLength), // Always start with compressed thesis
        ...selectTopContent(compressedSupportingArguments, 3), // Key supporting points
        ...selectTopContent(compressedConclusions, 1)          // Final takeaway
      ];
      
      return {
        thesis: compressToLength(thesis, compressionSettings.maxLength),
        primaryContent: summaryContent, // Logical flow: thesis → arguments → conclusion
        secondaryContent: selectTopContent(compressedMechanisms, 2), // Process details
        tertiaryContent: selectTopContent(compressedContrasts, 1),   // Context/contrast
        selectionReason: 'Reordered for logical flow: thesis → supporting points → conclusion',
        perspective,
        perspectiveReason: `Structured with ${perspective} approach for coherent summary flow`
      };

    case AppMode.INFOGRAPHIC:
      // Infographic: turn mechanisms into steps and contrasts into comparison sections (after compression)
      const infographicSteps = selectTopContent(compressedMechanisms, 4); // Process steps
      const infographicComparisons = selectTopContent(compressedContrasts, 2); // Comparison sections
      
      return {
        thesis: compressToLength(thesis, compressionSettings.maxLength),
        primaryContent: infographicSteps,     // Main process flow
        secondaryContent: infographicComparisons, // Comparison elements
        tertiaryContent: selectTopContent(compressedSupportingArguments, 2), // Supporting details
        selectionReason: 'Structured mechanisms as steps and contrasts as comparisons',
        perspective,
        perspectiveReason: `Organized with ${perspective} perspective for visual flow optimization`
      };

    default:
      // Fallback: use basic content selection (with compression)
      return {
        thesis: compressToLength(thesis, compressionSettings.maxLength),
        primaryContent: selectTopContent(compressedSupportingArguments, 5),
        secondaryContent: selectTopContent(compressedMechanisms, 3),
        tertiaryContent: selectTopContent(compressedContrasts, 2),
        selectionReason: 'Default selection based on importance scores',
        perspective,
        perspectiveReason: `Applied default ${perspective} perspective for basic generation`
      };
  }
}

/**
 * STEP 3: GENERATE
 * Execute the structured plan using only input text information
 */
export async function executeStructuredPlan(
  plan: StructuredPlan,
  inputText: string
): Promise<any> {
  const { mode, layout, structure, outputConstraints } = plan;

  // Apply mode-aware idea selection with perspective BEFORE generation
  const analysis = analyzeInputText(inputText);
  const selectedContent = selectModeSpecificContent(analysis.ideaGraph, mode, layout);

  switch (mode) {
    case AppMode.MINDMAP:
      return generateMindmapFromPlan(inputText, structure, outputConstraints, selectedContent);
    case AppMode.FLASHCARDS:
      return generateFlashcardsFromPlan(inputText, structure, outputConstraints, selectedContent);
    case AppMode.QUIZ:
      return generateQuizFromPlan(inputText, structure, outputConstraints, selectedContent);
    case AppMode.SUMMARY:
      return await generateSummaryFromPlan(inputText, structure, outputConstraints, selectedContent, layout);
    case AppMode.INFOGRAPHIC:
      return generateInfographicFromPlan(inputText, structure, outputConstraints, selectedContent);
    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }
}

function generateMindmapFromPlan(
  inputText: string,
  structure: any,
  constraints: any,
  selectedContent: PerspectiveAwareContent
): string {
  // STEP 3.3: Apply final semantic compression and de-duplication gate
  const finalized = finalizeContentForMode(AppMode.MINDMAP, selectedContent);

  // FORCE INTEGRATION: Apply semantic exclusion
  const items = [
    { content: finalized.thesis, importance: 100, role: 'central_thesis' },
    ...finalized.primaryContent.map((content, i) => ({ content, importance: 90 - i, role: 'primary' })),
    ...finalized.secondaryContent.map((content, i) => ({ content, importance: 80 - i, role: 'secondary' })),
    ...finalized.tertiaryContent.map((content, i) => ({ content, importance: 70 - i, role: 'tertiary' }))
  ].filter(item => item.content && item.content.trim().length > 0);

  // Fallback logic now handled in finalizeContentForMode()
  const cleanedItems = finalSemanticExclusion(items, getSimilarityThreshold(AppMode.MINDMAP));


  // Reconstruct finalized content from cleaned items
  const cleanedFinalized = {
    thesis: cleanedItems.find(item => item.role === 'central_thesis')?.content || '',
    primaryContent: cleanedItems.filter(item => item.role === 'primary').map(item => item.content),
    secondaryContent: cleanedItems.filter(item => item.role === 'secondary').map(item => item.content),
    tertiaryContent: cleanedItems.filter(item => item.role === 'tertiary').map(item => item.content),
    semanticRoles: {
      centralThesis: cleanedItems.find(item => item.role === 'central_thesis')?.content || '',
      supportingEvidence: cleanedItems.filter(item => item.role === 'primary').map(item => item.content),
      mechanisms: cleanedItems.filter(item => item.role === 'secondary').map(item => item.content),
      contrasts: cleanedItems.filter(item => item.role === 'tertiary').map(item => item.content),
      extras: []
    }
  };
  
  // Apply perspective-based ordering and framing to finalized content
  const perspectiveContent: PerspectiveAwareContent = {
    thesis: cleanedFinalized.thesis,
    primaryContent: cleanedFinalized.primaryContent,
    secondaryContent: cleanedFinalized.secondaryContent,
    tertiaryContent: cleanedFinalized.tertiaryContent,
    selectionReason: selectedContent.selectionReason,
    perspective: selectedContent.perspective,
    perspectiveReason: selectedContent.perspectiveReason
  };
  
  const orderedContent = applyPerspectiveOrdering(perspectiveContent);
  let mermaidCode = '';

  switch (structure.layout) {
    case 'classic':
      // Perspective affects root choice and branch ordering
      const rootNode = orderedContent.rootElement;
      mermaidCode = `graph TD\nA["${rootNode.slice(0, 40)}"]\n`;
      const branches = orderedContent.orderedElements.slice(0, Math.max(5, structure.minOutputCount - 1));
      branches.forEach((branch, i) => {
        const nodeId = String.fromCharCode(66 + i); // B, C, D, etc.
        mermaidCode += `${nodeId}["${branch.slice(0, 30)}"]\nA --> ${nodeId}\n`;
      });
      break;

    case 'chain':
      // Linear progression with perspective-based ordering
      mermaidCode = `graph TD\n`;
      const chainElements = orderedContent.orderedElements.slice(0, structure.minOutputCount);
      
      chainElements.forEach((element, i) => {
        const nodeId = String.fromCharCode(65 + i); // A, B, C, etc.
        const label = element || `Step ${i + 1}`;
        mermaidCode += `${nodeId}["${label.slice(0, 30)}"]\n`;
        if (i > 0) {
          const prevId = String.fromCharCode(64 + i);
          mermaidCode += `${prevId} --> ${nodeId}\n`;
        }
      });
      break;

    case 'layered':
      // Multi-level with perspective-based categorization
      const level1Items = orderedContent.primaryGroup;
      const level2Items = orderedContent.secondaryGroup;
      
      const rootLabel = orderedContent.rootElement.slice(0, 30);
      mermaidCode = `graph TD\nRoot["${rootLabel}"]\n`;
      level1Items.forEach((item, i) => {
        const l1Id = `L1${String.fromCharCode(65 + i)}`;
        const displayItem = item || `Category ${i + 1}`;
        mermaidCode += `${l1Id}["${displayItem.slice(0, 25)}"]\nRoot --> ${l1Id}\n`;
        
        const l2Item = level2Items[i] || `Detail ${i + 1}`;
        const l2Id = `L2${String.fromCharCode(65 + i)}1`;
        mermaidCode += `${l2Id}["${l2Item.slice(0, 20)}"]\n${l1Id} --> ${l2Id}\n`;
      });
      break;

    case 'flow':
      // Left-to-right with perspective-based flow
      mermaidCode = `graph LR\nA["${orderedContent.rootElement.slice(0, 25)}"]\n`;
      const flowElements = orderedContent.orderedElements.slice(0, 4);
      
      flowElements.forEach((element, i) => {
        const nodeId = String.fromCharCode(66 + i);
        const label = element || `Element ${i + 1}`;
        mermaidCode += `${nodeId}["${label.slice(0, 25)}"]\n`;
        if (i === 0) {
          mermaidCode += `A --> ${nodeId}\n`;
        } else {
          const prevId = String.fromCharCode(65 + i);
          mermaidCode += `${prevId} --> ${nodeId}\n`;
        }
      });
      break;
  }

  return mermaidCode.trim() || generateMindmapWithValidation(inputText, structure, constraints);
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
  constraints: any,
  selectedContent: PerspectiveAwareContent
): any[] {
  // STEP 3.3: Apply final semantic compression and de-duplication gate
  const finalized = finalizeContentForMode(AppMode.FLASHCARDS, selectedContent);

  // FORCE INTEGRATION: Apply semantic exclusion
  const items = [
    { content: finalized.thesis, importance: 100, role: 'central_thesis' },
    ...finalized.primaryContent.map((content, i) => ({ content, importance: 90 - i, role: 'primary' })),
    ...finalized.secondaryContent.map((content, i) => ({ content, importance: 80 - i, role: 'secondary' })),
    ...finalized.tertiaryContent.map((content, i) => ({ content, importance: 70 - i, role: 'tertiary' }))
  ].filter(item => item.content && item.content.trim().length > 0);

  // Fallback logic now handled in finalizeContentForMode()
  const cleanedItems = finalSemanticExclusion(items, getSimilarityThreshold(AppMode.FLASHCARDS));


  // Reconstruct finalized content from cleaned items
  const cleanedFinalized = {
    thesis: cleanedItems.find(item => item.role === 'central_thesis')?.content || '',
    primaryContent: cleanedItems.filter(item => item.role === 'primary').map(item => item.content),
    secondaryContent: cleanedItems.filter(item => item.role === 'secondary').map(item => item.content),
    tertiaryContent: cleanedItems.filter(item => item.role === 'tertiary').map(item => item.content),
    semanticRoles: {
      centralThesis: cleanedItems.find(item => item.role === 'central_thesis')?.content || '',
      supportingEvidence: cleanedItems.filter(item => item.role === 'primary').map(item => item.content),
      mechanisms: cleanedItems.filter(item => item.role === 'secondary').map(item => item.content),
      contrasts: cleanedItems.filter(item => item.role === 'tertiary').map(item => item.content),
      extras: []
    }
  };
  
  const cards = [];

  // Ensure minimum card count
  const targetCount = Math.max(structure.minOutputCount, 5);

  switch (structure.layout) {
    case 'minimal':
      // Create cards from thesis and primary content (why-focused arguments)
      cards.push({
        question: `What is the main thesis presented in the text?`,
        answer: cleanedFinalized.thesis,
        tag: 'thesis'
      });

      cleanedFinalized.primaryContent.slice(0, targetCount - 1).forEach((argument, i) => {
        cards.push({
          question: `What supporting evidence is provided for the main thesis?`,
          answer: argument,
          tag: `support-${i + 1}`
        });
      });
      break;

    case 'qa':
      // Detailed Q&A from different content types
      cards.push({
        question: `Explain the central concept presented in this text.`,
        answer: cleanedFinalized.thesis,
        tag: 'main-concept'
      });

      // How-focused: mechanisms become process questions
      cleanedFinalized.secondaryContent.slice(0, Math.ceil((targetCount - 1) / 2)).forEach((mechanism, i) => {
        cards.push({
          question: `How does the process described in the text work?`,
          answer: mechanism,
          tag: `process-${i + 1}`
        });
      });

      // Why-focused: supporting arguments become evidence questions
      cleanedFinalized.primaryContent.slice(0, Math.floor((targetCount - 1) / 2)).forEach((argument, i) => {
        cards.push({
          question: `What evidence supports the main argument?`,
          answer: argument,
          tag: `evidence-${i + 1}`
        });
      });
      break;

    case 'keyword':
      // Term-definition pairs from finalized content
      const allContent = [
        cleanedFinalized.thesis,
        ...cleanedFinalized.primaryContent,
        ...cleanedFinalized.secondaryContent
      ];
      const keywords = extractKeywords(allContent.join(' '));
      keywords.slice(0, targetCount).forEach((keyword, i) => {
        cards.push({
          question: keyword,
          answer: findKeywordInRenderableContent(keyword, cleanedFinalized) || 'Definition not explicitly provided in text',
          tag: 'keyword'
        });
      });
      break;

    case 'chunked':
      // Group related concepts from all content layers (finalized)
      const chunkedContent = [
        ...cleanedFinalized.primaryContent,
        ...cleanedFinalized.secondaryContent,
        ...cleanedFinalized.tertiaryContent
      ].slice(0, targetCount);

      chunkedContent.forEach((chunk, i) => {
        cards.push({
          question: `Related concepts: ${chunk.slice(0, 30)}...`,
          answer: chunk,
          tag: `chunk-${i + 1}`
        });
      });
      break;

    case 'scenario':
      // Situation-response cards from finalized content
      const scenarios = [
        cleanedFinalized.thesis,
        ...cleanedFinalized.primaryContent,
        ...cleanedFinalized.secondaryContent
      ].slice(0, targetCount);

      scenarios.forEach((scenario, i) => {
        cards.push({
          question: `Based on the information that "${scenario.slice(0, 50)}...", what conclusion can be drawn?`,
          answer: `According to the text: ${scenario}`,
          tag: `scenario-${i + 1}`
        });
      });
      break;
  }

  // Validation: ensure minimum count using tertiary content if needed
  // If insufficient content remains after compression, reduce output count instead of adding filler
  return cards.slice(0, Math.min(cards.length, structure.maxOutputCount));
}

function generateQuizFromPlan(
  inputText: string,
  structure: any,
  constraints: any,
  selectedContent: PerspectiveAwareContent
): any[] {
  // STEP 3.3: Apply final semantic compression and de-duplication gate
  const finalized = finalizeContentForMode(AppMode.QUIZ, selectedContent);

  // FORCE INTEGRATION: Apply semantic exclusion
  const items = [
    { content: finalized.thesis, importance: 100, role: 'central_thesis' },
    ...finalized.primaryContent.map((content, i) => ({ content, importance: 90 - i, role: 'primary' })),
    ...finalized.secondaryContent.map((content, i) => ({ content, importance: 80 - i, role: 'secondary' })),
    ...finalized.tertiaryContent.map((content, i) => ({ content, importance: 70 - i, role: 'tertiary' }))
  ].filter(item => item.content && item.content.trim().length > 0);

  // Fallback logic now handled in finalizeContentForMode()
  const cleanedItems = finalSemanticExclusion(items, getSimilarityThreshold(AppMode.QUIZ));


  // Reconstruct finalized content from cleaned items
  const cleanedFinalized = {
    thesis: cleanedItems.find(item => item.role === 'central_thesis')?.content || '',
    primaryContent: cleanedItems.filter(item => item.role === 'primary').map(item => item.content),
    secondaryContent: cleanedItems.filter(item => item.role === 'secondary').map(item => item.content),
    tertiaryContent: cleanedItems.filter(item => item.role === 'tertiary').map(item => item.content),
    semanticRoles: {
      centralThesis: cleanedItems.find(item => item.role === 'central_thesis')?.content || '',
      supportingEvidence: cleanedItems.filter(item => item.role === 'primary').map(item => item.content),
      mechanisms: cleanedItems.filter(item => item.role === 'secondary').map(item => item.content),
      contrasts: cleanedItems.filter(item => item.role === 'tertiary').map(item => item.content),
      extras: []
    }
  };
  
  const questions = [];

  // Ensure minimum question count
  const targetCount = Math.max(structure.minOutputCount, 4);

  // Create questions from mode-specific content (mechanisms, contrasts, conclusions focus)
  const questionSources = [
    { content: cleanedFinalized.thesis, type: 'thesis' },
    ...cleanedFinalized.primaryContent.map(content => ({ content, type: 'primary' })),
    ...cleanedFinalized.secondaryContent.map(content => ({ content, type: 'secondary' })),
    ...cleanedFinalized.tertiaryContent.map(content => ({ content, type: 'tertiary' }))
  ].filter(item => item.content && item.content.length > 10);

  questionSources.slice(0, targetCount).forEach((source, i) => {
    const questionType = structure.questionTypes[i % structure.questionTypes.length];
    
    if (questionType === 'true-false') {
      questions.push({
        type: 'true-false',
        question: `Based on the text, is the following statement true: "${source.content.slice(0, 60)}..."?`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: source.content,
        meta: { difficulty: constraints.difficulty, style: structure.layout, category: source.type }
      });
    } else if (questionType === 'multiple-choice') {
      // Create multiple choice from the source plus other sources
      // Final semantic exclusion will handle option distinctness
      const relatedSources = questionSources.filter((related, idx) => idx !== i).slice(0, 3);
      const options = [
        source.content.slice(0, 40) + '...',
        ...relatedSources.map(ri => ri.content.slice(0, 35) + '...'),
        'None of the above'
      ];
      
      questions.push({
        type: 'multiple-choice',
        question: `According to the text, what is mentioned about "${source.content.slice(0, 50)}..."?`,
        options: options.slice(0, 4),
        correctAnswer: source.content.slice(0, 40) + '...',
        explanation: source.content,
        meta: { difficulty: constraints.difficulty, style: structure.layout, category: source.type }
      });
    } else {
      questions.push({
        type: 'short-answer',
        question: `What does the text say about "${source.content.slice(0, 50)}..."?`,
        options: [],
        correctAnswer: source.content,
        explanation: source.content,
        meta: { difficulty: constraints.difficulty, style: structure.layout, category: source.type }
      });
    }
  });

  // Validation: ensure minimum count using tertiary content if needed
  // If insufficient content remains after compression, reduce output count instead of adding filler
  return questions.slice(0, Math.min(questions.length, structure.maxOutputCount));
}

/**
 * PRESENTATION FORMATTER
 * Removes internal labels and formats summary output to sound human-written
 */
function formatSummaryForLayout(
  content: string,
  layout: "executive" | "bullet" | "notes" | "structured"
): string {
  // Strip internal labels and normalize content
  let cleanContent = content;
  
  // Remove internal labels
  const internalLabels = [
    /Original Text:/gi, /Key Points:/gi, /Core Concept:/gi, /Summary:/gi,
    /Important:/gi, /Key Terms:/gi, /Main Points:/gi, /Essential element:/gi,
    /Key insight:/gi, /Important finding:/gi, /Selection Logic:/gi,
    /Related Concepts:/gi, /Process Steps:/gi, /Comparison:/gi,
    /Supporting Details:/gi, /Central Thesis:/gi, /What is stopping us/gi
  ];
  
  internalLabels.forEach(label => {
    cleanContent = cleanContent.replace(label, '');
  });
  
  // Remove bullet artifacts
  cleanContent = cleanContent.replace(/^[••\-\*]\s*/gm, '');
  
  // Split into sentences and remove duplicates
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const uniqueSentences: string[] = [];
  
  sentences.forEach(sentence => {
    const cleanSentence = sentence.trim();
    if (cleanSentence.length > 10) {
      // Check for near-duplicates (70% similarity)
      const isDuplicate = uniqueSentences.some(existing => {
        const similarity = semanticSimilarity(cleanSentence.toLowerCase(), existing.toLowerCase());
        return similarity > 0.7;
      });
      
      if (!isDuplicate) {
        uniqueSentences.push(cleanSentence);
      }
    }
  });
  
  // Remove empty or placeholder content
  const validSentences = uniqueSentences.filter(s =>
    s.length > 10 &&
    !/^\s*[••\-\*]\s*$/.test(s) &&
    !/^\s*$/.test(s)
  );
  
  if (validSentences.length === 0) {
    return "Summary could not be generated from the provided content.";
  }
  
  // Format based on layout
  switch (layout) {
    case "executive":
      return formatExecutiveLayout(validSentences);
      
    case "bullet":
      return formatBulletLayout(validSentences);
      
    case "notes":
      return formatNotesLayout(validSentences);
      
    case "structured":
      return formatStructuredLayout(validSentences);
      
    default:
      return formatExecutiveLayout(validSentences);
  }
}

/**
 * Format executive layout - 1 paragraph, 2-4 sentences max
 */
function formatExecutiveLayout(sentences: string[]): string {
  // Take first 2-4 sentences and ensure they sound natural
  const selectedSentences = sentences.slice(0, 4);
  
  const formatted = selectedSentences.map((sentence, index) => {
    let clean = sentence.trim();
    
    // Ensure proper capitalization
    if (!clean.match(/^[A-Z]/)) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    
    // Ensure proper punctuation
    if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
      clean += '.';
    }
    
    return clean;
  });

  return formatted.join(' ');
}

/**
 * Format bullet layout - 3-5 bullets, each bullet = one distinct idea
 */
function formatBulletLayout(sentences: string[]): string {
  // Take 3-5 sentences and format as bullets
  const selectedSentences = sentences.slice(0, 5);
  
  // Ensure no repeated sentence starters
  const uniqueBullets: string[] = [];
  const usedStarters = new Set<string>();
  
  selectedSentences.forEach(sentence => {
    let clean = sentence.trim();
    
    // Get first word for starter check
    const firstWord = clean.split(/\s+/)[0]?.toLowerCase() || '';
    
    // Skip if this starter is already used
    if (usedStarters.has(firstWord)) {
      return;
    }
    
    // Ensure proper capitalization and punctuation
    if (!clean.match(/^[A-Z]/)) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    
    if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
      clean += '.';
    }
    
    uniqueBullets.push(clean);
    usedStarters.add(firstWord);
  });
  
  // Ensure we have 3-5 bullets
  const finalBullets = uniqueBullets.slice(0, 5);
  
  if (finalBullets.length === 0) {
    return "No key points identified.";
  }
  
  return finalBullets.map(bullet => `• ${bullet}`).join('\n');
}

/**
 * Format notes layout - 3 short paragraphs
 */
function formatNotesLayout(sentences: string[]): string {
  // Group sentences into 3 paragraphs
  const paragraph1 = sentences.slice(0, Math.ceil(sentences.length / 3));
  const paragraph2 = sentences.slice(Math.ceil(sentences.length / 3), Math.ceil(sentences.length * 2 / 3));
  const paragraph3 = sentences.slice(Math.ceil(sentences.length * 2 / 3));
  
  const formatParagraph = (paragraphSentences: string[]): string => {
    if (paragraphSentences.length === 0) return "";
    
    return paragraphSentences.map(sentence => {
      let clean = sentence.trim();
      
      if (!clean.match(/^[A-Z]/)) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      
      if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
        clean += '.';
      }
      
      return clean;
    }).join(' ');
  };
  
  const para1 = formatParagraph(paragraph1);
  const para2 = formatParagraph(paragraph2);
  const para3 = formatParagraph(paragraph3);
  
  // Create 3 paragraphs with specific focus
  const paragraphs = [];
  
  if (para1) {
    paragraphs.push(`Core situation: ${para1}`);
  }
  
  if (para2) {
    paragraphs.push(`What is blocking progress: ${para2}`);
  }
  
  if (para3) {
    paragraphs.push(`Direction and intent: ${para3}`);
  }
  
  return paragraphs.join('\n\n');
}

/**
 * Format structured layout - Overview, Key Points, Direction
 */
function formatStructuredLayout(sentences: string[]): string {
  const sections: string[] = [];
  
  // Overview: 1-2 sentences
  const overviewSentences = sentences.slice(0, 2);
  if (overviewSentences.length > 0) {
    sections.push("## Overview");
    sections.push(overviewSentences.map(s => {
      let clean = s.trim();
      if (!clean.match(/^[A-Z]/)) clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) clean += '.';
      return clean;
    }).join(' '));
    sections.push("");
  }
  
  // Key Points: 3-4 bullets
  const keyPointSentences = sentences.slice(2, 6);
  if (keyPointSentences.length > 0) {
    sections.push("## Key Points");
    keyPointSentences.forEach(sentence => {
      let clean = sentence.trim();
      if (!clean.match(/^[A-Z]/)) clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) clean += '.';
      sections.push(`• ${clean}`);
    });
    sections.push("");
  }
  
  // Direction: 1-2 sentences
  const directionSentences = sentences.slice(6, 8);
  if (directionSentences.length > 0) {
    sections.push("## Direction");
    sections.push(directionSentences.map(s => {
      let clean = s.trim();
      if (!clean.match(/^[A-Z]/)) clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) clean += '.';
      return clean;
    }).join(' '));
  }
  
  return sections.join('\n');
}

/**
 * CONTROLLED AI ABSTRACTION GUARD
 * Validates AI output and applies safety checks
 */
function validateAbstractionOutput(
  aiOutput: string,
  inputText: string
): string {
  // Check for sentence overlap
  const originalSentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const aiSentences = aiOutput.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let overlapCount = 0;
  aiSentences.forEach(aiSentence => {
    const isOverlap = originalSentences.some(originalSentence => {
      const similarity = semanticSimilarity(aiSentence.toLowerCase(), originalSentence.toLowerCase());
      return similarity > 0.8; // 80% similarity threshold for overlap
    });
    
    if (isOverlap) overlapCount++;
  });
  
  const overlapPercentage = aiSentences.length > 0 ? overlapCount / aiSentences.length : 0;
  
  // Check for internal labels
  const hasInternalLabels = /Original Text:|Key Points:|Core Concept:|Summary:|Important:|Key Terms:|Main Points:|Essential element:|Key insight:|Important finding:|Selection Logic:|Related Concepts:|Process Steps:|Comparison:|Supporting Details:|Central Thesis:|What is stopping us/i.test(aiOutput);
  
  // Check for repeated sentences
  const uniqueAiSentences = aiSentences.filter((sentence, index, arr) =>
    arr.findIndex(s => semanticSimilarity(s.toLowerCase(), sentence.toLowerCase()) > 0.9) === index
  );
  const repetitionPercentage = aiSentences.length > 0 ? (aiSentences.length - uniqueAiSentences.length) / aiSentences.length : 0;
  
  // Apply safety checks
  if (overlapPercentage > 0.4 || hasInternalLabels || repetitionPercentage > 0.2) {
    console.warn("AI abstraction validation failed, falling back to extractive summary");
    // Return extractive summary (simplified version)
    const extractive = originalSentences.slice(0, 4).join(' ');
    return extractive || "Summary could not be generated from the provided content.";
  }
  
  return aiOutput;
}

/**
 * PRESENTATION FORMATTER
 * Removes internal labels and formats summary output to sound human-written
 */
function formatHumanSummary(content: string, layout: SummaryLayout): string {
  // HARD SAFETY GUARDS: Check for problematic content first
  const problematicPatterns = [
    /Original Text:/i,
    /Key Points:/i,
    /Core Concept:/i,
    /What is stopping us/i,
    /Key insight:/i,
    /Important finding:/i,
    /Selection Logic:/i,
    /Related Concepts:/i,
    /Process Steps:/i,
    /Comparison:/i,
    /Supporting Details:/i,
    /Central Thesis:/i
  ];

  const hasProblematicContent = problematicPatterns.some(pattern => pattern.test(content));

  if (hasProblematicContent) {
    // Fallback to clean extractive summary
    console.warn("Presentation formatter detected problematic content, falling back to extractive summary");
    
    // Extract clean sentences and merge into plain sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const cleanSentences = sentences
      .map(sentence => {
        // Remove any remaining labels
        let clean = sentence.replace(/^[••\-\*]\s*/g, '').trim();
        problematicPatterns.forEach(pattern => {
          clean = clean.replace(pattern, '').trim();
        });
        return clean;
      })
      .filter(sentence => sentence.length > 10);

    // Merge into natural sentences
    if (cleanSentences.length === 0) {
      return "Summary could not be generated from the provided content.";
    }

    // Format based on layout even in fallback
    switch (layout) {
      case 'executive':
        return cleanSentences.slice(0, 3).join(' ');
      case 'bullet':
        return cleanSentences.slice(0, 5).map(s => `• ${s}`).join('\n');
      case 'notes':
        return cleanSentences.slice(0, 4).join('\n');
      case 'infostructured':
        return cleanSentences.slice(0, 4).join('\n\n');
      default:
        return cleanSentences.slice(0, 3).join(' ');
    }
  }

  // Normal formatting for clean content
  switch (layout) {
    case 'executive':
      return formatExecutiveHumanSummary(content);

    case 'bullet':
      return formatBulletHumanSummary(content);

    case 'notes':
      return formatNotesHumanSummary(content);

    case 'infostructured':
      return formatStructuredHumanSummary(content);

    default:
      return formatExecutiveHumanSummary(content);
  }
}

/**
 * Format executive summary - 1 short paragraph, 2-3 sentences max
 */
function formatExecutiveHumanSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Take first 2-3 sentences and ensure they sound natural
  const selectedSentences = sentences.slice(0, 3);
  
  const formatted = selectedSentences.map((sentence, index) => {
    let clean = sentence
      .replace(/^[••\-\*]\s*/g, '')
      .replace(/##\s*/g, '')
      .replace(/Key insight:/gi, '')
      .replace(/Important finding:/gi, '')
      .replace(/What is stopping us/gi, '')
      .trim();

    // Ensure proper capitalization and punctuation
    if (!clean.match(/^[A-Z]/)) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    
    if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
      clean += '.';
    }
    
    return clean;
  });

  return formatted.join(' ');
}

/**
 * Format bullet summary - 3-5 bullets, each bullet = one complete human sentence
 */
function formatBulletHumanSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Take 3-5 sentences and format as bullets
  const selectedSentences = sentences.slice(0, 5);
  
  const bullets = selectedSentences.map((sentence) => {
    let clean = sentence
      .replace(/^[••\-\*]\s*/g, '')
      .replace(/##\s*/g, '')
      .replace(/Key insight:/gi, '')
      .replace(/Important finding:/gi, '')
      .replace(/What is stopping us/gi, '')
      .trim();

    // Ensure it's a complete sentence
    if (!clean.match(/^[A-Z]/)) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    
    if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
      clean += '.';
    }
    
    return `• ${clean}`;
  });

  return bullets.join('\n');
}

/**
 * Format notes summary - short paragraphs separated by line breaks
 */
function formatNotesHumanSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Group sentences into short paragraphs
  const paragraphs: string[] = [];
  let currentParagraph = '';
  
  sentences.forEach((sentence, index) => {
    let clean = sentence
      .replace(/^[••\-\*]\s*/g, '')
      .replace(/##\s*/g, '')
      .replace(/Key insight:/gi, '')
      .replace(/Important finding:/gi, '')
      .replace(/What is stopping us/gi, '')
      .trim();

    if (!clean.match(/^[A-Z]/)) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    
    if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
      clean += '.';
    }
    
    if (currentParagraph.length + clean.length < 120) {
      currentParagraph += (currentParagraph ? ' ' : '') + clean;
    } else {
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
      }
      currentParagraph = clean;
    }
  });
  
  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }
  
  return paragraphs.slice(0, 4).join('\n\n');
}

/**
 * Format structured summary - use ONLY these headers: Overview, Key Points, Direction
 */
function formatStructuredHumanSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Distribute content across sections
  const overviewSentences = sentences.slice(0, 2);
  const keyPointsSentences = sentences.slice(2, 5);
  const directionSentences = sentences.slice(5, 7);
  
  const sections: string[] = [];
  
  if (overviewSentences.length > 0) {
    sections.push("## Overview");
    sections.push(overviewSentences.map(s => {
      let clean = s
        .replace(/^[••\-\*]\s*/g, '')
        .replace(/##\s*/g, '')
        .replace(/Key insight:/gi, '')
        .replace(/Important finding:/gi, '')
        .replace(/What is stopping us/gi, '')
        .trim();
      
      if (!clean.match(/^[A-Z]/)) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      
      if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
        clean += '.';
      }
      
      return clean;
    }).join(' '));
    sections.push("");
  }
  
  if (keyPointsSentences.length > 0) {
    sections.push("## Key Points");
    keyPointsSentences.forEach(s => {
      let clean = s
        .replace(/^[••\-\*]\s*/g, '')
        .replace(/##\s*/g, '')
        .replace(/Key insight:/gi, '')
        .replace(/Important finding:/gi, '')
        .replace(/What is stopping us/gi, '')
        .trim();
      
      if (!clean.match(/^[A-Z]/)) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      
      if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
        clean += '.';
      }
      
      sections.push(`• ${clean}`);
    });
    sections.push("");
  }
  
  if (directionSentences.length > 0) {
    sections.push("## Direction");
    directionSentences.forEach(s => {
      let clean = s
        .replace(/^[••\-\*]\s*/g, '')
        .replace(/##\s*/g, '')
        .replace(/Key insight:/gi, '')
        .replace(/Important finding:/gi, '')
        .replace(/What is stopping us/gi, '')
        .trim();
      
      if (!clean.match(/^[A-Z]/)) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      
      if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
        clean += '.';
      }
      
      sections.push(`• ${clean}`);
    });
  }
  
  return sections.join('\n');
}

async function generateSummaryFromPlan(
  inputText: string,
  structure: any,
  constraints: any,
  selectedContent: PerspectiveAwareContent,
  layout: string
): Promise<string> {
  // STEP 3.3: Apply final semantic compression and de-duplication gate
  const finalized = finalizeContentForMode(AppMode.SUMMARY, selectedContent);

  // FORCE INTEGRATION: Apply semantic exclusion
  const items = [
    { content: finalized.thesis, importance: 100, role: 'central_thesis' },
    ...finalized.primaryContent.map((content, i) => ({ content, importance: 90 - i, role: 'primary' })),
    ...finalized.secondaryContent.map((content, i) => ({ content, importance: 80 - i, role: 'secondary' })),
    ...finalized.tertiaryContent.map((content, i) => ({ content, importance: 70 - i, role: 'tertiary' }))
  ].filter(item => item.content && item.content.trim().length > 0);

  // Fallback logic now handled in finalizeContentForMode()
  const cleanedItems = finalSemanticExclusion(items, getSimilarityThreshold(AppMode.SUMMARY));

  // Convert to presentation-ready ideas
  const presentationIdeas = cleanedItems.map(item => ({
    content: item.content,
    role: item.role === 'central_thesis' ? SemanticRole.THESIS :
          item.role === 'primary' ? SemanticRole.EVIDENCE :
          item.role === 'secondary' ? SemanticRole.MECHANISM :
          SemanticRole.CONTRAST
  }));

  // STEP 6: INTEGRATION POINT - Apply AI abstraction for summary modes only
  // Check if this is a summary mode that should use AI abstraction
  const summaryLayoutsForAbstraction: SummaryLayout[] = ['executive', 'bullet', 'notes', 'infostructured'];
  const currentLayout = layout as SummaryLayout;
  
  let abstractedContent = "";
  
  if (summaryLayoutsForAbstraction.includes(currentLayout)) {
    // Use AI abstraction for summaries
    try {
      abstractedContent = await abstractSummaryIdeas(inputText, presentationIdeas, currentLayout);
    } catch (error) {
      // If AI abstraction fails, fall back to extractive summary
      console.warn("AI abstraction failed, using extractive summary fallback:", error);
      abstractedContent = formatSummaryForPresentation(currentLayout === 'infostructured' ? 'structured' : currentLayout, presentationIdeas);
    }
  } else {
    // For non-summary modes or unsupported layouts, use extractive summary
    const normalizedLayout = currentLayout === 'infostructured' ? 'structured' : currentLayout;
    abstractedContent = formatSummaryForPresentation(normalizedLayout as "executive" | "bullet" | "notes" | "structured", presentationIdeas);
  }

  // STEP 7: INTEGRATION POINT - Apply presentation formatter
  // ALWAYS call formatHumanSummary before returning output
  return formatHumanSummary(abstractedContent, currentLayout);
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
  constraints: any,
  selectedContent: PerspectiveAwareContent
): any {
  // STEP 3.3: Apply final semantic compression and de-duplication gate
  const finalized = finalizeContentForMode(AppMode.INFOGRAPHIC, selectedContent);

  // FORCE INTEGRATION: Apply semantic exclusion
  const items = [
    { content: finalized.thesis, importance: 100, role: 'central_thesis' },
    ...finalized.primaryContent.map((content, i) => ({ content, importance: 90 - i, role: 'primary' })),
    ...finalized.secondaryContent.map((content, i) => ({ content, importance: 80 - i, role: 'secondary' })),
    ...finalized.tertiaryContent.map((content, i) => ({ content, importance: 70 - i, role: 'tertiary' }))
  ].filter(item => item.content && item.content.trim().length > 0);

  // Fallback logic now handled in finalizeContentForMode()
  const cleanedItems = finalSemanticExclusion(items, getSimilarityThreshold(AppMode.INFOGRAPHIC));


  // Reconstruct finalized content from cleaned items
  const cleanedFinalized = {
    thesis: cleanedItems.find(item => item.role === 'central_thesis')?.content || '',
    primaryContent: cleanedItems.filter(item => item.role === 'primary').map(item => item.content),
    secondaryContent: cleanedItems.filter(item => item.role === 'secondary').map(item => item.content),
    tertiaryContent: cleanedItems.filter(item => item.role === 'tertiary').map(item => item.content),
    semanticRoles: {
      centralThesis: cleanedItems.find(item => item.role === 'central_thesis')?.content || '',
      supportingEvidence: cleanedItems.filter(item => item.role === 'primary').map(item => item.content),
      mechanisms: cleanedItems.filter(item => item.role === 'secondary').map(item => item.content),
      contrasts: cleanedItems.filter(item => item.role === 'tertiary').map(item => item.content),
      extras: []
    }
  };
  
  const title = cleanedFinalized.thesis || 'Generated Infographic';

  // Create sections from mode-specific content (mechanisms as steps, contrasts as comparisons)
  const sections = [
    { title: 'Central Thesis', content: cleanedFinalized.thesis, icon: 'star' },
    ...cleanedFinalized.primaryContent.map(content => ({
      title: 'Process Step', content, icon: 'arrow'
    })),
    ...cleanedFinalized.secondaryContent.map(content => ({
      title: 'Comparison', content, icon: 'dot'
    })),
    ...cleanedFinalized.tertiaryContent.map(content => ({
      title: 'Supporting Detail', content, icon: 'check'
    }))
  ].filter(section => section.content && section.content.length > 10).slice(0, structure.minOutputCount);
  
  return {
    title: title,
    tagline: `Mode-aware selection: ${selectedContent.selectionReason}`,
    layout: structure.layout,
    steps: sections.map((section, i) => ({
      title: section.title,
      description: section.content.slice(0, 80) + (section.content.length > 80 ? '...' : ''),
      icon: section.icon,
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

function findKeywordInSelectedContent(keyword: string, selectedContent: ModeSpecificContent): string {
  const allContent = [
    selectedContent.thesis,
    ...selectedContent.primaryContent,
    ...selectedContent.secondaryContent,
    ...selectedContent.tertiaryContent
  ].join(' ');
  
  const sentences = allContent.split(/[.!?]+/);
  const sentence = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
  return sentence?.trim() || '';
}

/**
 * Find keyword in FinalizedContent for render-safe usage
 */
function findKeywordInRenderableContent(keyword: string, finalizedContent: FinalizedContent): string {
  const allContent = [
    finalizedContent.thesis,
    ...finalizedContent.primaryContent,
    ...finalizedContent.secondaryContent,
    ...finalizedContent.tertiaryContent,
    ...finalizedContent.semanticRoles.extras
  ].join(' ');
  
  const sentences = allContent.split(/[.!?]+/);
  const sentence = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
  return sentence?.trim() || '';
}

function findKeywordContextInIdeaGraph(keyword: string, ideaGraph: IdeaGraph): string {
  const allText = [
    ideaGraph.centralThesis.content,
    ...selectTopContent(ideaGraph.supportingArguments, 10),
    ...selectTopContent(ideaGraph.mechanisms, 5),
    ...selectTopContent(ideaGraph.contrasts, 3),
    ...selectTopContent(ideaGraph.conclusions, 3)
  ].join(' ');
  
  const sentences = allText.split(/[.!?]+/);
  const sentence = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
  return sentence?.trim() || '';
}

/**
 * ABSTRACT SUMMARY IDEAS FUNCTION
 * The ONLY place where AI rewriting is allowed for summaries
 * Uses LLM to rewrite meaning in new sentences while staying grounded
 */
async function abstractSummaryIdeas(
  inputText: string,
  ideas: { content: string; role: SemanticRole }[],
  layout: SummaryLayout
): Promise<string> {
  // Import the generateContent function to use OpenAI
  const { generateContent } = await import('../services/openaiService');

  // STRICT SYSTEM PROMPT (NON-NEGOTIABLE)
  const systemInstruction = `
You are summarizing content for clarity and intent.
Rules:
- Rewrite meaning in your own words.
- Use ONLY information present in the input.
- Do NOT add new facts, opinions, or interpretations.
- Do NOT quote or reuse original sentences.
- Prefer WHY and INTENT over procedural details.
- Keep tone neutral, professional, human.
- If information is insufficient, be concise rather than verbose.`;

  // Prepare input for LLM - ONLY pass original text, key ideas, and layout type
  const keyIdeas = ideas.map(idea => idea.content).join('\n');
  const userPrompt = `
Original Text:
${inputText}

Key Ideas:
${keyIdeas}

Layout Type: ${layout}

Generate an abstracted summary following the rules above.`;

  try {
    // Call OpenAI API for rewriting using the generateContent function
    const result = await generateContent(
      AppMode.SUMMARY,
      userPrompt,
      layout,
      false // Don't use execution engine to avoid recursion
    );

    return typeof result === 'string' ? result : "";
  } catch (error) {
    console.error("AI abstraction error:", error);
    return ""; // Return empty string to trigger fallback
  }
}

/**
 * Format abstracted summary for presentation
 * This function takes the AI-generated abstracted content and formats it for the specific layout
 */
function formatAbstractedSummary(abstractedContent: string, layout: SummaryLayout): string {
  // HARD RULES:
  // - REMOVE all labels, headings, metadata
  // - MERGE ideas into natural sentences
  // - ENSURE each layout sounds different
  // - Do NOT reuse original sentences
  // - Do NOT reuse abstraction sentences verbatim
  // - Rewrite again at presentation level

  // First, clean the abstracted content by removing any labels or structural artifacts
  let cleanedContent = abstractedContent
    // Remove common labels and headings
    .replace(/##\s*Overview\s*/gi, '')
    .replace(/##\s*Key\s*Points\s*/gi, '')
    .replace(/##\s*Direction\s*/gi, '')
    .replace(/##\s*Implications\s*/gi, '')
    .replace(/##\s*Summary\s*/gi, '')
    .replace(/Core\s*Idea\s*:\s*/gi, '')
    .replace(/Key\s*Points\s*:\s*/gi, '')
    .replace(/Direction\s*:\s*/gi, '')
    .replace(/Main\s*Concept\s*:\s*/gi, '')
    .replace(/Primary\s*Concept\s*:\s*/gi, '')
    .replace(/Supporting\s*Evidence\s*:\s*/gi, '')
    .replace(/Key\s*Mechanisms\s*:\s*/gi, '')
    .replace(/Conclusions\s*:\s*/gi, '')
    .replace(/Selection\s*Logic\s*:\s*/gi, '')
    .replace(/Related\s*Concepts\s*:\s*/gi, '')
    .replace(/Process\s*Steps\s*:\s*/gi, '')
    .replace(/Comparison\s*:\s*/gi, '')
    .replace(/Supporting\s*Details\s*:\s*/gi, '')
    .replace(/Central\s*Thesis\s*:\s*/gi, '')
    .replace(/^\s*[••]\s*/gm, '') // Remove bullet points
    .replace(/^\s*[-–—]\s*/gm, '') // Remove dash bullet points
    .replace(/^\s*[*]\s*/gm, '') // Remove asterisk bullet points
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Split into sentences for processing
  const sentences = cleanedContent.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Layout-specific formatting
  switch (layout) {
    case 'executive':
      // EXECUTIVE: 1 short paragraph, 3–4 sentences max, strategy + intent tone, NO bullets, NO headings
      return formatExecutivePresentation(sentences);

    case 'bullet':
      // BULLET: 4–6 bullets, each bullet = ONE distinct idea, conversational but concise
      return formatBulletPresentation(sentences);

    case 'notes':
      // NOTES: Short paragraph-style lines, sounds like personal notes, no formal framing
      return formatNotesPresentation(sentences);

    case 'infostructured':
      // STRUCTURED: Keep sections but DO NOT expose labels, natural transitions
      return formatStructuredPresentation(sentences);

    default:
      // Fallback to executive style for unknown layouts
      return formatExecutivePresentation(sentences);
  }
}

/**
 * Format executive presentation - natural paragraph with strategy tone
 */
function formatExecutivePresentation(sentences: string[]): string {
  if (sentences.length === 0) {
    return "Summary could not be generated from the provided content.";
  }

  // Take the most important 3-4 sentences and rewrite them in a strategic, intent-focused way
  const selectedSentences = sentences.slice(0, 4);
  
  // Rewrite to ensure natural flow and remove any remaining artifacts
  const rewritten = selectedSentences.map((sentence, index) => {
    // Make each sentence sound more strategic and intent-focused
    let rewrittenSentence = sentence
      .replace(/this shows that/gi, 'the strategy demonstrates')
      .replace(/this indicates that/gi, 'this reveals')
      .replace(/the key point is/gi, 'fundamentally,')
      .replace(/it is important to note/gi, 'critically,')
      .replace(/in conclusion,/gi, 'ultimately,')
      .replace(/therefore,/gi, 'as a result,')
      .replace(/however,/gi, 'yet')
      .replace(/moreover,/gi, 'furthermore,')
      .replace(/in addition,/gi, 'additionally,');

    // Ensure proper sentence structure
    if (!rewrittenSentence.match(/^[A-Z]/)) {
      rewrittenSentence = rewrittenSentence.charAt(0).toUpperCase() + rewrittenSentence.slice(1);
    }
    
    if (!rewrittenSentence.endsWith('.') && !rewrittenSentence.endsWith('!') && !rewrittenSentence.endsWith('?')) {
      rewrittenSentence += '.';
    }
    
    return rewrittenSentence;
  });

  // Combine into a single paragraph with natural flow
  return rewritten.join(' ');
}

/**
 * Format bullet presentation - distinct conversational bullets
 */
function formatBulletPresentation(sentences: string[]): string {
  if (sentences.length === 0) {
    return "• No key points identified";
  }

  // Select 4-6 most distinct ideas
  const selectedIdeas = sentences.slice(0, 6);
  
  // Rewrite each as a distinct, conversational bullet
  const bullets = selectedIdeas.map((idea, index) => {
    // Make each bullet sound conversational and distinct
    let bullet = idea
      .replace(/the (\w+)/, 'a key $1') // "the concept" → "a key concept"
      .replace(/demonstrates that/gi, 'shows how')
      .replace(/indicates that/gi, 'reveals that')
      .replace(/suggests that/gi, 'implies that')
      .replace(/highlights that/gi, 'emphasizes that')
      .replace(/illustrates that/gi, 'demonstrates how')
      .replace(/proves that/gi, 'confirms that')
      .replace(/results in/gi, 'leads to')
      .replace(/causes/gi, 'drives')
      .replace(/affects/gi, 'impacts')
      .replace(/influences/gi, 'shapes');

    // Ensure each bullet starts differently
    const bulletStarters = [
      'Key insight:',
      'Important finding:',
      'Critical observation:',
      'Notable point:',
      'Significant aspect:',
      'Essential element:'
    ];
    
    const starter = bulletStarters[index % bulletStarters.length];
    
    // Capitalize first letter and ensure proper punctuation
    if (!bullet.match(/^[A-Z]/)) {
      bullet = bullet.charAt(0).toUpperCase() + bullet.slice(1);
    }
    
    if (!bullet.endsWith('.') && !bullet.endsWith('!') && !bullet.endsWith('?')) {
      bullet += '.';
    }
    
    return `• ${starter} ${bullet}`;
  });

  return bullets.join('\n');
}

/**
 * Format notes presentation - personal, informal style
 */
function formatNotesPresentation(sentences: string[]): string {
  if (sentences.length === 0) {
    return "No significant notes to capture";
  }

  // Select key ideas and make them sound like personal notes
  const selectedIdeas = sentences.slice(0, 5);
  
  const notes = selectedIdeas.map((idea, index) => {
    // Make each line sound like personal notes
    let note = idea
      .replace(/the (\w+)/gi, 'this $1') // "the concept" → "this concept"
      .replace(/demonstrates that/gi, 'shows')
      .replace(/indicates that/gi, 'means')
      .replace(/suggests that/gi, 'implies')
      .replace(/highlights that/gi, 'points to')
      .replace(/illustrates that/gi, 'demonstrates')
      .replace(/proves that/gi, 'confirms')
      .replace(/results in/gi, 'leads to')
      .replace(/therefore,/gi, 'so')
      .replace(/however,/gi, 'but')
      .replace(/moreover,/gi, 'also')
      .replace(/in addition,/gi, 'plus');

    // Make notes more informal
    note = note
      .replace(/utilizes/gi, 'uses')
      .replace(/implements/gi, 'applies')
      .replace(/facilitates/gi, 'helps with')
      .replace(/enables/gi, 'allows')
      .replace(/optimizes/gi, 'improves')
      .replace(/maximizes/gi, 'boosts')
      .replace(/minimizes/gi, 'reduces')
      .replace(/enhances/gi, 'makes better');

    // Ensure proper sentence structure but keep it informal
    if (!note.match(/^[A-Z]/)) {
      note = note.charAt(0).toUpperCase() + note.slice(1);
    }
    
    if (!note.endsWith('.') && !note.endsWith('!') && !note.endsWith('?')) {
      note += '.';
    }
    
    return note;
  });

  // Join with newlines to create note-style formatting
  return notes.join('\n');
}

/**
 * Format structured presentation - blog-like outline with natural transitions
 */
function formatStructuredPresentation(sentences: string[]): string {
  if (sentences.length === 0) {
    return "## Overview\n\nNo content available for structured summary.";
  }

  // Group sentences into logical sections
  const overviewSentences = sentences.slice(0, 2);
  const keyPointsSentences = sentences.slice(2, 5);
  const implicationsSentences = sentences.slice(5, 7);

  // Create natural transitions between sections
  const sections = [];

  if (overviewSentences.length > 0) {
    sections.push(formatOverviewSection(overviewSentences));
  }

  if (keyPointsSentences.length > 0) {
    sections.push(formatKeyPointsSection(keyPointsSentences));
  }

  if (implicationsSentences.length > 0) {
    sections.push(formatImplicationsSection(implicationsSentences));
  }

  return sections.join('\n\n');
}

function formatOverviewSection(sentences: string[]): string {
  const overview = sentences.map(sentence => {
    // Make overview sound more introductory
    return sentence
      .replace(/the main idea is/gi, 'at its core,')
      .replace(/the key concept is/gi, 'fundamentally,')
      .replace(/this demonstrates/gi, 'this reveals')
      .replace(/the analysis shows/gi, 'the examination uncovers')
      .replace(/it is evident that/gi, 'clearly,');
  }).join(' ');

  return overview;
}

function formatKeyPointsSection(sentences: string[]): string {
  const points = sentences.map((sentence, index) => {
    // Make each point sound distinct
    const pointStarters = [
      'Firstly',
      'Secondly',
      'Additionally',
      'Moreover',
      'Furthermore'
    ];
    
    const starter = pointStarters[index % pointStarters.length];
    
    let point = sentence
      .replace(/the (\w+)/, 'a significant $1')
      .replace(/demonstrates that/gi, 'shows how')
      .replace(/indicates that/gi, 'reveals that')
      .replace(/suggests that/gi, 'implies that');

    return `${starter}, ${point}`;
  });

  return points.join(' ');
}

function formatImplicationsSection(sentences: string[]): string {
  const implications = sentences.map(sentence => {
    // Make implications sound forward-looking
    return sentence
      .replace(/this means that/gi, 'this suggests that')
      .replace(/therefore,/gi, 'as a result,')
      .replace(/in conclusion,/gi, 'ultimately,')
      .replace(/this implies that/gi, 'this indicates that')
      .replace(/the outcome is/gi, 'the result will be');
  }).join(' ');

  return implications;
}

/**
 * SAFETY CHECK for presentation formatter
 * If formatted output still contains labels or duplicated lines, fallback to simpler rewrite
 */
function checkPresentationSafety(formattedOutput: string): string {
  // Check for remaining labels or structural artifacts
  const hasLabels = /##\s*|Core\s*Idea\s*:|Key\s*Points\s*:|Direction\s*:/i.test(formattedOutput);
  
  // Check for duplicated lines
  const lines = formattedOutput.split('\n').filter(line => line.trim().length > 0);
  const uniqueLines = new Set(lines.map(line => line.trim().toLowerCase()));
  const hasDuplicates = uniqueLines.size < lines.length;

  if (hasLabels || hasDuplicates) {
    console.warn("Presentation formatter safety check failed - falling back to simpler rewrite");
    
    // Fallback: create a simple human-style paragraph
    const sentences = formattedOutput.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) {
      return "Summary could not be generated from the provided content.";
    }
    
    // Take first 3 sentences and make them sound natural
    const simpleSummary = sentences.slice(0, 3).map((sentence, index) => {
      let simple = sentence
        .replace(/##\s*|Core\s*Idea\s*:|Key\s*Points\s*:|Direction\s*:/gi, '')
        .replace(/^\s*[••]\s*/, '')
        .replace(/^\s*[-–—]\s*/, '')
        .replace(/^\s*[*]\s*/, '')
        .trim();

      if (!simple.match(/^[A-Z]/)) {
        simple = simple.charAt(0).toUpperCase() + simple.slice(1);
      }
      
      if (!simple.endsWith('.') && !simple.endsWith('!') && !simple.endsWith('?')) {
        simple += '.';
      }
      
      return simple;
    }).join(' ');
    
    return simpleSummary;
  }

  return formattedOutput;
}

/**
 * SAFETY & FALLBACK CHECKER
 * Validates AI output and falls back to extractive summary if needed
 */
async function validateAndFallback(
  aiOutput: string,
  inputText: string,
  ideas: { content: string; role: SemanticRole }[],
  layout: SummaryLayout
): Promise<string> {
  // Check for violations:
  // 1. Repeats original sentences
  // 2. Adds new information
  // 3. Violates length rules
  
  const originalSentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const aiSentences = aiOutput.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Check for sentence repetition
  const hasRepeatedSentences = aiSentences.some(aiSentence =>
    originalSentences.some(originalSentence =>
      semanticSimilarity(aiSentence, originalSentence) > 0.8
    )
  );

  // Check length violations
  let lengthViolation = false;
  const normalizedLayout = layout === 'infostructured' ? 'structured' : layout;
  
  switch (normalizedLayout) {
    case 'executive':
      lengthViolation = aiSentences.length > 4;
      break;
    case 'bullet':
      const bulletCount = aiOutput.split('\n').filter(line => line.trim().startsWith('•')).length;
      lengthViolation = bulletCount < 4 || bulletCount > 6;
      break;
    case 'notes':
      const noteLines = aiOutput.split('\n').filter(line => line.trim().length > 0);
      lengthViolation = noteLines.length > 8;
      break;
    case 'structured':
      const sectionCount = (aiOutput.match(/^##/gm) || []).length;
      lengthViolation = sectionCount < 2 || sectionCount > 4;
      break;
  }

  if (hasRepeatedSentences || lengthViolation) {
    console.warn("AI output validation failed, falling back to extractive summary");
    // Fall back to existing extractive summary formatter
    return formatSummaryForPresentation(normalizedLayout as "executive" | "bullet" | "notes" | "structured", ideas);
  }

  // STEP 5: Apply FINAL presentation formatter
  // This runs AFTER AI abstraction and BEFORE rendering to canvas
  const formattedOutput = formatAbstractedSummary(aiOutput, layout);
  
  // Apply safety check to ensure no labels or duplicates remain
  return checkPresentationSafety(formattedOutput);
}

/**
 * PRESENTATION FORMATTER for summary outputs
 * Transforms internal semantic structure into human-readable summaries
 */
function formatSummaryForPresentation(
  layout: "bullet" | "notes" | "structured" | "executive",
  ideas: { content: string; role: SemanticRole }[]
): string {
  // Strip internal labels and weak content
  const cleanIdeas = ideas
    .map(idea => ({
      content: stripInternalLabels(idea.content),
      role: idea.role
    }))
    .filter(idea => idea.content && idea.content.length > 10); // Omit weak content

  if (cleanIdeas.length === 0) {
    return "Summary could not be generated from the provided text.";
  }

  switch (layout) {
    case "bullet":
      return formatBulletSummary(cleanIdeas);

    case "notes":
      return formatNotesSummary(cleanIdeas);

    case "structured":
      return formatStructuredSummary(cleanIdeas);

    case "executive":
      return formatExecutiveSummary(cleanIdeas);

    default:
      return formatBulletSummary(cleanIdeas);
  }
}

/**
 * Strip internal reasoning labels from content
 */
function stripInternalLabels(content: string): string {
  const internalLabels = [
    "Central Thesis:",
    "Supporting Evidence:",
    "Key Mechanisms:",
    "Conclusions:",
    "Selection Logic:",
    "No mechanisms identified",
    "No specific arguments identified",
    "Main concept not clearly identified",
    "No explicit conclusions"
  ];

  let cleaned = content;
  for (const label of internalLabels) {
    cleaned = cleaned.replace(new RegExp(label, 'gi'), '').trim();
  }

  // Remove leading/trailing punctuation and extra whitespace
  cleaned = cleaned.replace(/^[:;\s]+|[:;\s]+$/g, '');

  return cleaned;
}

/**
 * Format bullet summary - natural sentences only
 */
function formatBulletSummary(ideas: { content: string; role: SemanticRole }[]): string {
  const bullets: string[] = [];

  // Prioritize thesis, then evidence, then mechanisms
  const thesisIdeas = ideas.filter(i => i.role === SemanticRole.THESIS);
  const evidenceIdeas = ideas.filter(i => i.role === SemanticRole.EVIDENCE);
  const mechanismIdeas = ideas.filter(i => i.role === SemanticRole.MECHANISM);
  const contrastIdeas = ideas.filter(i => i.role === SemanticRole.CONTRAST);

  // Convert to natural bullet points (4-6 max)
  const allIdeas = [...thesisIdeas, ...evidenceIdeas, ...mechanismIdeas, ...contrastIdeas];

  for (let i = 0; i < Math.min(allIdeas.length, 6); i++) {
    const idea = allIdeas[i];
    if (idea.content) {
      // Ensure it reads as a complete sentence
      let bullet = idea.content.trim();
      if (!bullet.endsWith('.') && !bullet.endsWith('!') && !bullet.endsWith('?')) {
        bullet += '.';
      }
      bullets.push(`• ${bullet}`);
    }
  }

  return bullets.join('\n');
}

/**
 * Format notes summary - human-friendly labeled sections
 */
function formatNotesSummary(ideas: { content: string; role: SemanticRole }[]): string {
  const sections: string[] = [];

  // Core Idea section
  const thesisIdeas = ideas.filter(i => i.role === SemanticRole.THESIS);
  if (thesisIdeas.length > 0) {
    const coreContent = thesisIdeas.map(i => i.content).join(' ').substring(0, 200);
    sections.push(`Core Idea: ${coreContent}`);
  }

  // Key Points section
  const evidenceIdeas = ideas.filter(i => i.role === SemanticRole.EVIDENCE);
  if (evidenceIdeas.length > 0) {
    const keyPoints = evidenceIdeas.slice(0, 3).map(i => i.content.substring(0, 100)).join('; ');
    sections.push(`Key Points: ${keyPoints}`);
  }

  // Direction/Process section
  const mechanismIdeas = ideas.filter(i => i.role === SemanticRole.MECHANISM);
  const contrastIdeas = ideas.filter(i => i.role === SemanticRole.CONTRAST);
  const processIdeas = [...mechanismIdeas, ...contrastIdeas];

  if (processIdeas.length > 0) {
    const direction = processIdeas.slice(0, 2).map(i => i.content.substring(0, 80)).join('; ');
    sections.push(`Direction: ${direction}`);
  }

  return sections.join('\n');
}

/**
 * Format structured summary - clean section headers
 */
function formatStructuredSummary(ideas: { content: string; role: SemanticRole }[]): string {
  const sections: string[] = [];

  // Overview section
  const thesisIdeas = ideas.filter(i => i.role === SemanticRole.THESIS);
  if (thesisIdeas.length > 0) {
    sections.push("## Overview");
    sections.push(thesisIdeas[0].content);
    sections.push("");
  }

  // Key Points section
  const evidenceIdeas = ideas.filter(i => i.role === SemanticRole.EVIDENCE);
  if (evidenceIdeas.length > 0) {
    sections.push("## Key Points");
    evidenceIdeas.slice(0, 3).forEach(idea => {
      sections.push(`• ${idea.content}`);
    });
    sections.push("");
  }

  // Direction section
  const mechanismIdeas = ideas.filter(i => i.role === SemanticRole.MECHANISM);
  const contrastIdeas = ideas.filter(i => i.role === SemanticRole.CONTRAST);
  const processIdeas = [...mechanismIdeas, ...contrastIdeas];

  if (processIdeas.length > 0) {
    sections.push("## Direction");
    processIdeas.slice(0, 2).forEach(idea => {
      sections.push(`• ${idea.content}`);
    });
  }

  return sections.join('\n');
}

/**
 * Format executive summary - natural paragraph style
 */
function formatExecutiveSummary(ideas: { content: string; role: SemanticRole }[]): string {
  const sentences: string[] = [];

  // Start with main idea
  const thesisIdeas = ideas.filter(i => i.role === SemanticRole.THESIS);
  if (thesisIdeas.length > 0) {
    sentences.push(thesisIdeas[0].content);
  }

  // Add key supporting points
  const evidenceIdeas = ideas.filter(i => i.role === SemanticRole.EVIDENCE);
  if (evidenceIdeas.length > 0) {
    const keyEvidence = evidenceIdeas[0].content;
    sentences.push(keyEvidence);
  }

  // Add process/direction if available
  const mechanismIdeas = ideas.filter(i => i.role === SemanticRole.MECHANISM);
  if (mechanismIdeas.length > 0) {
    const process = mechanismIdeas[0].content;
    sentences.push(process);
  }

  // Limit to 3-4 sentences max
  const finalSentences = sentences.slice(0, 4);

  // Ensure proper sentence endings
  const formatted = finalSentences.map(s => {
    let sentence = s.trim();
    if (!sentence.endsWith('.') && !sentence.endsWith('!') && !sentence.endsWith('?')) {
      sentence += '.';
    }
    return sentence;
  });

  return formatted.join(' ');
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