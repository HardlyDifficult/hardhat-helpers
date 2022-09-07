import "hardhat-preprocessor";

import { HardhatRuntimeEnvironment, LinePreprocessorConfig } from "hardhat/types";

const assertCallsRegex = /\n?((\s|\/)*)?assert\s*\([^;]*\)\s*;/g;

export function preprocessorRemoveAsserts(
  condition?: (hre: HardhatRuntimeEnvironment) => boolean | Promise<boolean>
): (hre: HardhatRuntimeEnvironment) => Promise<LinePreprocessorConfig | undefined> {
  const preprocess = {
    transform: (line: string): string => {
      return line.replace(assertCallsRegex, "");
    },
    settings: { removeLog: true },
  };
  return async (hre: HardhatRuntimeEnvironment): Promise<LinePreprocessorConfig | undefined> => {
    if (typeof condition === "function") {
      const cond = condition(hre);
      const promise = cond as Promise<boolean>;
      if (typeof cond === "object" && "then" in promise) {
        return promise.then((v) => (v ? preprocess : undefined));
      } else if (!cond) {
        return Promise.resolve(undefined);
      }
    }
    return Promise.resolve(preprocess);
  };
}
