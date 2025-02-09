'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Hand, Shield } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function Navigation() {
  const { address } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (address) {
      checkAdminStatus();
    }
  }, [address]);

  const checkAdminStatus = async () => {
    if (!address) return;

    const { data } = await supabase
      .from('admin_addresses')
      .select()
      .eq('address', address)
      .single();

    setIsAdmin(!!data);
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed w-full z-50 backdrop-blur-md bg-black/30 border-b border-gray-800/50"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Hand size={32} className="text-[#E84142]" />
          <span className="text-xl font-bold bg-gradient-to-r from-[#E84142] to-pink-500 text-transparent bg-clip-text">
            AvaxSlap
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link 
            href="/presale"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Presale
          </Link>
          {isAdmin && (
            <Link 
              href="/admin"
              className="flex items-center space-x-1 text-[#E84142] hover:text-[#d13a3b] transition-colors"
            >
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}