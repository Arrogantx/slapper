'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { useConnect, useDisconnect } from 'wagmi';
import { avalanche } from 'wagmi/chains';
import { supabase } from '@/lib/supabase';

export function Navigation() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (address) {
      checkAdminStatus();
    }
  }, [address]);

  const checkAdminStatus = async () => {
    if (!address) return;
    
    try {
      const { data, error } = await supabase.rpc("is_admin", {
        user_wallet: address.toLowerCase(),
      });
  
      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Admin check failed:', error);
      setIsAdmin(false);
    }
  };

  const handleConnect = async () => {
    try {
      if (isConnected) {
        await disconnect();
        return;
      }

      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7ec549fb27241f9276063e001f9b482c';
      
      const connector = new WalletConnectConnector({
        chains: [avalanche],
        options: {
          projectId,
          metadata: {
            name: 'AvaxSlap',
            description: 'Web3 PvP Slap Battles on Avalanche',
            url: 'https://avaxslap.com',
            icons: ['https://avatars.githubusercontent.com/u/37784886'],
          },
        },
      });

      await connect({ connector });
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Presale', href: '/presale', requiresAuth: true },
    { name: 'Deposit', href: '/deposit', requiresAuth: true },
    { name: 'Admin', href: '/admin', requiresAdmin: true },
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

            <div className="hidden md:flex space-x-4">
              {navigation.map((item) => {
                // Skip admin link if user is not admin
                if (item.requiresAdmin && !isAdmin) return null;
                // Skip auth-required links if not connected
                if (item.requiresAuth && !isConnected) return null;
                
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#E84142]/10 text-[#E84142]'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                className="bg-gradient-to-r from-[#E84142] to-[#ff6b6b] hover:from-[#d13a3b] hover:to-[#e95f5f] text-white shadow-lg shadow-red-500/20 border border-red-500/20"
              >
                Connect Wallet
              </Button>
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