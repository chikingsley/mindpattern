'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

// Define types for our dictionaries
interface CmuDictionary {
  [key: string]: string[];
}

interface PhonemeToVisemeMap {
  [key: string]: string;
}

interface VisemeConfig {
  shape: string;
  path: string;
  intensity: number;
  position: {
    jaw: number;
    lips: number;
    tongue: number;
  };
}

interface VisemePosition {
  jaw: number;
  lips: number;
  tongue: number;
}

interface Expression {
  eyebrows: number;  // -1 to 1
  eyes: number;      // 0 to 1
  smile: number;     // -1 to 1
}

// Initialize dictionary as empty first
let cmuDict: CmuDictionary = {};

// Load and parse CMU dictionary
const loadCmuDict = async (): Promise<CmuDictionary> => {
  const dict: CmuDictionary = {};
  try {
    const response = await fetch('/assets/cmudict-0.7b');
    const text = await response.text();
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Skip comments and empty lines
      if (line.startsWith(';;;') || !line.trim()) return;
      
      const [word, ...phonemes] = line.trim().split(/\s+/);
      // Store without parentheses for alternate pronunciations
      const cleanWord = word.replace(/\(\d+\)$/, '').toLowerCase();
      if (!dict[cleanWord]) {
        dict[cleanWord] = phonemes;
      }
    });
    
    console.log('CMU Dictionary loaded successfully');
    return dict;
  } catch (error) {
    console.error('Error loading CMU dictionary:', error);
    return {};
  }
};

// Enhanced viseme configurations
const VISEME_CONFIGS: { [key: string]: VisemeConfig } = {
  closed: {
    shape: 'closed',
    path: 'M 50,60 L 70,60',
    intensity: 0,
    position: { jaw: 0, lips: 0, tongue: 0 }
  },
  ah: {
    shape: 'ah',
    path: 'M 50,60 Q 60,63 70,60',
    intensity: 1.0,
    position: { jaw: 1.0, lips: 0.3, tongue: 0.2 }
  },
  oh: {
    shape: 'oh',
    path: 'M 52,60 Q 60,64 68,60',
    intensity: 1,
    position: { jaw: 0.8, lips: 1.0, tongue: 0.1 }
  },
  eh: {
    shape: 'eh',
    path: 'M 48,60 Q 60,61 72,60',
    intensity: 0.6,
    position: { jaw: 0.15, lips: 0.5, tongue: 0.2 }
  },
  ee: {
    shape: 'ee',
    path: 'M 48,60 Q 60,61 72,60',
    intensity: 1.0,
    position: { jaw: 0.2, lips: 1.0, tongue: 0.6 }
  },
  mb: {
    shape: 'mb',
    path: 'M 50,60 L 70,60',
    intensity: 0.3,
    position: { jaw: 0, lips: 0.7, tongue: 0 }
  },
  fv: {
    shape: 'fv',
    path: 'M 50,60 Q 60,60.5 70,60',
    intensity: 0.4,
    position: { jaw: 0.1, lips: 0.6, tongue: 0.1 }
  },
  kg: {
    shape: 'kg',
    path: 'M 50,60 L 70,60',
    intensity: 0.3,
    position: { jaw: 0, lips: 0.7, tongue: 0 }
  },
  sz: {
    shape: 'sz',
    path: 'M 50,60 Q 60,60.5 70,60',
    intensity: 0.4,
    position: { jaw: 0.1, lips: 0.6, tongue: 0.1 }
  },
  ch: {
    shape: 'ch',
    path: 'M 50,60 Q 60,60.5 70,60',
    intensity: 1.0,
    position: { jaw: 0.5, lips: 0.8, tongue: 0.7 }
  },
  th: {
    shape: 'th',
    path: 'M 50,60 Q 60,60.5 70,60',
    intensity: 0.4,
    position: { jaw: 0.1, lips: 0.6, tongue: 0.1 }
  },
  er: {
    shape: 'er',
    path: 'M 50,60 Q 60,60.5 70,60',
    intensity: 0.4,
    position: { jaw: 0.1, lips: 0.6, tongue: 0.1 }
  },
  ih: {
    shape: 'ih',
    path: 'M 48,60 Q 60,61 72,60',
    intensity: 0.6,
    position: { jaw: 0.15, lips: 0.5, tongue: 0.2 }
  },
  td: {
    shape: 'td',
    path: 'M 50,60 L 70,60',
    intensity: 0.3,
    position: { jaw: 0, lips: 0.7, tongue: 0 }
  }
};

