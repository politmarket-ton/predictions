import {
  Contract, ContractProvider, Address, Cell, TupleBuilder
} from "@ton/core";
import * as wrappers from "./wrappers";
import { loadTupleBetInfo } from "./wrappers";

export default class ChildContract implements Contract {

  async getGetBetInfo(provider: ContractProvider) {
    let builder = new TupleBuilder();
    let source = (await provider.get('getBetInfo', builder.build())).stack;
    const result = loadTupleBetInfo(source);
    return result;
  }

  async getIsFinalized(provider: ContractProvider) {
    const { stack } = await provider.get("finalize", []);
    return stack.readBoolean();
  }

  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) { }
}

export type Bet = {
  $$type: 'Bet';
  betInfo: wrappers.BetInfo;
  betDetails: wrappers.BetDetails | null;
  address: string;
}