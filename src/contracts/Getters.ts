import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "@ton/ton";
import ChildContract, { Bet } from "./ChildContract";
import { Constants } from "./Constants";
import ParentContract from "./ParentContract";
import axios from "axios";
import TokenContract from "./TokenContract";
import { it } from "node:test";

async function getChildContract(addressString: string) {
    const contractAddress = Address.parse(addressString);
    const endpoint = await getHttpEndpoint({ network: Constants.network });
    const client = new TonClient({ endpoint });
    const contract = new ChildContract(contractAddress);
    const child = client.open(contract);
    return child
}

async function getParentContract(addressString: string) {
    const contractAddress = Address.parse(addressString);
    const endpoint = await getHttpEndpoint({ network: Constants.network });
    const client = new TonClient({ endpoint });
    const contract = new ParentContract(contractAddress);
    const parent = client.open(contract);
    return parent
}

async function getTokenContract(addressString: string) {
    const contractAddress = Address.parse(addressString);
    const endpoint = await getHttpEndpoint({ network: Constants.network });
    const client = new TonClient({ endpoint });
    const contract = new TokenContract(contractAddress);
    const parent = client.open(contract);
    return parent
}

export async function fetchBets(type: number, tokenType: number, address: string) {
    console.log("type: ", type, ", token: ", tokenType, ", adr: ", address)
    try {
        let result: Bet[]

        switch (type) {
            case 0:
                result = await fetchCommonBets(tokenType)
                break;
            case 1:
                result = await fetchMyBets(address)
                break;
            default:
                result = []
        }
        return result
    } catch (error) {
        await handleError(error);
        throw error; // Rethrow to handle state in the calling component.
    }
}

async function handleError(error: unknown) {
    if (error instanceof Error) {
        if (error.message.includes("Unknown address type")) {
            console.error("Caught the specific 'Unknown address type' error:", error);
            await retryFetch();
        } else {
            console.error("Caught a different error:", error);
        }
    } else {
        console.error("Caught a non-error object:", error);
    }
}

async function retryFetch() {
    try {
        console.log("Retrying fetch...");
        const result = await fetchCommonBets(1);
        return result;
    } catch (error) {
        console.error("Error during retry:", error);
    }
}

export async function fetchCommonBets(tokenType: number) {
    let result: Bet[] = [];
    let address

    switch (tokenType) {
        case 1:
            address = Constants.tonParentAddress
            break;
        case 2:
            address = Constants.hamstrParentAddress
            break;
        case 3:
            address = Constants.usdtParentAddress
            break;
        case 4:
            address = Constants.dogsParentAddress
            break;
        case 5:
            address = Constants.notcoinParentAddress
            break;
        default:
            return result = []
    }

    const contract = await getParentContract(address);
    const addressMap = await contract.getGetAllAddresses();

    for (const address of addressMap.values()) {
        try {
            const betInfo = await getBetInfo(address.toString())
            console.log("address is:", address.toString(), "token type: ", betInfo.token_type, "finishDate: ", betInfo.finishDate)

            if (Number(betInfo.finishDate) <= 0 && tokenType.toString() === betInfo.token_type) {
                result.push({ $$type: "Bet", betInfo: betInfo, betDetails: null, address: address.toString() })
            }
        } catch (error) {
            console.error("fetching contract for address: ", address.toString(), " - gone wrong", error)
            // console.error("fetching contract for address: ", address.toString(), " - gone wrong")
        }
    }

    return result
}

export async function fetchMyBets(address: string) {
    const tonContract = await getParentContract(Constants.tonParentAddress);
    const tonAddressMap = await tonContract.getGetUserBets(Address.parse(address), false);

    let result: Bet[] = [];

    for (const betDetails of tonAddressMap.values()) {
        const betInfo = await getBetInfo(betDetails.betContract.toString())
        result.push({ $$type: "Bet", betInfo: betInfo, betDetails: betDetails, address: betDetails.toString() })
        console.log("address is:", betDetails.betContract.toString(), "winner is: ", betInfo.winnerOption.toString(), "finishDate: ", betInfo.finishDate)
    }

    const parentAddresses = [Constants.hamstrParentAddress, Constants.usdtMasterAddress, Constants.dogsParentAddress, Constants.notcoinParentAddress]
    for (const parentAddress of parentAddresses) {
        try {
            const tmp = await fetchMyBetsForContract(address, parentAddress)
            result.concat(tmp)
        } catch (e) {
            console.error('Failed to fetch my bets for: ', parentAddress, e)
        }
    }
    return result
}

async function fetchMyBetsForContract(userAddress: string, parentContractAddress: string): Promise<Bet[]> {
    let result: Bet[] = [];

    const tokenContract = await getParentContract(parentContractAddress);
    const tokenAddressMap = await tokenContract.getGetUserBets(Address.parse(userAddress), true);

    for (const betDetails of tokenAddressMap.values()) {
        const betInfo = await getBetInfo(betDetails.betContract.toString())
        result.push({ $$type: "Bet", betInfo: betInfo, betDetails: betDetails, address: betDetails.toString() })
        console.log("address is:", betDetails.betContract.toString(), "winner is: ", betInfo.winnerOption.toString(), "finishDate: ", betInfo.finishDate)
    }

    return result
}

export async function getBetInfo(address: string) {
    const contract = await getChildContract(address);
    const betInfo = await contract.getGetBetInfo();
    return betInfo
}

export async function getUSDPrice(): Promise<number | null> {
    try {
        const response = await axios.get('https://tonapi.io/v2/rates?tokens=ton&currencies=usd');
        // Check if the response data structure matches the expected format
        if (response.data && response.data.rates && response.data.rates.TON && response.data.rates.TON.prices) {
            return response.data.rates.TON.prices.USD;
        }
        return null;
    } catch (error) {
        console.error('Error fetching USD price:', error);
        return null;
    }
}

export async function getTokenAllowedAddress(address: string, tokenAddress: string) {
    try {
        const contract = await getTokenContract(tokenAddress);
        console.log('My address:', address);

        const myWalletTokenAddress = await contract.getGetWalletAddress(Address.parse(address));
        console.log('Success hmst:', myWalletTokenAddress.toString());

        return myWalletTokenAddress
    } catch (error) {
        console.error('Error getTokenAllowedAddress:', error);
        return null
    }
}

export async function fetchContractByAddress(address: string): Promise<Bet> {
    const betInfo = await getBetInfo(address)
    const result: Bet = { $$type: "Bet", betInfo: betInfo, betDetails: null, address: address }
    return result
}
