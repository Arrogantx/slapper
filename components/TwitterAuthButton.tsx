'use client';

import { Button } from '@/components/ui/button';
import { Twitter } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export function TwitterAuthButton() {
  const { address } = useAccount();
  const { toast } = useToast();

  const handleTwitterAuth = async () => {
    if (!address) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/api/auth/twitter/callback`,
          queryParams: {
            wallet_address: address,
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      toast({
        title: 'Authentication Error',
        description: 'Failed to connect with Twitter',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleTwitterAuth}
      className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
    >
      <Twitter className="w-4 h-4 mr-2" />
      Connect with Twitter
    </Button>
  );
}