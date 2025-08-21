// Comprehensive profanity word list
const PROFANE_WORDS = new Set([
  // Basic profanity
  "fuck", "fucking", "fucked", "fucker", "fuckface", "motherfucker", "fucktard",
  "shit", "shitting", "shitty", "bullshit", "horseshit", "dipshit", "shithead",
  "bitch", "bitchy", "bitches", "son of a bitch", "basic bitch",
  "ass", "asshole", "asshat", "dumbass", "smartass", "badass", "jackass",
  "damn", "damned", "goddamn", "goddamned",
  "hell", "hellish", "go to hell", "what the hell",
  "crap", "crappy", "crapped", "crapping",
  "piss", "pissed", "pissing", "piss off",
  "bastard", "bastards",
  
  // Sexual/vulgar terms
  "whore", "slut", "sluts", "slutty", "hooker", "prostitute",
  "cunt", "pussy", "vagina", "penis", "cock", "dick", "dickhead",
  "boobs", "tits", "titties", "nipples", "boobies",
  "sex", "sexy", "sexual", "porn", "pornography", "masturbate",
  "orgasm", "climax", "horny", "aroused",
  
  // Derogatory terms
  "retard", "retarded", "idiot", "moron", "imbecile", "stupid",
  "loser", "freak", "weirdo", "creep", "pervert",
  "gay", "fag", "faggot", "homo", "queer", "dyke", "lesbian",
  
  // Racial/ethnic slurs (partial list - add more as needed)
  "nigger", "nigga", "chink", "gook", "spic", "wetback", "beaner",
  "kike", "raghead", "towelhead", "camel jockey", "sand nigger",
  
  // Religious/cultural insults
  "jesus christ", "christ", "god damn", "holy shit", "jesus",
  
  // Variations with common substitutions
  "f*ck", "f**k", "f***", "fuk", "fck", "phuck", "fawk",
  "sh*t", "sh**", "sht", "shyt", "shiite",
  "b*tch", "b**ch", "biatch", "beyotch",
  "a$$", "a**", "azz",
  "d@mn", "d*mn", "dam", "dayum",
  "h3ll", "h*ll", "heck",
  "cr@p", "cr*p", "krap",
  "p*ss", "pee", "piss",
  
  // Leetspeak variations
  "fvck", "phuk", "fawk", "fook", "fuk", "fuc", "fuk",
  "5hit", "sh1t", "shlt", "chit", "sheeit",
  "b1tch", "b!tch", "8itch", "beatch", "biznatch",
  "a55", "455", "@ss", "ars", "arse",
  "d4mn", "d@m", "dayem", "dahm",
  "h311", "he11", "hel",
  "cr4p", "kr4p", "krap",
  "p155", "p!ss", "p1ss",
  
  // Common offensive phrases
  "kill yourself", "kys", "go die", "die in a fire",
  "shoot yourself", "hang yourself", "jump off a bridge",
  "neck yourself", "end yourself", "delete yourself",
  
  // Drug references
  "cocaine", "heroin", "meth", "crack", "weed", "marijuana",
  "pot", "dope", "drugs", "high", "stoned", "blazed",
  
  // Violence
  "kill", "murder", "death", "die", "dead", "suicide",
  "shoot", "gun", "knife", "stab", "beat up", "punch",
  
  // Hate speech
  "nazi", "hitler", "terrorist", "isis", "kkk", "white power",
  "supremacist", "genocide", "holocaust",
]);

// Expanded character substitutions - FIXED: properly escape regex special characters
const LEET_SUBSTITUTIONS: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '\\|': 'i',  // Escaped pipe character
  '0': 'o',
  '5': 's',
  '$': 's',
  'z': 's',
  '2': 's',
  '7': 't',
  '\\+': 't',  // Escaped plus character
  '8': 'b',
  '9': 'g',
  '6': 'g',
  '%': 'x',
};

// Additional patterns to catch creative bypassing
const SUSPICIOUS_PATTERNS = [
  /f+u+c+k+/gi,           // fuuuuck
  /s+h+i+t+/gi,           // shiiiit  
  /b+i+t+c+h+/gi,         // biiiitch
  /a+s+s+/gi,             // assss
  /d+a+m+n+/gi,           // daaamn
  /h+e+l+l+/gi,           // hellll
  /c+r+a+p+/gi,           // craaap
  /p+i+s+s+/gi,           // pissss
  /w+t+f+/gi,             // wtffffff
  /o+m+g+/gi,             // omgggg
  /f\.+u\.+c\.+k/gi,      // f.u.c.k
  /s\.+h\.+i\.+t/gi,      // s.h.i.t
  /f\s+u\s+c\s+k/gi,     // f u c k
  /s\s+h\s+i\s+t/gi,     // s h i t
];

