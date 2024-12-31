'use client';

import { useEffect, useRef, useState } from 'react';

export default function TestSSE() {
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  const connectSSE = () => {
    if (sseRef.current) {
      sseRef.current.close();
    }

    const sse = new EventSource('/api/sse', {
      withCredentials: true
    });
    sseRef.current = sse;

    sse.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    sse.onmessage = (event) => {
      if (event.data === '[DONE]') {
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') {
          setIsConnected(true);
          return;
        }
        if (data.type === 'error') {
          setError(data.error);
          return;
        }
        if (data.choices?.[0]?.delta?.content) {
          setResponse(prev => prev + data.choices[0].delta.content);
        }
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
        setError('Failed to parse server response');
      }
    };

    sse.onerror = (error) => {
      console.error('SSE Error:', error);
      setError('Connection error occurred');
      setIsConnected(false);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (sseRef.current === sse) { // Only reconnect if this is still the current connection
          connectSSE();
        }
      }, 3000);
    };
  };

  const sendMessage = async () => {
    const messages = [
      {
        role: "user",
        content: "Hello, how are you?"
      }
    ];

    // Reset state
    setResponse('');
    setError(null);

    // Ensure SSE connection is active
    if (!isConnected) {
      connectSSE();
    }

    // Send the message
    try {
      const response = await fetch('/api/sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUME_API_KEY}`
        },
        credentials: 'include',
        body: JSON.stringify({ messages })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Failed to send message');
      console.error('Failed to send message:', error);
    }
  };

  // Setup SSE connection on mount
  useEffect(() => {
    connectSSE();
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">SSE Test</h1>
      <div className="mb-4">
        Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <button 
        onClick={sendMessage}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Send Test Message
      </button>
      <div className="whitespace-pre-wrap border p-4 rounded min-h-[200px]">
        {response}
      </div>
    </div>
  );
}
