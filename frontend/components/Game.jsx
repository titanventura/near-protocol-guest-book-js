import React, { useEffect, useState } from "react";


const LETTER_DOES_NOT_EXIST = 0
const LETTER_WRONG_POS = 1
const LETTER_CORRECT = 2
const LETTER_INPUT = -1

const styleMap = {
    [LETTER_CORRECT]: "green-tile",
    [LETTER_DOES_NOT_EXIST]: "gray-tile",
    [LETTER_WRONG_POS]: "orange-tile",
    [LETTER_INPUT]: "transparent-tile"
}


export default function Game({ wordleId, gameInfo }) {

    if (gameInfo == null) {
        return <></>
    }

    const [curWord, setCurWord] = useState([])
    const emptyWord = { letter: "", correctness: LETTER_INPUT }

    const fillWord = (word) => {
        // console.log(word.length)
        if (word.length == 5) {
            return word
        }
        return [...word, ...Array(5 - word.length).fill(emptyWord)]
    }


    useEffect(() => {
        const handleKeyDown = (e) => {
            let curKey = e.key.toUpperCase()
            if (/^[A-Z]$/.test(curKey)) {
                if (curWord.length < 5) {
                    setCurWord(word => {
                        return [...word, { letter: curKey, correctness: LETTER_INPUT }]
                    })
                }
            } else if (curKey == "BACKSPACE") {
                if (curWord.length > 0) {
                    setCurWord(word => {
                        return [...word].slice(0, word.length - 1)
                    })
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [curWord])

    let freeRows = []
    if (gameInfo.attempts.length < 5) {
        freeRows = Array(5 - (gameInfo.attempts.length)).fill(
            Array(5).fill(emptyWord)
        )
    }

    return <>
        <h6>Wordle ID : {wordleId}</h6>
        <h6>Game Info : {JSON.stringify(gameInfo, null, 4)}</h6>

        <div className="game-container">
            {
                [
                    ...gameInfo.attempts,
                    fillWord(curWord),
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
            {/* <input style={{ border: "2px solid #CFD2CF", padding: "8px", marginTop: "24px" }} placeholder="Input.." type="text" name="guess-input" id="guess-input" /> */}
        </div>
    </>
}