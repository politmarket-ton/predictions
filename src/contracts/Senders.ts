
import { Address, beginCell, toNano } from "@ton/ton";
import { getTokenAllowedAddress } from "./Getters";
import { Constants } from "./Constants";

export function createTransactionForStringMessage(message: string, amount: string, address: string) {
    const contractAddress = Address.parse(address);
    const newAmount = amount.replace(/,/g, ".")
    const body = beginCell()
        .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
        .storeStringTail(message) // write our text comment
        .endCell();


    const myTransaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: contractAddress.toRawString(),
                amount: toNano(newAmount).toString(),
                payload: body.toBoc().toString("base64") // payload with comment in body
            }
        ]
    }
    return myTransaction
}

export async function createTransactionForToken(
    message: string,
    amount: string,
    receiverAddress: string,
    userFriendlyAddress: string,
    token_type: string
) {

    let tokenAddress
    switch (token_type) {
        case '2':
            tokenAddress = Constants.hmstrMasterAddress
            // tokenAddress = Constants.tokenAddress
            break;

        case '3':
            tokenAddress = Constants.usdtMasterAddress
            break;

        case '4':
            tokenAddress = Constants.dogsMasterAddress
            break;

        case '5':
            tokenAddress = Constants.notcoinMasterAddress
            break;

        default:
            return null;
    }

    const jettonWalletAddress = await getTokenAllowedAddress(userFriendlyAddress, tokenAddress)
    

    if (jettonWalletAddress === null) {
        return null
    }

    const newAmount = parseFloat(amount.replace(',', '.')) * 1000000;


    const forwardTON = "0.05";  // gas
    const forwardPayload = beginCell()
        .storeUint(0, 32)  // Opcode for comment message
        .storeStringTail(message)  // Message comment
        .endCell();

    const option = parseInt(message)

    const body = beginCell()
        .storeUint(0xf8a7ea5, 32)  // Opcode
        .storeUint(option, 64)  // Unique ID
        .storeCoins(newAmount)  // Amount of jettons to send
        .storeAddress(Address.parse(receiverAddress))  // Receiver address
        .storeAddress(jettonWalletAddress)  // Sender jetton wallet address
        .storeBit(0)  // Custom payload flag
        .storeCoins(toNano(0.1))  // Forward TON for gas
        .storeBit(1)  // forward_payload flag
        .storeRef(forwardPayload)
        .endCell();


    const myTransaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: jettonWalletAddress.toRawString(),
                amount: toNano(forwardTON).toString(),
                payload: body.toBoc().toString("base64") // payload with comment in body
            }
        ]
    }
    return myTransaction
}



