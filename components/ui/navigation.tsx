'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Hand } from 'lucide-react';
import { Button } from './button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export function Navigation() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  useEffect(() => {
    if (address && !isCheckingAdmin) {
      checkAdminStatus();
    } else if (!address) {
      setIsAdmin(null);
    }
  }, [address, isCheckingAdmin]);

  const checkAdminStatus = async () => {
    if (!address) return;
  
    try {
      setIsCheckingAdmin(true);
      const { data, error } = await supabase.rpc("is_admin", {
        user_wallet: address.toLowerCase(),
      });
  
      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Admin check failed:', error);
      setIsAdmin(false);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const handleConnect = async (connectorType: 'core' | 'metamask' | 'walletconnect') => {
    try {
      if (isConnected) {
        await disconnect();
        return;
      }
  
      const selectedConnector = connectors.find((c) => {
        if (connectorType === 'metamask' && c.id === 'metaMask') return true;
        if (connectorType === 'walletconnect' && c.id === 'walletConnect') return true;
        if (connectorType === 'core' && c.id === 'injected') return true;
        return false;
      });
  
      if (!selectedConnector) {
        throw new Error('Connector not found');
      }
  
      await connect({ connector: selectedConnector });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/presale', label: 'Presale' },
    { href: '/deposit', label: 'Deposit' },
    ...(isAdmin === true ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="fixed w-full z-50 backdrop-blur-md bg-black/30 border-b border-gray-800/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Hand size={32} className="text-[#E84142]" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#E84142] to-pink-500 text-transparent bg-clip-text">
                AvaxSlap
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-[#E84142]",
                    pathname === link.href
                      ? "text-[#E84142]"
                      : "text-gray-400"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <>
                <Button
                  onClick={() => handleConnect('core')}
                  className="bg-gradient-to-r from-[#E84142] to-[#ff6b6b] hover:from-[#d13a3b] hover:to-[#e95f5f] text-white shadow-lg shadow-red-500/20 border border-red-500/20"
                >
                  Connect Core
                </Button>
                <Button
                  onClick={() => handleConnect('metamask')}
                  className="bg-gradient-to-r from-[#E84142] to-[#ff6b6b] hover:from-[#d13a3b] hover:to-[#e95f5f] text-white shadow-lg shadow-red-500/20 border border-red-500/20"
                >
                  Connect MetaMask
                </Button>
                <Button
                  onClick={() => handleConnect('walletconnect')}
                  className="bg-gradient-to-r from-[#E84142] to-[#ff6b6b] hover:from-[#d13a3b] hover:to-[#e95f5f] text-white shadow-lg shadow-red-500/20 border border-red-500/20"
                >
                  WalletConnect
                </Button>
              </>
            ) : (
              <Button
                onClick={() => disconnect()}
                className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}