"use client";

import React from 'react';
import { Name } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import { useBasename } from '../lib/basename-resolver';

export function BasenameDebugger() {
  // Test addresses - some with known basenames/ENS names, some without
  const testAddresses = [
    {
      address: '0x02feeb0AdE57b6adEEdE5A4EEea6Cf8c21BeB6B1',
      description: 'Test address from OnchainKit docs (has basename)'
    },
    {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      description: 'vitalik.eth - Known ENS address'
    },
    {
      address: '0x4338c5b43a506b2cda1fe09d019e55934cac61e0',
      description: 'Address from HTML test file'
    },
    {
      address: '0xe2d858b3d24787f4af64bbc1380dbf34386274d9',
      description: 'Another test address'
    },
    {
      address: '0x015b5df1673499e32d11cf786a43d1c42b3d725c',
      description: 'Third test address'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Basename Resolution Debugger</h2>
        <p className="text-sm text-blue-800">
          This page tests basename resolution using both the custom hook and OnchainKit components directly.
          If basenames aren&apos;t showing, check the OnchainKit API key configuration.
        </p>
      </div>

      <div className="space-y-6">
        {testAddresses.map((test, index) => (
          <BasenameTestRow key={test.address} {...test} index={index + 1} />
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Configuration Check:</h3>
        <div className="text-sm space-y-1">
          <div>OnchainKit API Key: {process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ? '✅ Set' : '❌ Missing'}</div>
          <div>Chain: Base ({base.id})</div>
          <div>Chain Name: {base.name}</div>
        </div>
      </div>
    </div>
  );
}

function BasenameTestRow({ address, description, index }: { address: string; description: string; index: number }) {
  const { basename, isLoading, error, resolvedBasename, resolvedENS } = useBasename(address);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="space-y-4">
        {/* Address Info */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Test #{index}: {description}</h4>
          <code className="text-xs bg-gray-100 p-2 rounded block break-all">
            {address}
          </code>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Custom Hook Result */}
          <div>
            <h5 className="font-medium text-sm mb-2">Enhanced Hook (useBasename)</h5>
            <div className="space-y-1">
              <div className="text-sm">
                <strong>Final Result:</strong> {isLoading ? '⏳ Loading...' : basename}
              </div>
              <div className="text-xs text-gray-600">
                <strong>Basename (.base.eth):</strong> {resolvedBasename || 'None'}
              </div>
              <div className="text-xs text-gray-600">
                <strong>ENS (.eth):</strong> {resolvedENS || 'None'}
              </div>
              <div className="text-xs text-gray-600">
                <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
              </div>
              {error && (
                <div className="text-xs text-red-600">
                  <strong>Error:</strong> {error.message || 'Unknown error'}
                </div>
              )}
            </div>
          </div>

          {/* OnchainKit Component */}
          <div>
            <h5 className="font-medium text-sm mb-2">OnchainKit Name Component (Base Chain)</h5>
            <div className="p-2 bg-gray-50 rounded">
              <Name 
                address={address as `0x${string}`} 
                chain={base}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
