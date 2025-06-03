import { getContractWithoutSigner } from "./connector";

export async function getTicketMetadata(ticketId) {
    const contract = await getContractWithoutSigner();
    const data = await contract.ticketMetadata(ticketId);
    return {
        eventId: data.eventId,
        isUsed: data.isUsed,
        isResold: data.isResold
    };
}

export async function getTokenURI(tokenId) {
    const contract = await getContractWithoutSigner();
    const tokenUri = await contract.getTokenURI(tokenId);
    return tokenUri;
}