function normalizeLeetSpeak(text: string): string {
  let normalized = text.toLowerCase();
  
  // Replace leet speak characters - FIXED: properly escape regex
  for (const [leet, normal] of Object.entries(LEET_SUBSTITUTIONS)) {
    // The leet key is already escaped if needed, so we can use it directly
    normalized = normalized.replace(new RegExp(leet, 'g'), normal);
  }
  
  // Remove excessive punctuation and special characters
  normalized = normalized.replace(/[^\w\s]/g, ' ');
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  const original = text.toLowerCase();
  const normalized = normalizeLeetSpeak(text);
  
  // Check against suspicious patterns first
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(original)) return true;
  }
  
  // Split into words and check each one
  const words = normalized.split(/\s+/);
  
  // Check exact matches
  for (const word of words) {
    if (PROFANE_WORDS.has(word)) return true;
  }
  
  // Check for profane words contained within other words
  for (const profaneWord of PROFANE_WORDS) {
    // Skip very short words to avoid false positives
    if (profaneWord.length < 4) continue;
    
    if (normalized.includes(profaneWord)) {
      // Additional check: make sure it's not part of a legitimate word
      const wordBoundary = new RegExp(`\\b${profaneWord}\\b`, 'i');
      if (wordBoundary.test(normalized)) return true;
      
      // Check for deliberate obfuscation (like "shitheads" -> "s h i t heads")
      const spacedWord = profaneWord.split('').join('\\s*');
      const spacedPattern = new RegExp(spacedWord, 'i');
      if (spacedPattern.test(original)) return true;
    }
  }
  
  // Check for reversed profanity
  const reversed = normalized.split('').reverse().join('');
  for (const profaneWord of PROFANE_WORDS) {
    if (reversed.includes(profaneWord)) return true;
  }
  
  return false;
}

// Additional check for context-sensitive content
function containsInappropriateContent(text: string): boolean {
  if (!text) return false;
  
  const lower = text.toLowerCase();
  
  // Check for inappropriate phrases that might not be caught by single words
  const inappropriatePatterns = [
    /kill\s+yourself/i,
    /go\s+die/i,
    /shoot\s+yourself/i,
    /hang\s+yourself/i,
    /end\s+it\s+all/i,
    /neck\s+yourself/i,
    /delete\s+yourself/i,
    /jump\s+off\s+a\s+bridge/i,
    /die\s+in\s+a\s+fire/i,
    /white\s+power/i,
    /heil\s+hitler/i,
    /gas\s+the/i,
    /lynch/i,
    /rope\s+day/i,
  ];
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(lower)) return true;
  }
  
  return false;
}

export function checkContentProfanity(content: {
  title?: string;
  description?: string;
  notes?: string;
  productNames?: string[];
  stepBodies?: string[];
}): { hasProfanity: boolean; field?: string } {
  
  //console.log('Checking profanity for:', content); 
  
  // Check title
  if (content.title && (containsProfanity(content.title) || containsInappropriateContent(content.title))) {
    //console.log('Profanity found in title:', content.title);
    return { hasProfanity: true, field: 'title' };
  }
  
  // Check description
  if (content.description && (containsProfanity(content.description) || containsInappropriateContent(content.description))) {
    //console.log('Profanity found in description:', content.description);
    return { hasProfanity: true, field: 'description' };
  }
  
  // Check notes
  if (content.notes && (containsProfanity(content.notes) || containsInappropriateContent(content.notes))) {
    //console.log('Profanity found in notes:', content.notes);
    return { hasProfanity: true, field: 'notes' };
  }
  
  // Check product names
  if (content.productNames) {
    //console.log('Checking product names:', content.productNames);
    for (const name of content.productNames) {
      if (containsProfanity(name) || containsInappropriateContent(name)) {
        //console.log('Profanity found in product name:', name);
        return { hasProfanity: true, field: 'product name' };
      }
    }
  }
  
  // Check step descriptions
  if (content.stepBodies) {
    //console.log('Checking step bodies:', content.stepBodies);
    for (const body of content.stepBodies) {
      //console.log('Checking step body:', body);
      if (containsProfanity(body) || containsInappropriateContent(body)) {
        //console.log('Profanity found in step description:', body);
        return { hasProfanity: true, field: 'step description' };
      }
    }
  }
  
  //console.log('No profanity found');
  return { hasProfanity: false };
}