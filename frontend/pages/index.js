import Head from "next/head";
import { BigNumber,providers } from "ethers";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const web3ModalRef = useRef();

  // / Get Provider or Signer
  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      alert("Please Switch to Rinkeby Network");
      throw new Error("Incorrect Network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return provider; // return provider if not need signer
  };

  // Connect Wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setwalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <>
      <div>
        <Head>
          <title>Crypto Devs</title>
          <meta name="description" content="ICO-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
        
        {walletConnected ? 
        (
          <div> 
            <div className={styles.description}>
              Sor Far {tokensMinted}/1000 Minted
            </div>
           </div>
        ) : (
          <button onClick={connectWallet} className={styles.button}>
           Connect Wallet
          </button>
        )}
        </div>
      </div>
    </>
  );
}
