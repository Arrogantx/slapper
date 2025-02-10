'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface PresaleRequest {
  id: string;
  wallet_address: string;
  twitter_handle: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [requests, setRequests] = useState<PresaleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    checkAdminStatus();
  }, [address]);

  const checkAdminStatus = async () => {
    if (!address) return;
  
    console.log("Checking admin status for address:", address.toLowerCase());
  
    try {
      const { data, error } = await supabase.rpc("is_admin", {
        user_wallet: address.toLowerCase(),
      });
  
      if (error) throw error;
  
      console.log("Admin status response:", data);
      setIsAdmin(!!data);
      if (data) fetchRequests(); // Only fetch requests if admin
    } catch (error) {
      console.error('Admin check failed:', error);
      setIsAdmin(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('presale_requests')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) throw error;
  
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch presale requests.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleRequest = async (id: string, status: 'approved' | 'denied') => {
    try {
      const { error } = await supabase
        .from('presale_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Request Updated',
        description: `Request has been ${status}.`,
      });

      fetchRequests();
    } catch (error) {
      console.error('Request update failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request.',
        variant: 'destructive',
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Please connect your wallet.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Checking Access...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Access Denied. You are not an admin.</p>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white pt-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-[#E84142] mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#E84142] to-pink-500 text-transparent bg-clip-text">
              Admin Dashboard
            </h1>
          </div>

          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center text-gray-400">No pending requests</div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Wallet Address</p>
                      <p className="font-mono">{request.wallet_address}</p>
                      <p className="text-sm text-gray-400 mt-2">Twitter Handle</p>
                      <p className="text-blue-400">{request.twitter_handle}</p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleRequest(request.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRequest(request.id, 'denied')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <div className={`px-3 py-1 rounded-full ${
                        request.status === 'approved' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}