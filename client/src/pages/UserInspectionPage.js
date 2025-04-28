/*import React, { useState } from 'react';
import Web3 from 'web3';
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";
const contractAddress ="0xFAcBc93EC946Ef2F709504F23eA41770a361A07e"
const UserInspectionPage = () => {
  const [address, setAddress] = useState('');
  const [info, setInfo] = useState(null);
  const [violation, setViolation] = useState('');
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [fakeViolationTriggered, setFakeViolationTriggered] = useState(false);

  const web3 = new Web3(window.ethereum); // Assuming you are using Metamask for Web3 provider

  const fetchAddressInfo = async (address) => {
    // Call the smart contract's function to get information about the address
    // Replace `contract` with your actual smart contract instance
    const contract = new web3.eth.Contract(MilkSupplyChain.abi, contractAddress); // Provide ABI and contract address

    try {
      const info = await contract.methods.getAddressInfo(address).call();
      setInfo(info);
    } catch (error) {
      console.error('Error fetching address info:', error);
    }
  };

  const resolveViolation = async () => {
    // Call the contract's function to resolve the violation
    const contract = new web3.eth.Contract(MilkSupplyChain.abi, contractAddress);

    try {
      await contract.methods.resolveViolation(address).send({ from: window.ethereum.selectedAddress });
      setViolation('');
    } catch (error) {
      console.error('Error resolving violation:', error);
    }
  };

  const triggerFakeViolation = async () => {
    // Call the smart contract to trigger a fake violation
    const contract = new web3.eth.Contract(MilkSupplyChain.abi, contractAddress);

    try {
      await contract.methods.triggerFakeViolation(address).send({ from: window.ethereum.selectedAddress });
      setFakeViolationTriggered(true);
    } catch (error) {
      console.error('Error triggering fake violation:', error);
    }
  };

  const blacklistAddress = async () => {
    // Call the smart contract to blacklist the address
    const contract = new web3.eth.Contract(MilkSupplyChain.abi, contractAddress);

    try {
      await contract.methods.blacklistAddress(address).send({ from: window.ethereum.selectedAddress });
      setIsBlacklisted(true);
    } catch (error) {
      console.error('Error blacklisting address:', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchAddressInfo(address);
  };

  return (
    <div className='mt-64'>
      <h2>Address Information</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button type="submit">Get Info</button>
      </form>

      {info && (
        <div>
          <h3>Details</h3>
          <p>Name: {info.name}</p>
          <p>Position: {info.position}</p>
          <p>Role: {info.role}</p>

          {info.role === 'Producer' && (
            <div>
              <h4>Batches:</h4>
              <ul>
                {info.batches.map((batch, index) => (
                  <li key={index}>{batch}</li>
                ))}
              </ul>
            </div>
          )}

          {info.violations.length > 0 ? (
            <div>
              <h4>Violations:</h4>
              <ul>
                {info.violations.map((violation, index) => (
                  <li key={index}>
                    {violation} 
                    <button onClick={resolveViolation}>Resolve</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No violations found</p>
          )}

          <button onClick={triggerFakeViolation}>Trigger Fake Violation</button>

          <button onClick={blacklistAddress}>Blacklist Address</button>

          {isBlacklisted && <p>This address has been blacklisted</p>}
          {fakeViolationTriggered && <p>Fake violation triggered</p>}
        </div>
      )}
    </div>
  );
};

export default UserInspectionPage;*/
