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
  const [isLoading, setIsLoading] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new results come in
  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testResults]);

  // Capture console.log for test results
  useEffect(() => {
    const oldLog = console.log;
    console.log = (...args) => {
      setTestResults(prev => [...prev, args.join(' ')]);
      oldLog.apply(console, args);
    };
    return () => {
      console.log = oldLog;
    };
  }, []);

  const runMigration = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const results = await migrateLocalStorageToSupabase(supabase, user.id);
      setMigrationResults(results);
      console.log('Migration completed:', results);
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
    setTestResults([]);
    try {
      await testRAG(supabase, user.id);
    } catch (error: any) {
      console.error('Tests failed:', error?.message || error);
      setTestResults(prev => [...prev, `Error: ${error?.message || 'Tests failed'}`]);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 p-4 shadow">
        <h1 className="text-2xl font-bold mb-4">RAG Testing Page</h1>
        
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Scrollable Results Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* Migration Results Section - Always visible */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Migration Results</h2>
            </div>
            <div className="p-4">
              {migrationResults?.error ? (
                <div className="space-y-2">
                  <div className="text-red-500">{migrationResults.error}</div>
                  {migrationResults.details && (
                    <pre className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                      {migrationResults.details}
                    </pre>
                  )}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded overflow-auto max-h-48">
                  {JSON.stringify(migrationResults, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Test Results Section - Always visible */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Test Results</h2>
            </div>
            <div className="p-4">
              {testResults.length > 0 ? (
                <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {testResults.join('\n')}
                </pre>
              ) : (
                <div className="text-gray-500 italic">No test results yet. Click "Run RAG Tests" to start testing.</div>
              )}
            </div>
          </div>
          
          {/* Invisible element for auto-scrolling */}
          <div ref={resultsEndRef} />
        </div>
      </div>
    </div>
  );
}
