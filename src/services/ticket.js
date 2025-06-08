import { getContractWithoutSigner, getContractWithSigner } from "./connector";

export async function buyTickets(eventId, quantity, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const eventData = await contract.events(eventId);
    const totalPrice = BigInt(eventData.ticketPrice) * BigInt(quantity);
    console.log("Total price:", totalPrice);
    const tx = await contract.buyTickets(eventId, quantity, { value: totalPrice });
    const receipt = await tx.wait();
    console.log("buyTickets Receipt:", receipt);
    const ticketPurchasedEvents = receipt.logs
        .map((log) => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .filter((parsedLog) => parsedLog?.name === "TicketPurchased");
    console.log("ticketPurchasedEvents:", ticketPurchasedEvents);
    const ticketIds = ticketPurchasedEvents.map((e) =>
        Number(e.args.ticketId.toString())
    );
    const buyer = ticketPurchasedEvents[0]?.args?.buyer?.toString() ?? "";
    console.log("✅ All ticket IDs purchased:", ticketIds);
    return {
        status: "success",
        data: {
            hash: tx.hash,
            event: {
                ticketIds: ticketIds,
                buyer: buyer
            }
        },
    };
}

export async function validateTicket(ticketId, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.validateTicket(ticketId);
    const receipt = await tx.wait();
    console.log("validateTicket Receipt:", receipt);
    const ticketValidatedEvent = receipt.logs
        .map((log) => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .find((parsedLog) => parsedLog.name === "TicketValidated");
    console.log("ticketValidatedEvent:", ticketValidatedEvent);
    return {
        status: "success",
        data: {
            hash: tx.hash,
            event: {
                ticketId: ticketValidatedEvent?.args?.ticketId
                    ? Number(ticketValidatedEvent?.args?.ticketId.toString())
                    : 0
            },
        },
    };
}

export async function transferTickets(toAddress, ticketIds, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.transferTickets(toAddress, ticketIds);
    const receipt = await tx.wait();
    console.log("transferTickets Receipt:", receipt);
    const ticketTransferredEvent = receipt.logs
        .map((log) => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .filter((parsedLog) => parsedLog?.name === "TicketTransferred");
    console.log("ticketTransferredEvent:", ticketTransferredEvent);
    const ticketIdss = ticketTransferredEvent.map((e) =>
        Number(e.args.ticketId.toString())
    );
    const fromAddress = ticketTransferredEvent[0]?.args?.from?.toString() ?? "";
    const toAddresss = ticketTransferredEvent[0]?.args?.to?.toString() ?? "";
    return {
        status: "success",
        data: {
            hash: tx.hash,
            event: {
                ticketIds: ticketIdss,
                fromAddress: fromAddress,
                toAddress: toAddresss
            },
        },
    };
}

export async function getOwnerOfTicket(ticketId) {
    const contract = await getContractWithoutSigner();
    const owner = await contract.ownerOf(ticketId);
    return owner.toString();
}