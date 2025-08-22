"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { sendTipWithSponsorship, getPaymasterStatus } from "../lib/blockchain-store";
import { getUSDCAllowance, getUSDCBalance, approveUSDC } from "../lib/blockchain-store";

interface TipButtonProps {
  recipientAddress: string;
  recipientName?: string;
}

// Preset tip amounts in USDC
const PRESET_AMOUNTS = [
  { label: "🍬 $1 Candy", amount: "1", emoji: "🍬" },
  { label: "☕ $3 Coffee", amount: "3", emoji: "☕" },
  { label: "🍕 $5 Slice", amount: "5", emoji: "🍕" },
  { label: "🎉 $10 Cheers", amount: "10", emoji: "🎉" }
];

export default function TipButton({ recipientAddress, recipientName = "contributor" }: TipButtonProps) {
  const { address } = useAccount();
  const [amount, setAmount] = React.useState("3");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [approving, setApproving] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [paymasterStatus, setPaymasterStatus] = React.useState<{ available: boolean; walletSupported: boolean; configured: boolean } | null>(null);
  const [usdcAllowance, setUsdcAllowance] = React.useState<number>(0);
  const [usdcBalance, setUsdcBalance] = React.useState<number>(0);

  // Load paymaster status and USDC info when component mounts
  React.useEffect(() => {
    if (address) {
      Promise.all([
        getPaymasterStatus(),
        getUSDCAllowance(address),
        getUSDCBalance(address)
      ]).then(([paymaster, allowance, balance]) => {
        setPaymasterStatus(paymaster);
        setUsdcAllowance(allowance);
        setUsdcBalance(balance);
      });
    }
  }, [address]);

  const needsApproval = parseFloat(amount) > usdcAllowance;
  const hasInsufficientBalance = parseFloat(amount) > usdcBalance;

  async function handleApprove() {
    if (!address) return;

    setApproving(true);
    setToast("Approving USDC spending... 📝");

    try {
      // Approve a generous amount to avoid frequent approvals
      const approveAmount = Math.max(parseFloat(amount), 100).toString();
      await approveUSDC(approveAmount);
      
      // Refresh allowance
      const newAllowance = await getUSDCAllowance(address);
      setUsdcAllowance(newAllowance);
      
      setToast("USDC spending approved! ✅");
    } catch (error: unknown) {
      console.error('Approval failed:', error);
      let errorMessage = "Approval failed";
      
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message?: string; shortMessage?: string };
        if (err.message?.includes("User rejected")) {
          errorMessage = "Approval cancelled";
        } else if (err.shortMessage) {
          errorMessage = err.shortMessage;
        }
      }
      
      setToast(errorMessage);
    } finally {
      setApproving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

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

    if (hasInsufficientBalance) {
      setToast("Insufficient USDC balance");
      setTimeout(() => setToast(null), 2000);
      return;
    }

    if (needsApproval) {
      setToast("Please approve USDC spending first");
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
      setToast(`Tip sent! ${sponsorshipEmoji} $${amount} USDC to ${recipientName}`);
      
      // Refresh balances
      if (address) {
        const [newAllowance, newBalance] = await Promise.all([
          getUSDCAllowance(address),
          getUSDCBalance(address)
        ]);
        setUsdcAllowance(newAllowance);
        setUsdcBalance(newBalance);
      }
      
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

      {/* Preset Amount Buttons */}
      <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset.amount}
            onClick={() => setAmount(preset.amount)}
            disabled={loading || approving}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: amount === preset.amount ? "2px solid #007bff" : "1px solid #ddd",
              background: amount === preset.amount ? "#e7f3ff" : "white",
              color: amount === preset.amount ? "#007bff" : "#666",
              cursor: loading || approving ? "not-allowed" : "pointer",
              fontSize: 12,
              fontWeight: 500,
              flex: "1 1 auto",
              minWidth: "fit-content"
            }}
          >
            {preset.emoji} ${preset.amount}
          </button>
        ))}
      </div>
      
      {/* Custom Amount Input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input 
          style={{ 
            flex: 1, 
            padding: 8, 
            borderRadius: 4, 
            border: "1px solid #ddd",
            fontSize: 14
          }}
          placeholder="Custom amount (USDC)" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading || approving}
        />
        
        {needsApproval ? (
          <button 
            onClick={handleApprove}
            disabled={approving || hasInsufficientBalance}
            style={{ 
              padding: "8px 16px", 
              borderRadius: 4, 
              background: approving ? "#ccc" : hasInsufficientBalance ? "#ff6b6b" : "#28a745", 
              color: "white", 
              border: "none", 
              cursor: approving || hasInsufficientBalance ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap"
            }}
          >
            {approving ? "Approving..." : hasInsufficientBalance ? "No USDC" : "Approve"}
          </button>
        ) : (
          <button 
            onClick={handleTip}
            disabled={loading || hasInsufficientBalance}
            style={{ 
              padding: "8px 16px", 
              borderRadius: 4, 
              background: loading ? "#ccc" : hasInsufficientBalance ? "#ff6b6b" : "#007bff", 
              color: "white", 
              border: "none", 
              cursor: loading || hasInsufficientBalance ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap"
            }}
          >
            {loading ? "Sending..." : hasInsufficientBalance ? "No USDC" : "Tip"}
          </button>
        )}
      </div>
      
      {/* Message Input */}
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
        disabled={loading || approving}
      />

      {/* Balance Info */}
      {address && (
        <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          USDC Balance: ${usdcBalance.toFixed(2)} | Approved: ${usdcAllowance.toFixed(2)}
          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
            💡 Requires USDC on Base
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: 12, right: 12, padding: 14,
          background: "#111", color: "#fff", textAlign: "center", borderRadius: 12, zIndex: 50
        }}>{toast}</div>
      )}
    </div>
  );
}
