/* Talking with a contract often involves transforming data, we recommend you to encapsulate that logic into a class */

import { utils } from 'near-api-js';

export class WordleInterface {

    constructor({ contractId, walletToUse }) {
        this.contractId = contractId;
        this.wallet = walletToUse
    }

    // async getMessages() {
    //     const messages = await this.wallet.viewMethod({ contractId: this.contractId, method: "get_messages" })
    //     console.log(messages)
    //     return messages
    // }

    // async addMessage(message, donation) {
    //     const deposit = utils.format.parseNearAmount(donation);
    //     return await this.wallet.callMethod({ contractId: this.contractId, method: "add_message", args: { text: message }, deposit });
    // }

    async solveNewWordle() {
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "solveNewWordle",
        })
    }

    async submitGuess(wordle_id, guess) {
        console.log(wordle_id, guess)
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "wordleAttempt",
            args: {
                id: wordle_id,
                attempt: guess
            }
        })
    }

    async existingWordle() {
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "existingWordle",
        })
    }

    async allWordlesByUser() {
        return await this.wallet.callMethod({
            contractId: this.contractId,
            method: "allWordlesByUser",
        })
    }
}