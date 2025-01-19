"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pattern {
  type: string;
  frequency: string;
  correlation: string;
  insight: string;
}

interface Insight {
  title: string;
  points: string[];
  recommendation: string;
}

interface ChatMessageType {
  type: 'user' | 'ai';
  content: string;
  time: string;
  pattern?: Pattern;
  insight?: Insight;
}

const FeatureDemoSection = () => {
  const [demoState, setDemoState] = useState({
    messageIndex: 0,
    showPattern: false,
    showInsight: false
  });

  // Simulated chat flow
  const chatSequence: ChatMessageType[] = [
    {
      type: 'user',
      content: "I'm nervous about my presentation tomorrow...",
      time: '9:45 PM'
    },
    {
      type: 'ai',
      content: "I notice this feeling often comes up the night before presentations. Looking at your pattern history, you actually perform best when you...",
      time: '9:45 PM',
      pattern: {
        type: 'Pre-presentation Anxiety',
        frequency: '8 occurrences in 3 months',
        correlation: 'Peaks 12-18 hours before events',
        insight: 'Strong performance despite anxiety'
      }
    },
    {
      type: 'user',
      content: "Yeah, you're right. I guess I did well last time...",
      time: '9:46 PM'
    },
    {
      type: 'ai',
      content: "Indeed! Let's look at your success pattern from last time. You:",
      time: '9:46 PM',
      insight: {
        title: 'Success Pattern Detected',
        points: [
          'Prepared in 30-minute chunks',
          'Used breathing exercises',
          'Practiced with timer'
        ],
        recommendation: 'Want to apply this proven strategy again?'
      }
    }
  ];

  // Auto-advance demo
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoState(prev => {
        if (prev.messageIndex < chatSequence.length - 1) {
          return {
            messageIndex: prev.messageIndex + 1,
            showPattern: prev.messageIndex === 1,
            showInsight: prev.messageIndex === 3
          };
        }
        return { messageIndex: 0, showPattern: false, showInsight: false };
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const ChatMessage = ({ message }: { message: ChatMessageType }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] ${
        message.type === 'user'
          ? 'bg-purple-500 text-white rounded-l-xl rounded-tr-xl'
          : 'bg-white text-gray-800 rounded-r-xl rounded-tl-xl'
      } p-4 shadow-md`}>
        <p className="text-sm">{message.content}</p>
        <div className="text-xs mt-2 opacity-75">{message.time}</div>
      </div>
    </motion.div>
  );

  const PatternCard = ({ pattern }: { pattern: Pattern }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 shadow-lg my-4"
    >
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
          </svg>
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900">{pattern.type}</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600"> {pattern.frequency}</p>
            <p className="text-sm text-gray-600"> {pattern.correlation}</p>
            <p className="text-sm text-purple-600"> {pattern.insight}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const InsightCard = ({ insight }: { insight: Insight }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-lg my-4"
    >
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900">{insight.title}</h3>
          <ul className="mt-2 space-y-1">
            {insight.points.map((point, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2" />
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-green-600 font-medium">
            {insight.recommendation}
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            More Than Just Chat
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Experience AI that understands your patterns, celebrates your progress, 
            and helps you grow in meaningful ways
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Demo Chat Interface */}
          <div className="backdrop-blur-sm bg-white/50 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-white/70 px-4 py-3 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900">Live Demo</h3>
            </div>
            <div className="p-4 h-[500px] overflow-y-auto">
              {chatSequence.slice(0, demoState.messageIndex + 1).map((message, index) => (
                <React.Fragment key={index}>
                  <ChatMessage message={message} />
                  {demoState.showPattern && message.pattern && (
                    <PatternCard pattern={message.pattern} />
                  )}
                  {demoState.showInsight && message.insight && (
                    <InsightCard insight={message.insight} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-sm bg-white/50 rounded-xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Pattern Recognition
              </h3>
              <p className="text-gray-600 mb-4">
                Our AI doesn't just respond - it learns your patterns, understands your
                triggers, and helps you build on your successes.
              </p>
              <ul className="space-y-2">
                {[
                  'Real-time pattern detection',
                  'Success pattern reinforcement',
                  'Personalized strategy suggestions'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-sm bg-white/50 rounded-xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Continuous Learning
              </h3>
              <p className="text-gray-600 mb-4">
                Every interaction makes the AI smarter about your unique needs and 
                preferences, creating a truly personalized growth experience.
              </p>
              <ul className="space-y-2">
                {[
                  'Adapts to your communication style',
                  'Remembers context across sessions',
                  'Builds on previous successes'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureDemoSection;
