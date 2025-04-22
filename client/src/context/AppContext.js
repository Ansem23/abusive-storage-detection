import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";

export  const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [role, setRole] = useState(null); // Add role state

  /*const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return { success: false };
    }
  
    try {
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
  
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = MilkSupplyChain.networks[networkId];
  
      if (!deployedNetwork) {
        console.error("No deployed network found for network ID:", networkId);
        alert("Smart contract not deployed to the current network. Please switch networks.");
        return { success: false };
      }
  
      const instance = new web3Instance.eth.Contract(
        MilkSupplyChain.abi,
        deployedNetwork.address
      );
  
      setWeb3(web3Instance);
      setContract(instance);
  
      // Check role
      const isAdmin = await instance.methods.isAdmin(accounts[0]).call();
      const isProducer = await instance.methods.isProducer(accounts[0]).call();
      const isReseller = await instance.methods.isReseller(accounts[0]).call();
  
      let userRole = "unknown";
      if (isAdmin) userRole = "admin";
      else if (isProducer) userRole = "producer";
      else if(isReseller) userRole="reseller"
  
      setRole(userRole);
  
      return { success: true, role: userRole }; 
    } catch (error) {
      console.error("Error during wallet connection:", error);
      alert("Wallet connection failed.");
      return { success: false };
    }
  };*/


  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return { success: false };
    }
  
    try {
      console.log(" Requesting account access...");
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      const accounts = await web3Instance.eth.getAccounts();
      console.log("Accounts:", accounts);
      setAccount(accounts[0]);
  
      const networkId = await web3Instance.eth.net.getId();
      console.log(" Current Network ID:", networkId);
      console.log(" Networks in ABI JSON:", MilkSupplyChain.networks);
  
      const deployedNetwork = MilkSupplyChain.networks[networkId];
      if (!deployedNetwork) {
        console.error("No deployed network found for network ID:", networkId);
        alert("Smart contract not deployed to the current network. Please switch networks.");
        return { success: false };
      }
  
      console.log(" Contract address:", deployedNetwork.address);
  
      const instance = new web3Instance.eth.Contract(
        MilkSupplyChain.abi,
        deployedNetwork.address
      );
      console.log(" Contract instance created:", instance);
      setWeb3(web3Instance);
      setContract(instance);
  
      //  Check user roles
      const isAdmin = await instance.methods.isAdmin(accounts[0]).call();
      const isProducer = await instance.methods.isProducer(accounts[0]).call();
      const isReseller = await instance.methods.isReseller(accounts[0]).call();
      console.log(" Roles: admin?", isAdmin, "producer?", isProducer, "reseller?", isReseller);
  
      let userRole = "unknown";
      if (isAdmin) userRole = "admin";
      else if (isProducer) userRole = "producer";
      else if (isReseller) userRole = "reseller";
  
      setRole(userRole);
      console.log("🎭 User role:", userRole);
  
      return { success: true, role: userRole };
    } catch (error) {
      console.error("Detailed Wallet Connection Error:", error);
      alert("Wallet connection failed.");
      return { success: false };
    }
  };
  
  

  useEffect(() => {
    const init = async () => {
      const web3Instance = new Web3("http://127.0.0.1:7545");
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = MilkSupplyChain.networks[networkId];

      if (!deployedNetwork) {
        console.error("No deployed network found for network ID:", networkId);
        alert("Smart contract not deployed to the current network. Please switch networks.");
        return;
      }

      console.log("Deployed Network:", deployedNetwork);
      console.log("Contract Address:", deployedNetwork.address);
      try {
        const instance = new web3Instance.eth.Contract(
          MilkSupplyChain.abi, // Ensure this ABI matches the deployed contract
          deployedNetwork.address // Ensure this address matches the deployed contract
        );
        console.log("Contract Instance:", instance);
        setContract(instance);
      } catch (error) {
        console.error("Error initializing contract:", error);
        alert("Failed to initialize the contract. Please check the ABI and address.");
      }
    };

    init();
  }, []);

  return (
    <AppContext.Provider value={{ web3, contract, account, role, connectWallet }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
