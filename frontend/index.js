// React
import React from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';

// NEAR

import { Wallet } from './near-wallet';
import { WordleInterface } from './wordle-interface';


// When creating the wallet you can choose to create an access key, so the user
// can skip signing non-payable methods when talking wth the  contract
const wallet = new Wallet({ createAccessKeyFor: process.env.CONTRACT_NAME })

// Abstract the logic of interacting with the contract to simplify your flow
// const guestBook = new GuestBook({ contractId: process.env.CONTRACT_NAME, walletToUse: wallet });
const wordleInterface = new WordleInterface({
  contractId: process.env.CONTRACT_NAME,
  walletToUse: wallet
})

// Setup on page load
window.onload = async () => {
  const isSignedIn = await wallet.startUp()
  const container = document.getElementById('root')
  const root = createRoot(container)

  root.render(
    // <App isSignedIn={isSignedIn} guestBook={guestBook} wallet={wallet} />,
    <App isSignedIn={isSignedIn} wordleInterface={wordleInterface} wallet={wallet} />
  );
}