// Map phonemes to visemes (mouth shapes)
const phonemeToViseme: PhonemeToVisemeMap = {
  // Vowels
  'AA': 'ah',    // odd     AA D
  'AE': 'ah',    // at      AE T
  'AH': 'ah',    // hut     HH AH T
  'AO': 'oh',    // ought   AO T
  'AW': 'oh',    // cow     K AW
  'AY': 'ah',    // hide    HH AY D
  'EH': 'eh',    // Ed      EH D
  'ER': 'er',    // hurt    HH ER T
  'EY': 'eh',    // ate     EY T
  'IH': 'ih',    // it      IH T
  'IY': 'ee',    // eat     IY T
  'OW': 'oh',    // oat     OW T
  'OY': 'oh',    // toy     T OY
  'UH': 'oh',    // hood    HH UH D
  'UW': 'oh',    // two     T UW
  
  // Consonants
  'B': 'mb',     // be      B IY
  'CH': 'ch',    // cheese  CH IY Z
  'D': 'td',     // dee     D IY
  'DH': 'th',    // thee    DH IY
  'F': 'fv',     // fee     F IY
  'G': 'kg',     // green   G R IY N
  'HH': 'ah',    // he      HH IY
  'JH': 'ch',    // gee     JH IY
  'K': 'kg',     // key     K IY
  'L': 'td',     // lee     L IY
  'M': 'mb',     // me      M IY
  'N': 'td',     // knee    N IY
  'NG': 'kg',    // ping    P IH NG
  'P': 'mb',     // pee     P IY
  'R': 'er',     // read    R IY D
  'S': 'sz',     // sea     S IY
  'SH': 'ch',    // she     SH IY
  'T': 'td',     // tea     T IY
  'TH': 'th',    // theta   TH EY T AH
  'V': 'fv',     // vee     V IY
  'W': 'oh',     // we      W IY
  'Y': 'ih',     // yield   Y IY L D
  'Z': 'sz',     // zee     Z IY
  'ZH': 'ch'     // seizure S IY ZH ER
};

const getExpression = (text: string): Expression => {
  const words = text.toLowerCase();
  // More detailed emotion detection
  if (words.includes('!!') || /wow|amazing|fantastic|awesome/i.test(words)) {
    return { eyebrows: 1, eyes: 1, smile: 1 };  // Very excited
  }
  if (words.includes('!') || /great|cool|nice|happy/i.test(words)) {
    return { eyebrows: 0.6, eyes: 1, smile: 0.8 };  // Happy
  }
  if (words.includes('?') || /what|how|why|when|where/i.test(words)) {
    return { eyebrows: 0.7, eyes: 1, smile: 0 };  // Questioning
  }
  if (/sad|sorry|unfortunately|regret/i.test(words)) {
    return { eyebrows: -0.5, eyes: 0.7, smile: -0.4 };  // Sad
  }
  if (/angry|mad|upset|hate/i.test(words)) {
    return { eyebrows: -0.8, eyes: 0.9, smile: -0.7 };  // Angry
  }
  if (/love|wonderful|beautiful/i.test(words)) {
    return { eyebrows: 0.3, eyes: 0.8, smile: 0.9 };  // Loving
  }
  return { eyebrows: 0, eyes: 1, smile: 0.1 };  // Neutral
};

