import { parseEther, formatEther } from "ethers";
import { getContractWithSigner, getContractWithoutSigner } from "./connector";

export async function createEvent(
    id, startTime, endTime, ticketPrice, maxTickets,
    resaleStart, resaleEnd, resalePriceCap, tokenURIs, walletProvider
) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.createEvent(
        id,
        startTime,
        endTime,
        parseEther(ticketPrice.toString()),
        maxTickets,
        resaleStart,
        resaleEnd,
        parseEther(resalePriceCap.toString()),
        tokenURIs
    );
    return tx;
}

export async function withdrawEventProceeds(eventId, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.withdrawEventProceeds(eventId);
    return tx;
}

export async function getEventDetail(eventId) {
    const contract = await getContractWithoutSigner();
    const e = await contract.events(eventId);
    return {
        startTime: parseInt(e.startTime),
        endTime: parseInt(e.endTime),
        ticketPrice: formatEther(e.ticketPrice),
        maxTickets: parseInt(e.maxTickets),
        resaleStart: parseInt(e.resaleStart),
        resaleEnd: parseInt(e.resaleEnd),
        resalePriceCap: formatEther(e.resalePriceCap),
        creator: e.creator.toString(),
        ticketsSold: parseInt(e.ticketsSold)
    };
}

export async function getEventProceeds(eventId) {
    const contract = await getContractWithoutSigner();
    const proceeds = await contract.eventProceeds(eventId);
    return formatEther(proceeds);
}