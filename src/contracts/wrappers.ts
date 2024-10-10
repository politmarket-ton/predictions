import {
    Address,
    Builder,
    Cell,
    DictionaryValue,
    Slice,
    TupleReader,
    beginCell,
} from "@ton/core";

export type Finalize = {

    $$type: 'Finalize';
    outcome_a_wins: boolean;
}

export function storeFinalize(src: Finalize) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3527127190, 32);
        b_0.storeBit(src.outcome_a_wins);
    };
}


export type BetInfo = {
    $$type: 'BetInfo';
    title: string;
    source: string;
    bet_a_name: string;
    bet_b_name: string;
    image: string;
    odds_a: bigint;
    odds_b: bigint;
    finishDate: bigint;
    total_bet_a: bigint;
    total_bet_b: bigint;
    winnerOption: bigint;
    token_type: string;
}

export function loadTupleBetInfo(source: TupleReader) {
    let _title = source.readString();
    let _source = source.readString();
    let _bet_a_name = source.readString();
    let _bet_b_name = source.readString();
    let _image = source.readString();
    let _odds_a = source.readBigNumber();
    let _odds_b = source.readBigNumber();
    let _finishDate = source.readBigNumber();
    let _total_bet_a = source.readBigNumber();
    let _total_bet_b = source.readBigNumber();
    let _winnerOption = source.readBigNumber();
    let _token_type = source.readString();
    return { $$type: 'BetInfo' as const, title: _title, source: _source, bet_a_name: _bet_a_name, bet_b_name: _bet_b_name, image: _image, odds_a: _odds_a, odds_b: _odds_b, finishDate: _finishDate, total_bet_a: _total_bet_a, total_bet_b: _total_bet_b, winnerOption: _winnerOption, token_type: _token_type };
}

export type BetDetails = {
    $$type: 'BetDetails';
    user: Address;
    amount: bigint;
    betContract: Address;
    outcome: bigint;
}

export function dictValueParserBetDetails(isToken: boolean): DictionaryValue<BetDetails> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(isToken ? storeBetDetailsToken(src) : storeBetDetails(src)).endCell());
        },
        parse: (src) => {
            return isToken ? loadBetDetailsToken(src.loadRef().beginParse()) : loadBetDetails(src.loadRef().beginParse());
        }
    }
}

export function storeBetDetails(src: BetDetails) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.user);
        b_0.storeUint(src.amount, 32);
        b_0.storeAddress(src.betContract);
        b_0.storeUint(src.outcome, 8);
    };
}

export function loadBetDetails(slice: Slice) {
    let sc_0 = slice;
    let _user = sc_0.loadAddress();
    let _amount = sc_0.loadUintBig(32);
    let _betContract = sc_0.loadAddress();
    let _outcome = sc_0.loadUintBig(8);
    return { $$type: 'BetDetails' as const, user: _user, amount: _amount, betContract: _betContract, outcome: _outcome };
}

export function storeBetDetailsToken(src: BetDetails) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.user);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.betContract);
        b_0.storeUint(src.outcome, 8);
    };
}

export function loadBetDetailsToken(slice: Slice) {
    let sc_0 = slice;
    let _user = sc_0.loadAddress();
    let _amount = sc_0.loadCoins();
    let _betContract = sc_0.loadAddress();
    let _outcome = sc_0.loadUintBig(8);
    return { $$type: 'BetDetails' as const, user: _user, amount: _amount, betContract: _betContract, outcome: _outcome };
}