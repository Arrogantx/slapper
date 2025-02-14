'use client';

import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { ThemeProvider } from 'next-themes';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [avalanche, avalancheFuji],
  [publicProvider()]
);

// Core Wallet Connector
const coreWalletConnector = new InjectedConnector({
  chains,
  options: {
    name: (detectedName) =>
      detectedName === 'Core Wallet' ? 'Core Wallet' : 'Core',
    shimDisconnect: true,
    getProvider: () => {
      if (typeof window === "undefined") return null; // Prevents SSR crash
    
      const provider = (window as any).avalanche?.provider || (window as any).ethereum;
      if (provider?.isAvalanche || provider?.isCoreWallet) return provider;
    
      return null;
    },
    
  },
});

const config = createConfig({
  autoConnect: true,
  connectors: [
    coreWalletConnector,
    new MetaMaskConnector({ 
      chains,
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
        showQrModal: true,
        metadata: {
          name: 'AvaxSlap',
          description: 'Web3 PvP Slap Battles on Avalanche',
          url: 'https://avaxslap.com',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        },
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </WagmiConfig>
  );
}