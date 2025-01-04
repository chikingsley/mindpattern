'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Network, MessageCircle, Activity, Lightbulb, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => {
  return twMerge(clsx(inputs));
};

interface Pattern {
  type: 'behavioral' | 'cognitive' | 'emotional' | 'therapeutic' | 'insight';
  label: string;
  strength: number;
  memories?: string[];
  connections?: {
    type: string;
    description: string;
  }[];
}

interface EnhancedChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  patterns: Pattern[];
  timestamp: string;
  memoryStrength: number;
}

const ChatDemo = () => {
  const [expandedPattern, setExpandedPattern] = useState<number | null>(null);
  
  const messages: EnhancedChatMessage[] = [
    {
      id: 1,
      role: 'user',
      content: "I've been feeling quite overwhelmed lately with work.",
      patterns: [
        {
          type: 'emotional',
          label: 'Stress Response',
          strength: 0.9,
          memories: [
            'Similar stress pattern from last month',
            'Previous work-related anxiety discussion'
          ],
          connections: [
            { type: 'temporal', description: 'Recurring pattern every quarter' },
            { type: 'causal', description: 'Linked to project deadlines' }
          ]
        },
        {
          type: 'behavioral',
          label: 'Work-Life Balance',
          strength: 0.7,
          memories: [
            'Discussion about boundary setting',
            'Time management strategies'
          ],
          connections: [
            { type: 'therapeutic', description: 'Related to self-care practices' }
          ]
        },
        {
          type: 'cognitive',
          label: 'Decision Making',
          strength: 0.85,
          memories: [
            'Past problem-solving sessions',
            'Strategy development discussions'
          ],
          connections: [
            { type: 'analytical', description: 'Links to decision-making patterns' },
            { type: 'behavioral', description: 'Impact on work efficiency' }
          ]
        }
      ],
      timestamp: '9:00 AM',
      memoryStrength: 0.9
    },
    {
      id: 2,
      role: 'assistant',
      content: "I notice this feeling of being overwhelmed has come up before. Let's explore what specific aspects of work are contributing to this, and how they might connect to patterns we've discussed previously.",
      patterns: [
        {
          type: 'insight',
          label: 'Pattern Recognition',
          strength: 0.85,
          memories: [
            'Previous stress discussions',
            'Identified work stressors'
          ],
          connections: [
            { type: 'analytical', description: 'Links multiple stress instances' },
            { type: 'historical', description: 'References past coping strategies' }
          ]
        },
        {
          type: 'therapeutic',
          label: 'Exploratory Approach',
          strength: 0.8,
          memories: [
            'Successful previous explorations',
            'Effective questioning patterns'
          ],
          connections: [
            { type: 'methodological', description: 'Builds on proven approaches' }
          ]
        }
      ],
      timestamp: '9:01 AM',
      memoryStrength: 0.7
    }
  ];

  const getPatternIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'behavioral': return <Activity className="text-orange-500" />;
      case 'cognitive': return <Brain className="text-blue-500" />;
      case 'emotional': return <Sparkles className="text-purple-500" />;
      case 'therapeutic': return <MessageCircle className="text-green-500" />;
      case 'insight': return <Lightbulb className="text-yellow-500" />;
    }
  };

  const PatternVisualizer = ({ pattern, index }: { pattern: Pattern; index: number }) => {
    const isExpanded = expandedPattern === index;
    
    return (
      <motion.div
        layout
        className={cn(
          "rounded-lg border border-gray-100 overflow-hidden",
          isExpanded ? "col-span-3" : "col-span-3 sm:col-span-2 md:col-span-1"
        )}
        animate={{ 
          height: 'auto',
          transition: { duration: 0.3 }
        }}
      >
        <div 
          className={cn(
            "bg-gray-50/50 p-4 cursor-pointer hover:bg-gray-100/50 transition-colors",
            isExpanded && "border-b border-gray-100"
          )}
          onClick={() => setExpandedPattern(isExpanded ? null : index)}
        >
          <div className="flex items-center gap-2">
            {getPatternIcon(pattern.type)}
            <span className="font-medium flex-1">{pattern.label}</span>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "px-2 py-1 rounded-full text-xs",
                pattern.strength > 0.8 ? "bg-purple-100 text-purple-700" :
                pattern.strength > 0.6 ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-700"
              )}
            >
              {Math.round(pattern.strength * 100)}% match
            </motion.div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 space-y-6 bg-white"
            >
              {/* Memory Connections */}
              {pattern.memories && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-500">Related Memories</div>
                  <div className="grid gap-2">
                    {pattern.memories.map((memory, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>{memory}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pattern Connections */}
              {pattern.connections && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-500">Pattern Connections</div>
                  <div className="grid gap-3">
                    {pattern.connections.map((connection, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        className="flex items-start gap-3 bg-gray-50/50 p-3 rounded-md"
                      >
                        <Network className="w-4 h-4 text-indigo-400 mt-0.5" />
                        <div>
                          <div className="font-medium text-xs text-indigo-500 mb-1">
                            {connection.type}
                          </div>
                          <p className="text-sm text-gray-600">{connection.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-4xl mx-auto p-4 space-y-8">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "space-y-4",
                message.role === "user" ? "ml-auto" : "mr-auto",
                "w-full"
              )}
            >
              <div className={cn(
                "rounded-lg p-4 relative",
                message.role === "user" ? "bg-blue-50" : "bg-white border"
              )}>
                <div className="text-sm font-medium mb-2">{message.role}</div>
                <div className="text-gray-800">{message.content}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {message.patterns.map((pattern, idx) => (
                  <PatternVisualizer key={idx} pattern={pattern} index={idx} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatDemo;