'use client';

import { motion } from 'framer-motion';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { Hand, Twitter, Trophy, ChartBar, Coins, Gamepad2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { avalanche } from 'wagmi/chains';

const features = [
  { icon: Gamepad2, title: 'PvP Slap Battles', description: 'Challenge other players to epic slap battles' },
  { icon: Twitter, title: 'Twitter Integration', description: 'Connect your Twitter account to verify Web3 personalities' },
  { icon: ChartBar, title: 'Battle Statistics', description: 'Track your wins, losses, and performance' },
  { icon: Trophy, title: 'Leaderboards', description: 'Compete for the top position on global rankings' },
  { icon: Coins, title: 'Token Rewards', description: 'Earn rewards for winning battles' },
  { icon: Shield, title: 'Secure Battles', description: 'Fair and transparent battles powered by blockchain' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = async (connector: 'metamask' | 'walletconnect') => {
    try {
      if (isConnected) {
        await disconnect();
        return;
      }

      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7ec549fb27241f9276063e001f9b482c';
      
      const selectedConnector = connector === 'metamask' 
        ? new MetaMaskConnector({
            chains: [avalanche],
            options: {
              shimDisconnect: true,
              UNSTABLE_shimOnConnectSelectAccount: true,
            },
          })
        : new WalletConnectConnector({
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

      await connect({ connector: selectedConnector });
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Navigation Bar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed w-full z-50 backdrop-blur-md bg-black/30 border-b border-gray-800/50"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-2"
          >
            <Hand size={32} className="text-[#E84142]" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#E84142] to-pink-500 text-transparent bg-clip-text">
              AvaxSlap
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-4"
          >
            {!isConnected ? (
              <>
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
          </motion.div>
        </div>
      </motion.nav>

      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Hero Section */}
          <div className="relative mb-16">
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1 }}
            >
              <Hand size={400} className="text-[#E84142]" />
            </motion.div>
            
            <div className="relative">
              <div className="flex justify-center mb-8">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Hand size={64} className="text-[#E84142]" />
                </motion.div>
              </div>

              <motion.h1
                className="text-7xl font-bold mb-4 bg-gradient-to-r from-[#E84142] via-pink-500 to-[#E84142] text-transparent bg-clip-text"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                AvaxSlap
              </motion.h1>

              <motion.div
                className="text-2xl mb-12 text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Challenge Web3 personalities to epic slap battles!
              </motion.div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#E84142]/10 to-transparent blur-3xl -z-10" />
            
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold inline-block bg-gradient-to-r from-[#E84142] to-pink-500 text-transparent bg-clip-text">
                Coming Soon
              </h2>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-[#E84142]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#E84142]/20"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <feature.icon className="w-6 h-6 text-[#E84142] group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="border-t border-gray-800/50 backdrop-blur-md bg-black/30"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2">
              <Hand size={20} className="text-[#E84142]" />
              <span className="text-sm font-medium text-gray-400">Powered by Avalanche</span>
            </div>
            <p className="text-sm text-gray-500">© 2025 AvaxSlap. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}