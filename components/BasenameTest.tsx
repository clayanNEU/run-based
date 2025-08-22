"use client";

import React from 'react';
import { Name, IdentityCard } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

export function BasenameTest() {
  // Test addresses from the HTML test file
  const testAddresses = [
    '0x4338c5b43a506b2cda1fe09d019e55934cac61e0',
    '0xe2d858b3d24787f4af64bbc1380dbf34386274d9',
    '0x015b5df1673499e32d11cf786a43d1c42b3d725c'
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-4">OnchainKit Identity Components Test</h2>

      <div>
        <h3 className="text-xl font-semibold mb-4">Name Component (Simple)</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testAddresses.map((address) => (
            <div key={address} className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2 truncate">Address: {address}</div>
              <div className="text-lg">
                <Name address={address as `0x${string}`} chain={base} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">IdentityCard Component (Full Featured)</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {testAddresses.slice(0, 2).map((address) => (
            <div key={address} className="border rounded-lg p-4 bg-white">
              <IdentityCard
                address={address as `0x${string}`}
                chain={base}
                schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                badgeTooltip="Base Ecosystem Verified"
                className="max-w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Integration Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Name component provides simple name resolution with fallback to truncated address</li>
          <li>• IdentityCard offers comprehensive identity display with avatars and attestation badges</li>
          <li>• Both components work seamlessly with Base chain and handle loading/error states automatically</li>
          <li>• Components are fully customizable with className and styling options</li>
        </ul>
      </div>
    </div>
  );
}
