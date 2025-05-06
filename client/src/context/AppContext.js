import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [role, setRole] = useState(null); // Add role state
  const navigate = useNavigate(); // Initialize useNavigate

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
  
  // Declare new stock movement
  const declareNewStock = async (quantity, batchId, recipient = null) => {
    if (!contract || !account) {
      alert("Wallet not connected or contract not initialized.");
      return;
    }
  
    try {
      console.log("Declaring stock movement with quantity:", quantity, "batchId:", batchId, "recipient:", recipient);
  
      if (role === "producer" && !recipient) {
        // Call the `produce` function for producers
        const tx = await contract.methods
          .produce(quantity)
          .send({ from: account });
  
        console.log("Stock produced successfully. Transaction:", tx);
        alert("Stock produced successfully!");
      } else if (role === "producer" || role === "reseller") {
        // Call the `transferStock` function for transfers
        if (!recipient) {
          alert("Recipient address is required for stock transfer.");
          return;
        }
  
        const tx = await contract.methods
          .transferStock(recipient, quantity, batchId)
          .send({ from: account });
  
        console.log("Stock transferred successfully. Transaction:", tx);
        alert("Stock transferred successfully!");
      } else {
        alert("You do not have permission to declare stock movement.");
        return;
      }
  
      // Navigate to the "Stocks" page after successful declaration
      navigate("/stocks");
    } catch (error) {
      console.error("Error declaring stock movement:", error);
  
      if (error.message.includes("revert")) {
        alert("Transaction failed: Smart contract reverted the operation. Check your inputs or permissions.");
      } else if (error.message.includes("User denied transaction signature")) {
        alert("Transaction failed: You denied the transaction in MetaMask.");
      } else {
        alert("Failed to declare stock movement. Please check the console for details.");
      }
    }
  };

  // View past declarations
  const viewPastDeclarations = async () => {
    if (!contract || !account) {
      alert("Wallet not connected or contract not initialized.");
      return;
    }
  
    try {
      const declarations = await contract.methods
        .getPastDeclarations(account) // Replace with your contract method
        .call();
  
      console.log("Past declarations:", declarations);
      alert("Check the console for past declarations.");
    } catch (error) {
      console.error("Error fetching past declarations:", error);
      alert("Failed to fetch past declarations.");
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
    <AppContext.Provider value={{ web3, contract, account, role, connectWallet, declareNewStock, viewPastDeclarations }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
