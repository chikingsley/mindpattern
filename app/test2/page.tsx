'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import Expressions from "@/components/Expressions";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import type { ChatMessage } from "@/types/database";
import { Brain, Network, Bookmark, Share, Zap, Sparkles } from 'lucide-react';
import * as d3 from 'd3';

interface MemoryNode {
  id: string;
  group: number;
  value: number;
  label: string;
}

interface MemoryLink {
  source: string;
  target: string;
  value: number;
}

interface MemoryVisualization {
  nodes: MemoryNode[];
  links: MemoryLink[];
}

interface EnhancedChatMessage extends ChatMessage {
  memoryStrength: number;
  memoryConnections: string[];
  bookmarked?: boolean;
  emotionalImpact: number;
}

export default function TestChat() {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const [messages] = useState<EnhancedChatMessage[]>([
    {
      role: 'user',
      content: 'Hey, how are you doing today?',
      timestamp: '2025-01-04T08:30:00Z',
      metadata: {
        prosody: {
          joy: 0.85,
          enthusiasm: 0.92,
          interest: 0.78
        }
      },
      memoryStrength: 0.8,
      memoryConnections: ['msg2', 'msg4'],
      emotionalImpact: 0.75
    },
    {
      role: 'assistant',
      content: 'I\'m doing great, thanks for asking! How can I help you today?',
      timestamp: '2025-01-04T08:30:05Z',
      metadata: {
        prosody: {
          joy: 0.9,
          enthusiasm: 0.95,
          interest: 0.85
        }
      },
      memoryStrength: 0.7,
      memoryConnections: ['msg1', 'msg3'],
      emotionalImpact: 0.8
    },
    {
      role: 'user',
      content: 'I\'m working on a new project and need some advice.',
      timestamp: '2025-01-04T08:30:15Z',
      metadata: {
        prosody: {
          interest: 0.7,
          concentration: 0.8,
          determination: 0.75
        }
      },
      memoryStrength: 0.9,
      memoryConnections: ['msg2', 'msg5'],
      emotionalImpact: 0.9
    },
    {
      role: 'assistant',
      content: 'Of course! I\'d be happy to help. What kind of project are you working on?',
      timestamp: '2025-01-04T08:30:20Z',
      metadata: {
        prosody: {
          interest: 0.88,
          enthusiasm: 0.93,
          excitement: 0.82
        }
      },
      memoryStrength: 0.8,
      memoryConnections: ['msg1', 'msg3'],
      emotionalImpact: 0.85
    },
    {
      role: 'user',
      content: 'It\'s a React application with Next.js. I\'m trying to implement real-time features.',
      timestamp: '2025-01-04T08:30:30Z',
      metadata: {
        prosody: {
          concentration: 0.65,
          determination: 0.75,
          interest: 0.7
        }
      },
      memoryStrength: 0.85,
      memoryConnections: ['msg2', 'msg4'],
      emotionalImpact: 0.8
    },
    {
      role: 'assistant',
      content: 'That\'s interesting! For real-time features, you might want to consider using WebSockets or Server-Sent Events. Have you looked into those?',
      timestamp: '2025-01-04T08:30:35Z',
      metadata: {
        prosody: {
          interest: 0.85,
          enthusiasm: 0.9,
          excitement: 0.8
        }
      },
      memoryStrength: 0.7,
      memoryConnections: ['msg1', 'msg3'],
      emotionalImpact: 0.85
    },
    {
      role: 'user',
      content: 'Not yet, but I\'ve heard about Socket.io. Would that be a good choice?',
      timestamp: '2025-01-04T08:30:45Z',
      metadata: {
        prosody: {
          interest: 0.72,
          curiosity: 0.78,
          contemplation: 0.73
        }
      },
      memoryStrength: 0.8,
      memoryConnections: ['msg2', 'msg4'],
      emotionalImpact: 0.8
    },
    {
      role: 'assistant',
      content: 'Yes, Socket.io is a great choice! It\'s well-documented and has good support for Next.js applications.',
      timestamp: '2025-01-04T08:30:50Z',
      metadata: {
        prosody: {
          joy: 0.92,
          enthusiasm: 0.95,
          satisfaction: 0.88
        }
      },
      memoryStrength: 0.9,
      memoryConnections: ['msg1', 'msg3'],
      emotionalImpact: 0.9
    },
    {
      role: 'user',
      content: 'Thanks! Do you have any example code I could look at?',
      timestamp: '2025-01-04T08:31:00Z',
      metadata: {
        prosody: {
          gratitude: 0.88,
          interest: 0.85,
          enthusiasm: 0.82
        }
      },
      memoryStrength: 0.85,
      memoryConnections: ['msg2', 'msg4'],
      emotionalImpact: 0.85
    },
    {
      role: 'assistant',
      content: 'I\'d be happy to share some examples with you. Let me prepare a simple demonstration of Socket.io with Next.js.',
      timestamp: '2025-01-04T08:31:05Z',
      metadata: {
        prosody: {
          joy: 0.9,
          enthusiasm: 0.93,
          interest: 0.87
        }
      },
      memoryStrength: 0.8,
      memoryConnections: ['msg1', 'msg3'],
      emotionalImpact: 0.85
    }
  ]);

  // Memory Network Visualization
  useEffect(() => {
    if (!showNetwork || !networkRef.current) return;

    const width = networkRef.current.clientWidth;
    const height = 300;

    // Clear previous SVG
    d3.select(networkRef.current).selectAll("*").remove();

    const svg = d3.select(networkRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create memory nodes and links
    const nodes = messages.map((msg, i) => ({
      id: `msg${i}`,
      group: msg.role === 'user' ? 1 : 2,
      value: msg.memoryStrength,
      label: msg.content.substring(0, 20) + '...'
    }));

    const links = messages.flatMap((msg, i) => 
      msg.memoryConnections.map(target => ({
        source: `msg${i}`,
        target,
        value: msg.emotionalImpact
      }))
    );

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-50))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Draw nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => 5 + d.value * 10)
      .attr("fill", d => d.group === 1 ? "#ff9500" : "#00b4d8")
      .call(drag(simulation));

    // Add labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.label)
      .attr("font-size", "8px")
      .attr("dx", 12)
      .attr("dy", ".35em");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
  }, [showNetwork, messages]);

  // Drag handler for network nodes
  const drag = (simulation) => {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  const formatTime = (timestamp: string) => {
    try {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) return '';
      
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Memory Timeline */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 100 }}
            exit={{ height: 0 }}
            className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b"
          >
            <div className="absolute inset-0 flex items-center">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    left: `${(i / messages.length) * 100}%`
                  }}
                >
                  <div 
                    className={cn(
                      "w-3 h-3 rounded-full cursor-pointer transform hover:scale-150 transition-transform",
                      msg.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                    )}
                    style={{
                      filter: `brightness(${100 + msg.emotionalImpact * 100}%)`
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Network */}
      <AnimatePresence>
        {showNetwork && (
          <motion.div
            ref={networkRef}
            initial={{ height: 0 }}
            animate={{ height: 300 }}
            exit={{ height: 0 }}
            className="relative overflow-hidden bg-black/90"
          />
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={`message-${index}-${msg.timestamp}`}
                style={{
                  width: '80%',
                  marginLeft: msg.role === "user" ? "auto" : undefined,
                  marginRight: msg.role === "user" ? undefined : "auto"
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                layout
                className="group relative"
                onHoverStart={() => setActiveMessage(`msg${index}`)}
                onHoverEnd={() => setActiveMessage(null)}
              >
                {/* Memory Aura */}
                <motion.div
                  className="absolute -inset-4 rounded-xl opacity-0 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle, rgba(${msg.emotionalImpact * 255}, 150, 255, 0.2) 0%, transparent 70%)`
                  }}
                  animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />

                <div
                  className={cn(
                    "rounded-lg border bg-card p-4 relative overflow-hidden",
                    msg.role === "user" ? "rounded-br-none" : "rounded-bl-none"
                  )}
                >
                  {/* Interactive Memory Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: Math.floor(msg.memoryStrength * 10) }).map((_, i) => {
                      // Use fixed precision for deterministic values
                      const angle = (i / (msg.memoryStrength * 10)) * Math.PI * 2;
                      const radius = 50;
                      const x = Number((Math.cos(angle) * radius).toFixed(3));
                      const y = Number((Math.sin(angle) * radius).toFixed(3));
                      
                      return (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-blue-500 rounded-full"
                          initial={{ opacity: 0, x: 0, y: 0 }}
                          animate={{
                            opacity: [0, 0.5, 0],
                            x: [0, x],
                            y: [0, y]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "linear"
                          }}
                          style={{
                            opacity: 0,
                            transform: `translateX(${x}px) translateY(${y}px)`
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Message Content */}
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-xs capitalize font-medium leading-none opacity-50">
                          {msg.role}
                        </div>
                        <motion.div
                          className="flex items-center gap-1"
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <Sparkles 
                            className="h-3 w-3 text-blue-500"
                            style={{
                              opacity: msg.memoryStrength
                            }}
                          />
                          <Zap 
                            className="h-3 w-3 text-yellow-500"
                            style={{
                              opacity: msg.emotionalImpact
                            }}
                          />
                        </motion.div>
                      </div>
                      <div className="text-xs opacity-50">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>

                    <div className="break-words whitespace-pre-wrap">{msg.content}</div>

                    {/* Interactive Footer */}
                    <div className="mt-2 flex items-center justify-between">
                      <Expressions values={msg.metadata.prosody} />
                      
                      {/* Memory Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 hover:bg-blue-100 rounded-full"
                          onClick={() => setShowNetwork(!showNetwork)}
                        >
                          <Network className="h-4 w-4 text-blue-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 hover:bg-purple-100 rounded-full"
                          onClick={() => setShowTimeline(!showTimeline)}
                        >
                          <Share className="h-4 w-4 text-purple-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className={cn(
                            "p-1 rounded-full",
                            msg.bookmarked ? "bg-yellow-100" : "hover:bg-yellow-100"
                          )}
                        >
                          <Bookmark 
                            className={cn(
                              "h-4 w-4",
                              msg.bookmarked ? "text-yellow-500" : "text-gray-400"
                            )}
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}