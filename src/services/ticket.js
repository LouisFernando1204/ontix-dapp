import { getContractWithSigner } from "./connector";

export async function buyTickets(eventId, quantity, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const event = await contract.events(eventId);
    const totalPrice = BigInt(event.ticketPrice) * BigInt(quantity);
    const tx = await contract.buyTickets(
        eventId,
        quantity,
        {
            value: totalPrice
        }
    );
    return tx;
}

export async function validateTicket(ticketId, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.validateTicket(ticketId);
    return tx;
}

export async function transferTickets(toAddress, ticketIds, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.transferTickets(toAddress, ticketIds);
    return tx;
}