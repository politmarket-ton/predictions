import { fromNano } from "ton-core";
import { BetDetails, BetInfo } from "./wrappers";

export function calculateEstimate(betInfo: BetInfo, betType: string, amount: number): string | number {
    const totalBetA = Number(fromNano(betInfo.total_bet_a));
    const totalBetB = Number(fromNano(betInfo.total_bet_b));

    if (isNaN(totalBetA) || isNaN(totalBetB) || amount <= 0) {
        return amount;
    }

    let odds = 0;

    if (betType === '1') {
        if (totalBetA === 0) {
            return amount;
        }
        odds = ((totalBetB * 1000) / (totalBetA + amount)) * 90 / 100;
    } else if (betType === '2') {
        if (totalBetB === 0) {
            return amount;
        }
        odds = ((totalBetA * 1000) / (totalBetB + amount)) * 90 / 100;
    } else {
        return amount;
    }

    if (isNaN(odds)) {
        return amount;
    }

    let estimate = (amount * odds) / 1000 + amount;

    return isNaN(estimate) ? amount : estimate.toFixed(3);
}

export function calculateEstimateForList(betInfo: BetInfo, betType: string, amount: number): string | number {
    const totalBetA = Number(fromNano(betInfo.total_bet_a));
    const totalBetB = Number(fromNano(betInfo.total_bet_b));

    if (isNaN(totalBetA) || isNaN(totalBetB) || amount <= 0) {
        return amount;
    }

    let odds = 0;

    if (betType === '1') {
        if (totalBetA === 0) {
            return amount;
        }
        odds = ((totalBetB * 1000) / (totalBetA)) * 90 / 100;
    } else if (betType === '2') {
        if (totalBetB === 0) {
            return amount;
        }
        odds = ((totalBetA * 1000) / (totalBetB)) * 90 / 100;
    } else {
        return amount;
    }

    if (isNaN(odds)) {
        return amount;
    }

    let estimate = (amount * odds) / 1000 + amount;

    return isNaN(estimate) ? amount : estimate.toFixed(3);
}

export function isBetActive(betInfo: BetInfo): boolean {
    return Number(betInfo.finishDate) === 0
}

export function isWinner(betInfo: BetInfo, betDetails: BetDetails) {
    return Number(betInfo.winnerOption) === Number(betDetails.outcome)
}

export function getTokenName(token_type: string) {
    switch (token_type) {
        case '1':
            return 'TON'
        case '2':
            return 'HMSTR'
        case '3':
            return 'USDT'
        case '4':
            return 'Dogs'
        case '5':
            return 'Notcoin'
        default:
            return '???'
    }
}


export function getPercent(type: number, betInfo: BetInfo): string {
    if (betInfo.total_bet_a == 0n && betInfo.total_bet_b == 0n) {
        return '50'
    }
    const amount = type == 1 ? betInfo.total_bet_a : betInfo.total_bet_b
    const sum = betInfo.total_bet_a + betInfo.total_bet_b
    return (amount / sum * 100n).toString()
}
