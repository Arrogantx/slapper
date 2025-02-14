'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Hand, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Define a type for the link
type LinkType = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

export function Navigation() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [links, setLinks] = useState<LinkType[]>([
    { href: '/', label: 'Home' },
    { href: '/presale', label: 'Presale' },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (isConnected && address) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [isConnected, address]);

  const checkAdminStatus = async () => {
    if (!address) return;
    
    try {
      console.log('Checking admin status for address:', address.toLowerCase());
      const { data, error } = await supabase.rpc('is_admin', {
        user_wallet: address.toLowerCase()
      });
      
      if (error) {
        console.error('Admin check error:', error);
        throw error;
      }

      console.log('Admin check response:', data);
      setIsAdmin(!!data);

      if (data) {
        toast({
          title: 'Admin Access Granted',
          description: 'You have admin privileges.',
        });

        // Correct way to update state with functional setState
        setLinks(prevLinks => [
          ...prevLinks,
          { href: '/admin', label: 'Admin', icon: Shield },
        ]);
      }
    } catch (error) {
      console.error('Admin check failed:', error);
      setIsAdmin(false);
      toast({
        title: 'Admin Check Failed',
        description: 'Could not verify admin status.',
        variant: 'destructive',
      });
    }
  };

  console.log('Current links:', links); // Debug: Check the links array

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Hand size={32} className="text-[#E84142]" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#E84142] to-pink-500 text-transparent bg-clip-text">
                AvaxSlap
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center space-x-1 text-sm font-medium transition-colors",
                  pathname === href
                    ? "text-[#E84142]"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {Icon && <Icon size={16} className="mr-1" />}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
