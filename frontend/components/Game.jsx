import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";


// letter correctness
export const LETTER_DOES_NOT_EXIST = 0
export const LETTER_WRONG_POS = 1
export const LETTER_CORRECT = 2
export const LETTER_INPUT = -1

export const styleMap = {
    [LETTER_CORRECT]: "green-tile",
    [LETTER_DOES_NOT_EXIST]: "gray-tile",
    [LETTER_WRONG_POS]: "orange-tile",
    [LETTER_INPUT]: "transparent-tile"
}

// game status
export const IN_PROGRESS = 0
export const WON = 1
export const LOST = 2


export default function Game({ wordleId, gameInfo, submitGuess, clearGame }) {

    if (gameInfo == null) {
        return <></>
    }

    const [curWord, setCurWord] = useState("")

    let freeRows = []
    if (gameInfo.attempts.length < 5) {
        freeRows = Array(5 - (gameInfo.attempts.length)).fill(
            Array(5).fill({ letter: "", correctness: LETTER_INPUT })
        )
    }

    const guessWordle = async () => {
        console.log(`Submitting.. ${curWord}`)
        let regex = /^[A-Z]{5}$/
        let word = curWord.toUpperCase()
        if (!regex.test(word)) {
            toast.error("Word should contain only characters and should be 5 letters !", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 1000
            });
        } else {
            await submitGuess(curWord)
        }

    }

    return <>
        {/* <h6>Wordle ID : {wordleId}</h6>
        <h6>Game Info : {JSON.stringify(gameInfo, null, 4)}</h6> */}
        <a onClick={clearGame} style={{ cursor: "pointer" }}>
            {"👈 Back"}
        </a>
        <div className="game-container">
            {
                [
                    ...gameInfo.attempts,
                    ...freeRows
                ].map((attempt, rowIdx) => {
                    return (
                        <div className="game-word-container" key={`game-word-${rowIdx}`}>
                            {
                                attempt.map(({ letter, correctness }, colIdx) => {
                                    return (
                                        <div
                                            key={`game-word-${rowIdx}-${colIdx}`}
                                            className={`letter-tile ${styleMap[correctness]}`}>
                                            {letter.toUpperCase()}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                })
            }

            {
                gameInfo.status == IN_PROGRESS &&
                (
                    <>
                        <input
                            style={{ border: "2px solid #CFD2CF", padding: "8px", marginTop: "24px" }}
                            placeholder="Input.."
                            type="text"
                            onChange={(e) => setCurWord(e.target.value)}
                            value={curWord}
                            name="guess-input"
                            id="guess-input" />

                        <button onClick={guessWordle}>Go</button>
                    </>
                )
            }

        </div>
    </>
}