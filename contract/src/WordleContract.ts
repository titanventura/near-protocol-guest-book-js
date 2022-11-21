import {
	call,
	near,
	NearBindgen,
	NearPromise,
	view,
} from "near-sdk-js"
import { blockTimestamp } from "near-sdk-js/lib/api";
import { Correctness, GameStatus } from "./model"


export const ONE_NEAR = '1000000000000000000000000';
export const TWO_NEAR = '2000000000000000000000000'

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

type UserData = {
	games: Games,
}

@NearBindgen({})
class WordleContract {
	wordles = []
	userData: Record<UserID, UserData> = {}


	private wordleExists(word: string) {
		return this.wordles.includes(word)
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

		this.wordles.push(wordle)
		near.log(`new wordle set ! at ${Date.now()}`)
		return { msg: `wordle ${wordle} set`, success: true }
	}

	@view({})
	existingWordle(): { wordle_id: string | null, game: Game | null } {
		let user = near.predecessorAccountId()

		// Check if user is new
		if (!this.userData.hasOwnProperty(user)) {
			return {
				wordle_id: null,
				game: null
			}
		}

		let gamesPlayedByUser = this.userData[user].games

		let wordleAndGame = Object
			.entries(gamesPlayedByUser)
			.find(([wordleId, game]) => {
				return game.status == GameStatus.IN_PROGRESS
			})

		if (wordleAndGame === undefined) {
			return {
				wordle_id: null,
				game: null
			}
		}
		let [wordleId, game] = wordleAndGame
		return {
			wordle_id: wordleId,
			game
		}
	}

	@call({})
	getGameById({ id }: { id: string }): Game {
		let userid = near.predecessorAccountId()
		if (!this.userData.hasOwnProperty(userid)) {
			return null
		}
		let user = this.userData[userid]
		return user.games[id]
	}

	@call({})
	allWordlesByUser(): Games {
		const user = near.predecessorAccountId()
		if (!this.userData.hasOwnProperty(user)) {
			return null
		}
		const games = this.userData[user].games
		return games
	}

	@call({ payableFunction: true })
	solveNewWordle(): {
		msg: string,
		wordle_id: string | null,
		game: Game | null,
		success: boolean
	} {

		if (near.attachedDeposit() < BigInt(ONE_NEAR)) {
			NearPromise.new(near.predecessorAccountId()).transfer(near.attachedDeposit()).onReturn()
			return {
				msg: "You should attach 1 NEAR to play",
				wordle_id: null,
				game: null,
				success: false
			}
		}

		let userID = near.predecessorAccountId()
		// user signing in and requesting wordle for first time
		if (!this.userData.hasOwnProperty(userID)) {
			this.userData[userID] = {
				games: {},
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

		let involvedWordleIDs = new Set([
			...Object.keys(games)
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
		let randomWordleID = Array.from(Array(this.wordles.length).keys())
			.filter(w => !Array.from(involvedWordleIDs).includes(w.toString()))[0]

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
			wordle_id: randomWordleID.toString(),
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
			NearPromise.new(userID).transfer(BigInt(TWO_NEAR)).onReturn()
		} else {
			currentGame.status = GameStatus.LOST
		}
		currentGame.updatedAt = blockTimestamp().toString()

		return {
			game: currentGame,
			msg: "Attempt registered !",
			success: true
		}
	}

	@call({ privateFunction: true })
	deleteAllData() {
		this.wordles = []
		this.userData = {}
	}

	@call({ privateFunction: true })
	allWordles() {
		return {
			wordles: this.wordles,
			user_data: this.userData
		}
	}
}
