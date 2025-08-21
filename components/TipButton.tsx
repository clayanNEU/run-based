"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { sendTipWithSponsorship, getPaymasterStatus } from "../lib/blockchain-store";

interface TipButtonProps {
  recipientAddress: string;
  recipientName?: string;
}

export default function TipButton({ recipientAddress, recipientName = "contributor" }: TipButtonProps) {
  const { address } = useAccount();
  const [amount, setAmount] = React.useState("0.001");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [paymasterStatus, setPaymasterStatus] = React.useState<{ available: boolean; walletSupported: boolean; configured: boolean } | null>(null);

  // Load paymaster status when component mounts
  React.useEffect(() => {
    if (address) {
      getPaymasterStatus().then(setPaymasterStatus);
    }
  }, [address]);

  async function handleTip() {
    if (!address) {
      setToast("Please connect wallet");
      setTimeout(() => setToast(null), 2000);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setToast("Please enter a valid amount");
      setTimeout(() => setToast(null), 2000);
      return;
    }

    setLoading(true);
    
    try {
      // Check paymaster status and show appropriate message
      const currentPaymasterStatus = await getPaymasterStatus();
      setPaymasterStatus(currentPaymasterStatus);
      
      if (currentPaymasterStatus.available) {
        setToast("Sending gas-free tip... ⚡");
      } else {
        setToast("Sending tip... ⏳");
      }
      
      // Send tip with sponsorship attempt
      const result = await sendTipWithSponsorship(
        recipientAddress, 
        amount, 
        message || `Great contribution, ${recipientName}! 🏃‍♀️`
      );
      
      // Show appropriate success message based on sponsorship status
      const sponsorshipEmoji = result.sponsored ? "⚡" : "💙";
      setToast(`Tip sent! ${sponsorshipEmoji} ${amount} ETH to ${recipientName}`);
      
      // Show fallback reason if applicable
      if (!result.sponsored && result.fallbackReason) {
        setTimeout(() => {
          setToast(`ℹ️ ${result.fallbackReason}`);
          setTimeout(() => setToast(null), 3000);
        }, 2000);
      }
      
      setMessage("");
    } catch (error: unknown) {
      console.error('Tip failed:', error);
      let errorMessage = "Tip failed";
      
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message?: string; shortMessage?: string };
        if (err.message?.includes("User rejected")) {
          errorMessage = "Transaction cancelled";
        } else if (err.shortMessage) {
          errorMessage = err.shortMessage;
        }
      }
      
      setToast(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  if (!address) {
    return null; // Don't show tip button if wallet not connected
  }

  return (
    <div style={{ padding: 12, background: "#f0f8ff", borderRadius: 8, marginTop: 8 }}>
      <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 600 }}>
        💙 Appreciate {recipientName}
        {paymasterStatus?.available && (
          <span style={{ fontSize: 12, color: "#007bff", marginLeft: 8 }}>⚡ Gas-free</span>
        )}
      </div>
      
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input 
          style={{ 
            flex: 1, 
            padding: 8, 
            borderRadius: 4, 
            border: "1px solid #ddd",
            fontSize: 14
          }}
          placeholder="0.001 ETH" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <button 
          onClick={handleTip}
          disabled={loading}
          style={{ 
            padding: "8px 16px", 
            borderRadius: 4, 
            background: loading ? "#ccc" : "#007bff", 
            color: "white", 
            border: "none", 
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600
          }}
        >
          {loading ? "Sending..." : "Tip"}
        </button>
      </div>
      
      <input 
        style={{ 
          width: "100%", 
          padding: 8, 
          borderRadius: 4, 
          border: "1px solid #ddd",
          fontSize: 14
        }}
        placeholder="Great hosting today! 🏁"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
      />

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: 12, right: 12, padding: 14,
          background: "#111", color: "#fff", textAlign: "center", borderRadius: 12, zIndex: 50
        }}>{toast}</div>
      )}
    </div>
  );
}
