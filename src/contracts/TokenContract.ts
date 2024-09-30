import {
    Contract, ContractProvider, Address, Cell, TupleBuilder
} from "@ton/core";

export default class TokenContract implements Contract {

    async getGetWalletAddress(provider: ContractProvider, owner: Address) {
        let builder = new TupleBuilder();
        builder.writeAddress(owner);
        let source = (await provider.get('get_wallet_address', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }

    constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) { }
}

