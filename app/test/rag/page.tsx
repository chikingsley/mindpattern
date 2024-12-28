'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/utils/supabase';
import { migrateLocalStorageToSupabase } from '@/utils/migrateLocalStorage';
import { testRAG, insertDummyData } from '@/utils/testRAG';

export default function TestRAGPage() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [migrationResults, setMigrationResults] = useState<any>({ success: true, migratedCount: 0 });
  const [testResults, setTestResults] = useState<string[]>([]);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new results come in
  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testResults, migrationLogs]);

  // Capture console output for results
  useEffect(() => {
    const oldLog = console.log;
    const oldError = console.error;
    
    const handleConsoleOutput = (args: any[], type: 'log' | 'error') => {
      const message = args.join(' ');
      const formattedMessage = type === 'error' ? `Error: ${message}` : message;
      
      // Skip raw JSON output
      if (message.startsWith('{') || message.startsWith('[')) {
        return;
      }

      // Route to migration logs if it's a migration-related message
      const isMigrationLog = 
        message.includes('Migration') || 
        message.includes('Processing session') ||
        message.includes('Successfully migrated') ||
        message.includes('Failed to migrate');
      
      if (isMigrationLog) {
        setMigrationLogs(prev => [...prev, formattedMessage]);
      } else if (!message.includes('Processing') && !message.includes('migrated')) {
        // Show all output except processing/migration messages
        setTestResults(prev => [...prev, formattedMessage]);
      }
    };

    console.log = (...args) => {
      handleConsoleOutput(args, 'log');
      oldLog.apply(console, args);
    };

    console.error = (...args) => {
      handleConsoleOutput(args, 'error');
      oldError.apply(console, args);
    };

    return () => {
      console.log = oldLog;
      console.error = oldError;
    };
  }, []);

  const runMigration = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setMigrationLogs([]);  // Clear previous migration logs
    try {
      const results = await migrateLocalStorageToSupabase(supabase, user.id);
      setMigrationResults(results);
    } catch (error: any) {
      console.error('Migration failed:', error?.message || error);
      setMigrationResults({ 
        success: false, 
        error: error?.message || 'Migration failed',
        details: error?.details || error?.toString()
      });
    }
    setIsLoading(false);
  };

  const runTests = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setTestResults([]);  // Clear previous test results
    try {
      console.log('Running RAG tests...');
      await testRAG(supabase, user.id);
    } catch (error: any) {
      console.error('Tests failed:', error?.message || error);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setMigrationLogs([]);
    setMigrationResults({ success: true, migratedCount: 0 });
  };

  const insertDummyDataHandler = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setTestResults([]);
    try {
      const result = await insertDummyData(supabase, user.id);
      console.log(`Successfully inserted ${result.count} dummy messages`);
      console.log(`Session ID: ${result.sessionId}`);
    } catch (error: any) {
      console.error('Failed to insert dummy data:', error?.message || error);
      setTestResults(prev => [...prev, `Error: ${error?.message || 'Failed to insert dummy data'}`]);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full overflow-auto bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4">
          {/* Migration Results Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Migration Results</h2>
            </div>
            <div className="p-4">
              {migrationLogs.length > 0 && (
                <div className="mt-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded overflow-auto max-h-48">
                    {migrationLogs.join('\n')}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* RAG Test Results Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">RAG Test Results</h2>
            </div>
            <div className="p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded overflow-auto max-h-48">
                {testResults.join('\n')}
              </pre>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={runMigration}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Running...' : 'Migrate Local Storage'}
          </button>
          
          <button
            onClick={insertDummyDataHandler}
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Inserting...' : 'Insert Dummy Data'}
          </button>
          
          <button
            onClick={runTests}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Running...' : 'Run RAG Tests'}
          </button>

          <button
            onClick={clearResults}
            disabled={isLoading}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Results
          </button>
        </div>
        <div ref={resultsEndRef} />
      </div>
    </div>
  );
}
