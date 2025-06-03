import { parseEther, formatEther } from "ethers";
import { getContractWithSigner, getContractWithoutSigner } from "./connector";

export async function listForResale(ticketId, price, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.listForResale(ticketId, price);
    return tx;
}

export async function buyResaleTickets(ticketIds, totalPrice, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.buyResaleTickets(
        ticketIds,
        {
            value: parseEther(totalPrice.toString())
        }
    );
    return tx;
}

export async function getResalePrice(ticketId) {
    const contract = await getContractWithoutSigner();
    const price = await contract.resalePrice(ticketId);
    return formatEther(price);
}

export async function getResaleSeller(ticketId) {
    const contract = await getContractWithoutSigner();
    const seller = await contract.resaleSeller(ticketId);
    return seller.toString();
}