const TextToVisemeAnimator = () => {
  const [text, setText] = useState<string>('hello world');
  const [currentViseme, setCurrentViseme] = useState<VisemeConfig>(VISEME_CONFIGS.closed);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [phonemeSequence, setPhonemeSequence] = useState<string[]>([]);
  const [expression, setExpression] = useState<Expression>({ eyebrows: 0, eyes: 1, smile: 0 });
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  // Convert text to phonemes using CMU dictionary
  const textToPhonemes = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const phonemes: string[] = [];
    
    words.forEach(word => {
      // Remove punctuation
      const cleanWord = word.replace(/[^a-z']/g, '');
      
      if (cmuDict[cleanWord]) {
        // Add phonemes from dictionary
        phonemes.push(...cmuDict[cleanWord]);
      } else {
        // Fallback for unknown words: simple approximation
        cleanWord.split('').forEach(char => {
          switch(char) {
            case 'a': phonemes.push('AH'); break;
            case 'e': phonemes.push('EH'); break;
            case 'i': phonemes.push('IH'); break;
            case 'o': phonemes.push('OW'); break;
            case 'u': phonemes.push('UH'); break;
            default: phonemes.push(char.toUpperCase());
          }
        });
      }
    });
    
    return phonemes;
  };

  const handleSpeak = () => {
    if (!text.trim()) return;
    
    // Convert text to phonemes
    const phonemes = textToPhonemes(text);
    console.log('Phonemes:', phonemes);
    
    // Start animation with phonemes
    animate(phonemes);
    
    // Start speech slightly after animation begins
    setTimeout(() => {
      if (window.speechSynthesis) {
        speakText(text, expression);
      }
    }, 50);
  };

  const animate = (phonemes: string[]) => {
    setIsAnimating(true);
    const PHONEME_DURATION = 120; // Slightly faster for better sync
    startTimeRef.current = performance.now();
    const newExpression = getExpression(text);
    
    // Smooth transition to new expression
    setExpression(prev => ({
      eyebrows: prev.eyebrows * 0.2 + newExpression.eyebrows * 0.8,
      eyes: prev.eyes * 0.3 + newExpression.eyes * 0.7,
      smile: prev.smile * 0.2 + newExpression.smile * 0.8
    }));

    const updateAnimation = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const currentPhonemeIndex = Math.floor(elapsed / PHONEME_DURATION);

      if (currentPhonemeIndex < phonemes.length) {
        const phoneme = phonemes[currentPhonemeIndex];
        const visemeShape = phonemeToViseme[phoneme] || 'closed';
        
        // Smooth transition between visemes
        const nextViseme = VISEME_CONFIGS[visemeShape];
        const progress = (elapsed % PHONEME_DURATION) / PHONEME_DURATION;
        
        setCurrentViseme(prev => ({
          ...nextViseme,
          position: {
            jaw: prev.position.jaw * (1 - progress) + nextViseme.position.jaw * progress,
            lips: prev.position.lips * (1 - progress) + nextViseme.position.lips * progress,
            tongue: prev.position.tongue * (1 - progress) + nextViseme.position.tongue * progress
          }
        }));
        
        animationRef.current = requestAnimationFrame(updateAnimation);
      } else {
        // Smooth transition back to neutral
        setCurrentViseme(VISEME_CONFIGS.closed);
        setIsAnimating(false);
        setExpression(prev => ({
          eyebrows: prev.eyebrows * 0.5,
          eyes: 1,
          smile: prev.smile * 0.3
        }));
      }
    };

    animationRef.current = requestAnimationFrame(updateAnimation);
  };

  const speakText = (text: string, expression: Expression) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    );
    if (englishVoice) utterance.voice = englishVoice;

    // Adjust speech parameters based on emotion
    utterance.rate = 1 + expression.smile * 0.2;  // Faster when happy
    utterance.pitch = 1 + expression.eyebrows * 0.2;  // Higher pitch when surprised
    utterance.volume = 1 + Math.abs(expression.smile) * 0.2;  // Louder for strong emotions

    window.speechSynthesis.speak(utterance);
  };

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isAnimating) return;

    handleSpeak();
  };

  // Load CMU dictionary on mount
  useEffect(() => {
    loadCmuDict().then(dict => {
      cmuDict = dict;
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Text to Viseme Animator</h2>
        
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Enter any text to animate</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isAnimating}
              placeholder="Try typing any sentence..."
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isAnimating}
          >
            {isAnimating ? 'Animating...' : 'Animate & Speak'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative w-64 h-64 mx-auto bg-gray-50 rounded-lg p-4">
            <svg width="200" height="200" viewBox="0 0 120 120" className="mx-auto">
              {/* Face base */}
              <circle cx="60" cy="60" r="50" fill="#FFE0D0" stroke="#000" strokeWidth="2" />
              
              {/* Eyebrows */}
              <motion.g animate={{ translateY: expression.eyebrows * -3 }}>
                <motion.path 
                  d={`M 35,38 Q 40,${35 + expression.eyebrows * -3} 45,38`}
                  stroke="#000" 
                  strokeWidth="2" 
                  fill="none"
                />
                <motion.path 
                  d={`M 75,38 Q 80,${35 + expression.eyebrows * -3} 85,38`}
                  stroke="#000" 
                  strokeWidth="2" 
                  fill="none"
                />
              </motion.g>

              {/* Eyes */}
              <motion.g>
                <motion.circle 
                  cx="40" 
                  cy="45" 
                  r="4" 
                  fill="#4B4B4B"
                  animate={{ 
                    scaleY: expression.eyes,
                    scaleX: 1 + Math.abs(expression.smile) * 0.2
                  }}
                />
                <motion.circle 
                  cx="80" 
                  cy="45" 
                  r="4" 
                  fill="#4B4B4B"
                  animate={{ 
                    scaleY: expression.eyes,
                    scaleX: 1 + Math.abs(expression.smile) * 0.2
                  }}
                />
              </motion.g>

              {/* Cheeks */}
              <motion.g
                animate={{
                  translateY: expression.smile * 2,
                  scale: 1 + Math.max(0, expression.smile) * 0.2
                }}
              >
                <circle cx="30" cy="60" r="8" fill="#FFD0D0" opacity="0.2" />
                <circle cx="90" cy="60" r="8" fill="#FFD0D0" opacity="0.2" />
              </motion.g>

              {/* Mouth group with expression influence */}
              <motion.g
                animate={{
                  translateY: currentViseme.position.jaw * 2,
                  scale: 1 + expression.smile * 0.1
                }}
              >
                {/* Mouth background */}
                <motion.path
                  d={currentViseme.path}
                  fill="#570F0F"
                  opacity={0.2}
                  animate={{
                    d: currentViseme.path,
                    transition: { duration: 0.1 }
                  }}
                />

                {/* Upper lip */}
                <motion.path
                  d={`M 50,59.5 Q 60,${59.5 - currentViseme.position.lips} 70,59.5`}
                  stroke="#C77"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Lower lip */}
                <motion.path
                  d={`M 50,60.5 Q 60,${60.5 + currentViseme.position.lips * 1.5} 70,60.5`}
                  stroke="#C77"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Teeth - only when mouth is open */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: currentViseme.position.jaw > 0.2 ? 0.9 : 0
                  }}
                >
                  {/* Upper teeth */}
                  <path
                    d="M 52,60 H 68"
                    stroke="#FFF"
                    strokeWidth="1.5"
                  />

                  {/* Lower teeth */}
                  <motion.path
                    d="M 52,60 H 68"
                    stroke="#FFF"
                    strokeWidth="1.5"
                    animate={{
                      transform: `translateY(${currentViseme.position.jaw * 3}px)`
                    }}
                  />
                </motion.g>

                {/* Tongue */}
                <motion.path
                  d="M 54,62 Q 60,63 66,62"
                  fill="#FF8B8B"
                  strokeWidth="0.5"
                  stroke="#D44"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: currentViseme.position.jaw > 0.25 ? currentViseme.position.tongue * 0.7 : 0,
                    transform: `translateY(${currentViseme.position.jaw * 2}px)`
                  }}
                />
              </motion.g>

              {/* Subtle cheek movement */}
              <motion.g
                animate={{
                  translateY: currentViseme.position.jaw * 1
                }}
              >
                <circle cx="30" cy="60" r="10" fill="#FFD0D0" opacity="0.2" />
                <circle cx="90" cy="60" r="10" fill="#FFD0D0" opacity="0.2" />
              </motion.g>
            </svg>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Viseme Details:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>Shape: {currentViseme.shape}</div>
              <div>Intensity: {currentViseme.intensity.toFixed(2)}</div>
              <div>Jaw: {currentViseme.position.jaw.toFixed(2)}</div>
              <div>Lips: {currentViseme.position.lips.toFixed(2)}</div>
              <div>Tongue: {currentViseme.position.tongue.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {phonemeSequence.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2">Phoneme Sequence:</h3>
            <div className="flex flex-wrap gap-2">
              {phonemeSequence.map((phoneme, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-white border rounded shadow-sm"
                >
                  {phoneme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TextToVisemeAnimator;