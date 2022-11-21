import {
	call,
	near,
	NearBindgen,
	view,
} from "near-sdk-js"
import { blockTimestamp } from "near-sdk-js/lib/api";
import { Correctness, GameStatus } from "./model"

// const POINT_ONE = BigInt("100000000000000000000000")

function makeid(length: Number): string {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function randomId(): string {
	return makeid(16)
}

function getRandomKey(obj: {}): string {
	let keys = Object.keys(obj);
	return keys[Math.floor(Math.random() * keys.length)];
}

type WordleID = string
type UserID = string

type WordleChar = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'
	| 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X'
	| 'Y' | 'Z'

type GameAttempt = {
	letter: WordleChar,
	correctness: Correctness
}[]


type Game = {
	attempts: GameAttempt[]
	status: GameStatus
	createdAt: string
	updatedAt: string
}

type Games = Record<WordleID, Game>

type ChallengesReceived = Record<WordleID, {
	stake: Number
	fromUser: UserID
	createdAt: string
}>

type ChallengesSent = Record<WordleID, {
	stake: Number
	toUser: UserID,
	createdAt: string
}>

type UserData = {
	games: Games,
	challenges_received: ChallengesReceived,
	challenges_sent: ChallengesSent
}

@NearBindgen({})
class WordleContract {
	wordles: Record<WordleID, string> = {}
	userData: Record<UserID, UserData> = {}

	private wordleExists(word: string) {
		return Object.values(this.wordles).includes(word)
	}

	private validWordle(word: string) {
		return /^[A-Z]+$/.test(word) && word.length == 5
	}

	@call({ privateFunction: true })
	addWordle({ wordle }: { wordle: string }): { msg: string, success: boolean } {
		// if (near.attachedDeposit() < POINT_ONE) {
		// 	return { msg: "attach minimum 0.1", success: false }
		// }

		wordle = wordle.toUpperCase()
		if (!this.validWordle(wordle)) {
			return {
				msg: "Wordle does not match requirements",
				success: false
			}
		}

		if (this.wordleExists(wordle)) {
			return { msg: "Wordle exists", success: false }
		}

		this.wordles[randomId()] = wordle
		near.log(`new wordle set ! at ${Date.now()}`)
		return { msg: `wordle ${wordle} set`, success: true }
	}

	@call({ payableFunction: true })
	solveNewWordle(): {
		msg: string,
		wordle_id: string | null,
		game: Game | null,
		success: boolean
	} {
		let userID = near.predecessorAccountId()
		// user signing in and requesting wordle for first time
		if (!this.userData.hasOwnProperty(userID)) {
			this.userData[userID] = {
				games: {},
				challenges_received: {},
				challenges_sent: {}
			}
		}

		let games = this.userData[userID].games

		// check if the user is solving any wordle currently
		let currentWordle = Object.entries(games).find(([wordleID, game]) => {
			return game.status == GameStatus.IN_PROGRESS
		})
		if (currentWordle != undefined) {
			return {
				msg: "there is a wordle that is being solved",
				wordle_id: currentWordle[0],
				game: currentWordle[1],
				success: true
			}
		}

		let challenges_received = this.userData[userID].challenges_received
		let involvedWordleIDs = new Set([
			...Object.keys(games),
			...Object.keys(challenges_received)
		])

		if (involvedWordleIDs.size == Object.keys(this.wordles).length) {
			return {
				msg: "unable to create game. all wordles solved",
				wordle_id: null,
				game: null,
				success: false
			}
		}
		// try to get a unique wordle that the user hasn't solved
		let randomWordleID = getRandomKey(this.wordles)
		while (involvedWordleIDs.has(randomWordleID)) {
			randomWordleID = getRandomKey(this.wordles)
		}

		let now = blockTimestamp().toString()
		let game: Game = {
			status: GameStatus.IN_PROGRESS,
			attempts: [],
			createdAt: now,
			updatedAt: now
		}
		games[randomWordleID] = game
		return {
			msg: "new game created",
			wordle_id: randomWordleID,
			game,
			success: true
		}
	}

	@call({})
	wordleAttempt({ id, attempt }: { id: string, attempt: string }): { game: Game, msg: string, success: boolean } {
		attempt = attempt.toUpperCase()
		if (
			!this.validWordle(attempt)
		) {
			return {
				game: null,
				success: false,
				msg: "Attempt string is in wrong format"
			}
		}

		let userID = near.predecessorAccountId()
		let userGames = this.userData[userID].games
		if (!userGames.hasOwnProperty(id) || userGames[id].status != GameStatus.IN_PROGRESS) {
			return {
				game: null,
				success: false,
				msg: "Wordle is not being played by user. Either not started or already played."
			}
		}

		let currentGame = userGames[id]
		// check if game already has 5 attempts
		if (currentGame.attempts.length == 5) {
			return {
				game: currentGame,
				success: false,
				msg: "Game already reached max attempts"
			}
		}
		let wordle = this.wordles[id]
		let gameAttempt: GameAttempt = []

		for (let i = 0; i < 5; i++) {
			let correctness = null
			if (wordle[i] == attempt[i]) {
				correctness = Correctness.CORRECT
			} else if (wordle.includes(attempt[i])) {
				correctness = Correctness.WRONG_POSITION
			} else {
				correctness = Correctness.DOES_NOT_EXIST
			}
			gameAttempt.push({
				letter: attempt[i] as WordleChar,
				correctness
			})
		}

		currentGame.attempts.push(gameAttempt)

		if (gameAttempt.every(lc => lc.correctness == Correctness.CORRECT)) {
			currentGame.status = GameStatus.WON
			// TODO: see what to do with the challenge if any
		} else {
			if (currentGame.attempts.length == 5) {
				currentGame.status = GameStatus.LOST
				// TODO: see what to do with the challenge if any
			}
		}
		currentGame.updatedAt = blockTimestamp().toString()

		return {
			game: currentGame,
			msg: "Attempt registered !",
			success: true
		}
	}

	@call({})
	deleteAllData() {
		this.wordles = {}
		this.userData = {}
	}

	@view({})
	allWordles() {
		return {
			wordles: this.wordles,
			user_data: this.userData
		}
	}
}
