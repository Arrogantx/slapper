'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, Coins } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from './ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  message: string;
  created_at: string;
  wallet_address: string;
  user_profile: {
    nickname: string;
    twitter_username: string;
    wallet_address: string;
  };
}

interface UserProfile {
  nickname: string;
  twitter_username: string;
  wallet_address: string;
}

export function TrollBox() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          message,
          created_at,
          wallet_address,
          user_profile:user_profiles!chat_messages_wallet_address_fkey(
            nickname,
            twitter_username,
            wallet_address
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data.reverse());
    };

    fetchMessages();

    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, async (payload) => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            id,
            message,
            created_at,
            wallet_address,
            user_profile:user_profiles!chat_messages_wallet_address_fkey(
              nickname,
              twitter_username,
              wallet_address
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          setMessages(prev => [...prev, data]);
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!isConnected || !address || !newMessage.trim()) return;

    try {
      // First ensure user profile exists
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert([
          {
            wallet_address: address.toLowerCase(),
          }
        ], {
          onConflict: 'wallet_address'
        });

      if (profileError) throw profileError;

      // Then send the message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([
          {
            message: newMessage.trim(),
            wallet_address: address.toLowerCase()
          }
        ]);

      if (messageError) throw messageError;

      setNewMessage('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const handleUserClick = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setShowUserDialog(true);
  };

  const handleSendTip = async (amount: number) => {
    toast({
      title: 'Coming Soon',
      description: 'Tipping functionality will be available soon!'
    });
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 p-4 h-[500px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="text-[#E84142]" />
        <h2 className="text-xl font-bold text-white">TrollBox</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              <button
                onClick={() => handleUserClick(message.user_profile)}
                className="flex items-start gap-2 hover:bg-gray-700/30 p-2 rounded-lg transition-colors w-full text-left"
              >
                <div className="flex-shrink-0">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-[#E84142]">
                    {message.user_profile.nickname || message.user_profile.twitter_username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                  <p className="text-gray-200 break-words">{message.message}</p>
                </div>
              </button>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {isConnected ? (
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-gray-900/50 border-gray-700"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#E84142] hover:bg-[#d13a3b]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <p className="text-center text-gray-400">Connect wallet to chat</p>
      )}

      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="w-12 h-12 text-[#E84142]" />
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedUser.nickname || selectedUser.twitter_username || 'Anonymous'}
                  </h3>
                  {selectedUser.twitter_username && (
                    <p className="text-gray-400">@{selectedUser.twitter_username}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(`/profile/${selectedUser.wallet_address}`, '_blank')}
                  className="flex-1"
                >
                  View Profile
                </Button>
                <Button
                  onClick={() => handleSendTip(0.1)}
                  className="bg-[#E84142] hover:bg-[#d13a3b]"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Send Tip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}