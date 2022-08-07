
export async function resetNodeState() {
    await network.provider.request({
        method: "hardhat_reset",
        params: [
            {
                forking: {
                    jsonRpcUrl: process.env.RPC_URL_MAINNET,
                },
            },
        ],
    });
}

export async function impersonate(address: string): Promise<SignerWithAddress> {
    const signer = await ethers.getSigner(address);
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [signer.address],
    });
    await setAccountETHBalance(signer);
    return signer;
}