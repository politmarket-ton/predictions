import {
    Contract, ContractProvider, Address, Cell, TupleBuilder,
    Dictionary
} from "@ton/core";
import { dictValueParserBetDetails } from "./wrappers";

export default class ParentContract implements Contract {

    async getGetAllAddresses(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('getAllAddresses', builder.build())).stack;
        let result = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
        return result;
    }

    async getGetUserBets(provider: ContractProvider, user: Address, isToken: boolean) {
        let builder = new TupleBuilder();
        builder.writeAddress(user);
        let source = (await provider.get('UserBetInfo', builder.build())).stack;
        let result = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserBetDetails(isToken), source.readCellOpt());
        return result;
    }

    constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) { }
}

