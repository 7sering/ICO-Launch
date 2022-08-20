import Head from "next/head";
import { BigNumber, Contract, providers, Signer, utils } from "ethers";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
} from "../constants/index";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setwalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const web3ModalRef = useRef();
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);

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
      console.error(error);
    }
  };

  const getBalanceOfCryptoDevTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress(); // getting address
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoDevTokens(balance)
    } catch (error) {
      console.error(error);
      setBalanceOfCryptoDevTokens(zero);
    }
  };

  

  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (error) {
      console.error(error);
    }
  };

  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress(); // getting address from smart contract
      const balance = await nftContract.balanceOf(address); // getting balance of address

      if (balance === zero) {
        setTokensToBeClaimed(zero); //set claimed token be zero cuz address don't have nft
      } else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.error(error);
      setTokensToBeClaimed(zero);
    }
  };

  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer,
      );

      const value = 0.001 * amount;
      const txn = await tokenContract.mint({
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await txn.wait();
      setLoading(false);
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };

  // Claim Crypto Dev Tokens
  const claimCryptoDevTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI, signer)

      const txn = await tokenContract.claim()
      setLoading(true)
      await txn.wait()
      setLoading(false)
      window.alert("You Successfully Claimed Cypto Devs Token")
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  }
  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading......</button>
        </div>
      );
    }

    if (tokensToBeClaimed) {

      return(
        <div>
          <div className={styles.description}>
           {tokensToBeClaimed * 10} Token Can be claimed
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      )
    }

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
      getBalanceOfCryptoDevTokens();
      getTotalTokensMinted();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);

  return (
    <div>
    <Head>
      <title>Crypto Devs</title>
      <meta name="description" content="ICO-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
        <div className={styles.description}>
          You can claim or mint Crypto Dev tokens here
        </div>
        {walletConnected ? (
          <div>
            <div className={styles.description}>
              {/* Format Ether helps us in converting a BigNumber to string */}
              You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto
              Dev Tokens
            </div>
            <div className={styles.description}>
              {/* Format Ether helps us in converting a BigNumber to string */}
              Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
            </div>
            {renderButton()}
          </div>
        ) : (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        )}
      </div>
      <div>
        {/* <img className={styles.image} src="./78uY3Mm.png" /> */}
      </div>
    </div>

    <footer className={styles.footer}>
      Made with &#10084; by Crypto Devs
    </footer>
  </div>
  );
}
