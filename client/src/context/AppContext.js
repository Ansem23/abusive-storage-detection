import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      const web3Instance = new Web3("http://127.0.0.1:7545");
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = MilkSupplyChain.networks[networkId];

      if (deployedNetwork) {
        const instance = new web3Instance.eth.Contract(
          MilkSupplyChain.abi,
          deployedNetwork.address
        );
        setContract(instance);
      } else {
        alert("Smart contract not deployed to the current network.");
      }
    };

    init();
  }, []);

  return (
    <AppContext.Provider value={{ web3, contract, account }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
