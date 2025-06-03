import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import contractAbi from "../abi/OnTixABI.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const networkRPC = import.meta.env.VITE_NETWORK_RPC;

export async function getContractWithSigner(_walletProvider) {
    const provider = new BrowserProvider(_walletProvider);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, contractAbi, signer);
    return contract;
}

export async function getContractWithoutSigner() {
    const provider = new JsonRpcProvider(networkRPC);
    const contract = new Contract(contractAddress, contractAbi, provider);
    return contract;
}