'use client';

import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';
import { ThemeProvider } from 'next-themes';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7ec549fb27241f9276063e001f9b482c';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [avalanche, avalancheFuji],
  [publicProvider()]
);

const connectors = [
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
      metadata: {
        name: 'AvaxSlap',
        description: 'Web3 PvP Slap Battles on Avalanche',
        url: 'https://avaxslap.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    },
  }),
];

const config = createConfig({
  autoConnect: true,
  connectors,
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