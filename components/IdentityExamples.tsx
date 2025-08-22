"use client";

import React from 'react';
import { Name, IdentityCard } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import { useBasename } from '../lib/basename-resolver';

export function IdentityExamples() {
  const testAddress = '0x02feeb0AdE57b6adEEdE5A4EEea6Cf8c21BeB6B1';
  const { basename, isLoading } = useBasename(testAddress);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-4">OnchainKit Identity Integration Examples</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hook-based approach */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Hook-based Approach (useBasename)</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">Original Address:</div>
            <code className="block p-2 bg-white rounded text-xs font-mono break-all">
              {testAddress}
            </code>
            <div className="text-sm text-gray-600">Resolved Identity:</div>
            <div className="p-2 bg-white rounded font-mono">
              {isLoading ? 'Loading...' : basename}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Use this when you need programmatic access to the resolved name for custom logic or styling.
            </div>
          </div>
        </div>

        {/* Component-based approach */}
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Component-based Approach</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">Simple Name Display:</div>
            <div className="p-2 bg-white rounded">
              <Name address={testAddress as `0x${string}`} chain={base} />
            </div>
            <div className="text-sm text-gray-600">Full Identity Card:</div>
            <div className="p-2 bg-white rounded">
              <IdentityCard
                address={testAddress as `0x${string}`}
                chain={base}
                schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                className="max-w-full"
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Use these components for rich identity displays with built-in avatars and verification badges.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">Integration Options:</h4>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <h5 className="font-medium text-green-800">For Simple Displays:</h5>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">{`import { Name } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

<Name address={userAddress} chain={base} />`}</pre>
          </div>
          <div>
            <h5 className="font-medium text-green-800">For Custom Logic:</h5>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">{`import { useBasename } from '../lib/basename-resolver';

const { basename, isLoading } = useBasename(address);
// Use basename in your custom component logic`}</pre>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">Migration from Custom Resolver:</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>• Your existing <code>useBasename</code> hook continues to work with OnchainKits backend</p>
          <p>• Replace custom API calls with OnchainKit components for better reliability</p>
          <p>• Add attestation badges and avatars using <code>IdentityCard</code> component</p>
          <p>• No breaking changes - existing code remains functional</p>
        </div>
      </div>
    </div>
  );
}
