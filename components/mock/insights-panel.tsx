"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const InsightsPanel = () => {
  const [activePeriod, setActivePeriod] = useState('today');

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 relative z-10">
      <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Today's Insights</h2>
          <div className="flex space-x-2">
            {['today', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  activePeriod === period
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pattern Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-purple-600 font-medium mb-1">Pattern Detected</div>
                <h3 className="text-gray-900 font-medium mb-2">Morning Productivity Peak</h3>
                <p className="text-sm text-gray-600">Your focus is strongest 2 hours after your morning workout</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">Recent Performance</div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </motion.div>

          {/* Upcoming Challenge Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-orange-600 font-medium mb-1">Upcoming Challenge</div>
                <h3 className="text-gray-900 font-medium mb-2">Team Presentation</h3>
                <p className="text-sm text-gray-600">Let's prepare using your successful strategies</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-3">
              <button className="text-xs bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-orange-600 hover:bg-white">View Plan</button>
              <button className="text-xs bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-orange-600 hover:bg-white">Previous Success</button>
            </div>
          </motion.div>

          {/* Growth Tracking Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-emerald-600 font-medium mb-1">Growth Track</div>
                <h3 className="text-gray-900 font-medium mb-2">Public Speaking Confidence</h3>
                <p className="text-sm text-gray-600">+15% improvement this month</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Last Month</span>
                <span>Current</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </motion.div>

          {/* Quick Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1">Suggested Actions</div>
                <h3 className="text-gray-900 font-medium mb-2">Build on Today's Progress</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button className="w-full text-left text-sm bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-gray-700 hover:bg-white">
                Schedule focus block for tomorrow
              </button>
              <button className="w-full text-left text-sm bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-gray-700 hover:bg-white">
                Review this week's patterns
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;