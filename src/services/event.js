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
    const receipt = await tx.wait();
    console.log("createEvent Receipt:", receipt);
    const eventCreatedEvent = receipt.logs
        .map((log) => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .find((parsedLog) => parsedLog.name === "EventCreated");
    console.log("eventCreatedEvent:", eventCreatedEvent);
    return {
        status: "success",
        data: {
            hash: tx.hash,
            event: {
                eventId: eventCreatedEvent?.args?.eventId.toString() ?? "",
                creator: eventCreatedEvent?.args?.creator.toString() ?? ""
            },
        }
    }
}

export async function withdrawEventProceeds(eventId, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.withdrawEventProceeds(eventId);
    const receipt = await tx.wait();
    console.log("withdrawEventProceeds Receipt:", receipt);
    const eventProceedsWithdrawnEvent = receipt.logs
        .map((log) => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .find((parsedLog) => parsedLog.name === "EventProceedsWithdrawn");
    console.log("eventProceedsWithdrawnEvent:", eventProceedsWithdrawnEvent);
    return {
        status: "success",
        data: {
            hash: tx.hash,
            event: {
                eventId: eventProceedsWithdrawnEvent?.args?.eventId.toString() ?? "",
                creator: eventProceedsWithdrawnEvent?.args?.creator.toString() ?? "",
                amount: eventProceedsWithdrawnEvent?.args?.amount
                    ? formatEther(eventProceedsWithdrawnEvent?.args?.amount)
                    : 0
            },
        }
    }
}

export async function getEventDetail(eventId) {
    const contract = await getContractWithoutSigner();
    const e = await contract.events(eventId);
    return {
        startTime: Number(e.startTime.toString()),
        endTime: Number(e.endTime.toString()),
        ticketPrice: formatEther(e.ticketPrice),
        maxTickets: Number(e.maxTickets.toString()),
        resaleStart: Number(e.resaleStart.toString()),
        resaleEnd: Number(e.resaleEnd.toString()),
        resalePriceCap: formatEther(e.resalePriceCap),
        creator: e.creator.toString(),
        ticketsSold: Number(e.ticketsSold.toString())
    };
}

export async function getEventProceeds(eventId) {
    const contract = await getContractWithoutSigner();
    const proceeds = await contract.eventProceeds(eventId);
    return formatEther(proceeds);
}

export async function getNextTicketId() {
    const contract = await getContractWithoutSigner();
    const nextId = await contract.nextTicketId();
    return Number(nextId.toString());
}