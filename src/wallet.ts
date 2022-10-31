import { ethers } from "hardhat";

/**
 * Returns a pseudo-random address based on the index provided.
 */
export function getRandomAddress(index: number) {
  return ethers.Wallet.fromMnemonic(
    "test test test test test test test test test test test junk",
    `m/44'/60'/0'/1/${index}`
  ).address;
}