import { BigNumber, ethers } from "ethers";
import { SimpleTransactionRequest } from "./";

if (!process.env.MAIN_RPC_URL_WS) {
    throw new Error("MAIN_RPC_URL_WS is not set");
}

export const wsProvider = new ethers.providers.WebSocketProvider(
    process.env.MAIN_RPC_URL_WS
);
export const wsSecondaryProvider = process.env.SECONDARY_RPC_URL_WS
    ? new ethers.providers.WebSocketProvider(process.env.SECONDARY_RPC_URL_WS)
    : undefined;
export const localProvider = new ethers.providers.JsonRpcProvider(
    process.env.MAIN_RPC_URL
);
export const secondaryProvider = process.env.SECONDARY_RPC_URL
    ? new ethers.providers.JsonRpcProvider(process.env.SECONDARY_RPC_URL)
    : undefined;

export const archiveProvider = new ethers.providers.JsonRpcProvider(
    process.env.ARCHIVE_RPC_URL
);
export const walletAddress = "0xTODO";

export type DeltaResults = {
    // balance: `=` no balance change, `+` new account, `*` balance change, `-` selfdestructed
    "*":
    | {
        from: string;
        to: string;
    }
    | undefined;
    "+": string | undefined;
    // balance: { '-': '<oldBalance>' } is a self destruct
    "-": string | undefined;
    "=": string | undefined;
};

export type TraceResults = {
    output: string;
    stateDiff: {
        [key: string]: {
            balance: DeltaResults;
            code: string;
            nonce: string;
            storage: {
                [key: string]: DeltaResults;
            };
        };
    };
    trace: Array<{
        action: {
            from: string;
            callType: string;
            gas: string;
            input: string;
            to: string;
            value: string;
        };
        result: {
            gasUsed: string;
            output: string;
        };
        error: string | undefined;
        subtraces: number;
        traceAddress: Array<string>;
        type: string;
    }>;
};

export async function traceCall(
    transaction: SimpleTransactionRequest,
    blockNumber?: number,
    types: ("trace" | "stateDiff" | "vmTrace")[] = ["trace", "stateDiff"]
): Promise<TraceResults | undefined> {
    transaction.value = BigNumber.from(transaction.value || 0).toHexString();
    while (transaction.value.startsWith("0x0")) {
        transaction.value = `0x${transaction.value.substring(3)}`;
    }
    if (transaction.value == "0x") {
        transaction.value = "0x0";
    }

    // TODO do we need to set gas limit / price?
    try {
        const provider = blockNumber ? archiveProvider : localProvider;
        const results = await provider.send("trace_call", [
            transaction,
            types,
            blockNumber || "latest",
        ]);
        return results;
    } catch (error) {
        return undefined;
    }
}

export async function traceTransaction(
    txHash: string,
    types: ("trace" | "stateDiff" | "vmTrace")[] = ["trace", "stateDiff"]
): Promise<TraceResults | undefined> {
    try {
        const results = await archiveProvider.send("trace_replayTransaction", [
            txHash,
            types,
        ]);
        return results;
    } catch (error) {
        console.log("trace error", error);
        return undefined;
    }
}

export async function traceBlock() {
    blockTrace = await archiveProvider.send("trace_block", [blockNumber]);

}