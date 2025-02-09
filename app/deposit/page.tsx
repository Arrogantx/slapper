'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseEther } from 'viem';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DepositPage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: balance } = useBalance({
    address,
  });

  useEffect(() => {
    if (address) {
      checkApprovalStatus();
    }
  }, [address]);

  const checkApprovalStatus = async () => {
    if (!address) return;

    const { data } = await supabase
      .from('presale_requests')
      .select('status')
      .eq('wallet_address', address)
      .eq('status', 'approved')
      .single();

    setIsApproved(!!data);
    setIsLoading(false);
  };

  const handleDeposit = async () => {
    if (!address || !amount) return;

    // Here you would typically handle the actual deposit transaction
    // For now, we'll just show a success message
    toast({
      title: 'Deposit Successful',
      description: `Deposited ${amount} AVAX`,
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
          <p className="text-gray-400">Connect your wallet to access the deposit page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center text-white">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Your presale request needs to be approved first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white pt-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
        >
          <div className="text-center mb-8">
            <Coins className="w-16 h-16 text-[#E84142] mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#E84142] to-pink-500 text-transparent bg-clip-text">
              Deposit AVAX
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (AVAX)
              </label>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-900/50 border-gray-700"
              />
              <p className="text-sm text-gray-400 mt-2">
                Balance: {balance?.formatted} {balance?.symbol}
              </p>
            </div>

            <Button
              className="w-full bg-[#E84142] hover:bg-[#d13a3b]"
              onClick={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Deposit
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}