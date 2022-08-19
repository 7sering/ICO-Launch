import Head from "next/head";
import { BigNumber, Contract, providers, Signer, utils } from "ethers";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css"
import Web3Modal from "web3modal";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
} from "../constants/index";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const web3ModalRef = useRef();

  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);

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

  const getBalanceOfCryptoDevTokens = async () =>{
    try {
      const provider = await etProviderOrSigner()
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider)
           const signer = await getProviderOrSigner(true);
           const address = await signer.getAddress(); // getting address
           const balance = await tokenContract.balanceOf(address);
           setBalanceOfCryptoDevTokens(balance);
    } catch (error) {
      console.log(error);
    }
  }

  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        Signer
      );

      const value = 0.001 * amount;
      const txn = await tokenContract.mint({
        value: utils.parseEther(value.toString()),
      })
      setLoading(true)
      await txn.wait()
      setLoading(false)
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
    } catch (error) {
      console.log(error);
    }
  };
  const renderButton = () => {
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          />
          <button
            className={styles.button}
            disabled={!(tokenAmount > 0)}
            onClick={() => mintCryptoDevToken(tokenAmount)}
          >
            Mint Tokens
          </button>
        </div>
      </div>
    );
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
    <div>
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

          {walletConnected ? (
            <div>
              <div className={styles.description}>
                You have minted {utils.formatEther(balanceOfCryptoDevTokens)}
              </div>

              <div className={styles.description}>
                Sor Far {utils.formatEther(tokensMinted)}/1000 Minted
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
