import { BigNumber, providers } from "ethers";
import { ethers } from "hardhat";

import { AddressLike, toAddress } from "./types";

export async function getStorage(contract: AddressLike, slot: string | number): Promise<string> {
  slot = getSlot(slot, true);
  return await ethers.provider.send("eth_getStorageAt", [toAddress(contract), slot]);
}

export async function getStorageAddress(contract: AddressLike, slot: string | number): Promise<string> {
  let value = await getStorage(contract, slot);
  value = ethers.utils.hexStripZeros(value);
  value = ethers.utils.hexZeroPad(value, 20);
  return ethers.utils.getAddress(value);
}

export async function getStorageNumber(contract: AddressLike, slot: string | number): Promise<BigNumber> {
  const value = await getStorage(contract, slot);
  return BigNumber.from(value);
}

export async function getCode(fromContract: AddressLike, fromProvider?: providers.Provider): Promise<string> {
  return await (fromProvider ?? ethers.provider).getCode(toAddress(fromContract));
}

export async function hasCode(contract: AddressLike | string): Promise<boolean> {
  const address = typeof contract === "string" ? contract : contract.address;
  const code = await ethers.provider.getCode(address);
  return code !== "0x";
}

export async function setCodeFromContract(
  toContract: AddressLike,
  fromContract: AddressLike,
  fromProvider?: providers.Provider
) {
  const code = await getCode(fromContract, fromProvider);
  await setCodeTo(toContract, code);
}

export async function setCodeTo(contract: AddressLike, code: string) {
  await ethers.provider.send("hardhat_setCode", [toAddress(contract), code]);
}

export async function setStorage(contract: AddressLike, slot: string | number, value: string | number) {
  slot = getSlot(slot);
  if (typeof value === "number") {
    value = ethers.utils.hexValue(value);
  }
  value = ethers.utils.hexZeroPad(value, 32);
  await ethers.provider.send("hardhat_setStorageAt", [toAddress(contract), slot, value]);
}

function getSlot(slot: string | number, pad = false): string {
  if (typeof slot === "number") {
    slot = ethers.utils.hexValue(slot);
  }
  if (pad) {
    slot = ethers.utils.hexZeroPad(slot, 32);
  }
  return slot;
}
