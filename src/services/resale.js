import { parseEther, formatEther } from "ethers";
import { getContractWithSigner, getContractWithoutSigner } from "./connector";

export async function listForResale(ticketId, price, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.listForResale(ticketId, parseEther(price.toString()));
    const receipt = await tx.wait();
    console.log("listForResale Receipt:", receipt);
    const ticketListedForResaleEvent = receipt.logs
        .map((log) => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .find((parsedLog) => parsedLog.name === "TicketListedForResale");
    console.log("ticketListedForResaleEvent:", ticketListedForResaleEvent);
    return {
        status: "success",
        data: {
            hash: tx.hash,
            event: {
                ticketId: ticketListedForResaleEvent?.args?.ticketId
                    ? Number(ticketListedForResaleEvent?.args?.ticketId.toString())
                    : 0,
                ticketPrice: ticketListedForResaleEvent?.args?.price
                    ? formatEther(ticketListedForResaleEvent?.args?.price)
                    : 0,
            },
        }
    }
}

export async function buyResaleTickets(ticketIds, totalPrice, walletProvider) {
    const contract = await getContractWithSigner(walletProvider);
    const tx = await contract.buyResaleTickets(
        ticketIds,
        {
            value: parseEther(totalPrice.toString())
        }
    );
    const receipt = await tx.wait();
    console.log("buyResaleTickets Receipt:", receipt);
    const ticketResoldEvent = receipt.logs
        .map((log) => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .filter((parsedLog) => parsedLog?.name === "TicketResold");
    console.log("ticketResoldEvent:", ticketResoldEvent);
    const ticketIdss = ticketResoldEvent.map((e) =>
        Number(e.args.ticketId.toString())
    );
    const fromAddress = ticketResoldEvent[0]?.args?.from?.toString() ?? "";
    const toAddresss = ticketResoldEvent[0]?.args?.to?.toString() ?? "";
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