"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Calendar, 
  Zap, 
  Flame,
  MessageSquare,
  ChevronDown,
  Mic,
  Clock,
  Timer
} from 'lucide-react';

const ChatInterface = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sessionLength, setSessionLength] = useState('open-ended');
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const sessionOptions = [
    { id: 'open-ended', label: 'Open-ended' },
    { id: '30min', label: '30 minutes' },
    { id: '15min', label: '15 minutes' },
    { id: 'quick', label: 'Quick check-in' },
  ];

  const quickStartButtons = [
    {
      id: 'assess',
      label: 'Assess Myself',
      icon: Brain,
      color: 'text-purple-500',
      borderColor: 'border-purple-500',
      fillColor: 'bg-purple-500',
      dropdownItems: [
        { id: 'personality', label: 'Personality Assessment' },
        { id: 'attachment', label: 'Attachment Style' },
        { id: 'emotional', label: 'Emotional Intelligence' },
        { id: 'cognitive', label: 'Thinking Patterns' }
      ]
    },
    {
      id: 'plan',
      label: 'Plan My Day',
      icon: Calendar,
      color: 'text-blue-500',
      borderColor: 'border-blue-500',
      fillColor: 'bg-blue-500'
    },
    {
      id: 'pattern',
      label: 'Break a Pattern',
      icon: Zap,
      color: 'text-yellow-500',
      borderColor: 'border-yellow-500',
      fillColor: 'bg-yellow-500'
    },
    {
      id: 'inspired',
      label: 'Get Inspired',
      icon: Flame,
      color: 'text-red-500',
      borderColor: 'border-red-500',
      fillColor: 'bg-red-500',
      dropdownItems: [
        { id: 'childhood', label: 'Childhood Memories' },
        { id: 'relationships', label: 'Relationships' },
        { id: 'career', label: 'Career Journey' },
        { id: 'values', label: 'Core Values' }
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-8"
      >
        <div className="flex justify-center">
          <Brain className="w-12 h-12 text-purple-500" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {getGreeting()}, Alex
        </h1>
      </motion.div>

      {/* Main Chat Input Area */}
      <div className="relative pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20"
        >
          <div className="relative">
            <textarea
              className="w-full h-[100px] p-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 resize-none text-gray-800 dark:text-gray-100 shadow-lg"
              placeholder="What's your main focus today? Let's crush it."
            />
            
            {/* Session Length Selector and Start Button */}
            <div className="absolute bottom-4 left-4 z-10">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'session' ? null : 'session')}
                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Clock className="w-4 h-4" />
                <span>{sessionOptions.find(opt => opt.id === sessionLength)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'session' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'session' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2"
                  >
                    {sessionOptions.map(option => (
                      <button
                        key={option.id}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        onClick={() => {
                          setSessionLength(option.id);
                          setActiveDropdown(null);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <Mic className="w-4 h-4" />
              <span>Start Call</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-4 absolute top-2 left-0 right-0 pt-24"
        >
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {quickStartButtons.map((button) => {
              const Icon = button.icon;
              const isActive = activeDropdown === button.id;
              
              return (
                <div key={button.id} className="relative">
                  <motion.button
                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center space-x-2 whitespace-nowrap
                      ${button.borderColor} ${isActive ? `${button.fillColor} text-white` : button.color}
                    `}
                    onClick={() => setActiveDropdown(isActive ? null : button.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{button.label}</span>
                    {button.dropdownItems && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isActive && button.dropdownItems && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-30"
                      >
                        {button.dropdownItems.map((item) => (
                          <button
                            key={item.id}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;