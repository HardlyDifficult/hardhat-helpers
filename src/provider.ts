

export async function increaseAccountETHBalance(
    account: { address: string },
    amount: BigNumberish,
)

export async function setAccountETHBalance(
    account: {address: string},
    newBalance: BigNumber = ethers.utils.parseEther("1000"),
) {
    const balance = ethers.utils.hexStripZeros(newBalance.toHexString());
    await network.provider.send("hardhat_setBalance", [account.address, balance]);
}


// Plus setCode from address?
export async function setCode() {
    await network.provider.send("hardhat_setCode", [
        flashContract.address,
        await localProvider.getCode(flashContract.address),
    ]);
}

export async function setStorage() {
    await network.provider.send("hardhat_setStorageAt", [
        flashContract.address,
        "0x5cba936c2eb392dd4011133350efe83ec8ab46b421a1666eae1a3a892b6d8baa",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
    ]);
}
