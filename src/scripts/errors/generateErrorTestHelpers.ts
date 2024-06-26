import { CustomContractError } from "./types";

export function generateErrorTestHelpers(
  customErrorsImportPath: string,
  contractErrors: { [errorName: string]: CustomContractError }
): string {
  let file = `import { expect } from "chai";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Addressish } from "hardhat-helpers";

import { ContractErrorsByName, CustomContractError } from "${customErrorsImportPath}";

async function expectCustomError(tx: Promise<any>, error: CustomContractError, ...args: any[]) {
  try {
    const factory = await ethers.getContractFactory(error.contractName);
    await expect(tx)
      .to.be.revertedWithCustomError(factory, error.name)
      .withArgs(...args);
  } catch (e: any) {
    // This is a workaround to support Viem transactions
    // Pending https://github.com/NomicFoundation/hardhat/issues/4874

    // TODO: how to account for args?
    if (!e.message?.includes(\`reverted with custom error '\${error.name}(\${args.join(", ")})'\`))
      throw e;
  }
}

export const expectError = {
`;

  for (const errorName of Object.keys(contractErrors)) {
    const error = contractErrors[errorName];
    file += `  ${error.name}: async function (
    tx: Promise<any>,\n`;
    if (error.params) {
      for (const param of error.params) {
        let type;
        if (param.type.includes("int")) {
          type = "BigNumberish";
        } else if (param.type === "address") {
          type = "Addressish";
        } else if (param.type === "string" || param.type.includes("byte")) {
          type = "string";
        } else {
          throw new Error(`Unknown type: ${param.type}`);
        }
        file += `    ${param.name}: ${type},\n`;
      }
    }
    file += `  ) {
    await expectCustomError(
      tx,
      ContractErrorsByName.${error.name},
`;
    if (error.params) {
      for (const param of error.params) {
        file += `      ${param.name},\n`;
      }
    }
    file += `    );
  },
`;
  }

  file += `};\n`;
  return file;
}
