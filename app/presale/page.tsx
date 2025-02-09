'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Hand, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PresalePage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [twitterHandle, setTwitterHandle] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      checkRequestStatus();
    }
  }, [address]);

  const checkRequestStatus = async () => {
    if (!address) return;

    const { data, error } = await supabase
      .from('presale_requests')
      .select('status')
      .eq('wallet_address', address)
      .single();

    if (data) {
      setRequestStatus(data.status);
    }
  };

  const handleJoinPresale = async () => {
    if (!address || !twitterHandle) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('presale_requests')
        .insert([
          {
            wallet_address: address,
            twitter_handle: twitterHandle,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Request Submitted',
        description: 'Your presale request has been submitted for review.',
      });
      
      setRequestStatus('pending');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please connect your wallet</h1>
          <p className="text-gray-400">Connect your wallet to access the presale.</p>
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
            <Hand className="w-16 h-16 text-[#E84142] mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#E84142] to-pink-500 text-transparent bg-clip-text">
              Join the Presale
            </h1>
          </div>

          {requestStatus === 'approved' ? (
            <div className="text-center">
              <p className="text-green-400 mb-4">Your request has been approved!</p>
              <Button
                className="w-full bg-[#E84142] hover:bg-[#d13a3b]"
                onClick={() => window.location.href = '/deposit'}
              >
                Go to Deposit Page
              </Button>
            </div>
          ) : requestStatus === 'denied' ? (
            <div className="text-center">
              <p className="text-red-400">Your request has been denied.</p>
            </div>
          ) : requestStatus === 'pending' ? (
            <div className="text-center">
              <p className="text-yellow-400">Your request is pending approval.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter Handle
                </label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="@username"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-[#E84142] hover:bg-[#d13a3b]"
                onClick={handleJoinPresale}
                disabled={isLoading || !twitterHandle}
              >
                {isLoading ? 'Submitting...' : 'Request to Join Presale'}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}