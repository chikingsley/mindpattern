'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

// Define types for our dictionaries
interface CmuDictionary {
  [key: string]: string[];
}

interface PhonemeToVisemeMap {
  [key: string]: string;
}

interface VisemePathMap {
  [key: string]: string;
}

// Simplified CMU dictionary entries for common words
const cmuDict: CmuDictionary = {
  'hello': ['HH', 'AH', 'L', 'OW'],
  'world': ['W', 'ER', 'L', 'D'],
  'test': ['T', 'EH', 'S', 'T'],
  'animation': ['AE', 'N', 'AH', 'M', 'EY', 'SH', 'AH', 'N'],
  'is': ['IH', 'Z'],
  'working': ['W', 'ER', 'K', 'IH', 'NG']
};

// Simplified phoneme to viseme mapping
const phonemeToViseme: PhonemeToVisemeMap = {
  'HH': 'open',
  'AH': 'open',
  'L': 'wide',
  'OW': 'round',
  'W': 'round',
  'ER': 'open',
  'D': 'closed',
  'T': 'closed',
  'EH': 'wide',
  'S': 'wide',
  'AE': 'wide',
  'N': 'closed',
  'M': 'closed',
  'EY': 'wide',
  'SH': 'round',
  'IH': 'wide',
  'Z': 'wide',
  'K': 'closed',
  'NG': 'closed'
};

// Viseme SVG paths
const visemePaths: VisemePathMap = {
  closed: "M 50 50 Q 75 50 100 50 Q 75 60 50 50",
  open: "M 50 50 Q 75 70 100 50 Q 75 60 50 50",
  wide: "M 40 50 Q 75 60 110 50 Q 75 60 40 50",
  round: "M 50 50 Q 75 65 100 50 Q 75 80 50 50"
};

const TextToVisemeAnimator = () => {
  const [text, setText] = useState('hello world');
  const [currentViseme, setCurrentViseme] = useState('closed');
  const [isAnimating, setIsAnimating] = useState(false);
  const [phonemeSequence, setPhonemeSequence] = useState<string[]>([]);

  const convertToPhonemes = (text: string): string[] => {
    return text.toLowerCase().split(' ')
      .filter(word => cmuDict[word])
      .flatMap(word => cmuDict[word]);
  };

  const animate = async (phonemes: string[]) => {
    setIsAnimating(true);
    for (let phoneme of phonemes) {
      const viseme = phonemeToViseme[phoneme] || 'closed';
      setCurrentViseme(viseme);
      await new Promise(resolve => setTimeout(resolve, 150)); // Adjust timing as needed
    }
    setCurrentViseme('closed');
    setIsAnimating(false);
  };

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phonemes = convertToPhonemes(text);
    setPhonemeSequence(phonemes);
    animate(phonemes);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Text to Viseme Animator</h2>
        
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Enter text (try: hello world, test animation)</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isAnimating}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isAnimating}
          >
            Animate
          </button>
        </form>

        <div className="mt-6">
          <svg viewBox="0 0 150 100" className="w-48 h-32 mx-auto border rounded">
            <path
              d={visemePaths[currentViseme]}
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Phoneme Sequence:</h3>
          <div className="flex flex-wrap gap-2">
            {phonemeSequence.map((phoneme, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 rounded text-sm"
              >
                {phoneme}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TextToVisemeAnimator;