import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Game, { IN_PROGRESS, LOST, WON } from './Game'



const wordleStyleMap = {
    [IN_PROGRESS]: "gray-tile",
    [WON]: "green-tile",
    [LOST]: "red-tile"
}
function WordleTab({ wordleInterface }) {


    const [allWordles, setAllWordles] = useState([])
    const [wordleId, setWordleId] = useState(null)
    const [gameInfo, setGameInfo] = useState(null)


    const wordleRequest = async () => {
        toast.loading("Please wait...", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: false
        })

        const existingWordleResponse = await wordleInterface.existingWordle()
        console.log(existingWordleResponse)
        if (existingWordleResponse.wordle_id === null) {
            const solveWordleResponse = await wordleInterface.solveNewWordle()

            console.log(solveWordleResponse, " response")

            const {
                msg,
                wordle_id,
                game,
                success
            } = solveWordleResponse

            if (!success) {
                toast.dismiss()
                toast.error(`Error ${msg}`, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000
                })
                return
            }
            setWordleId(wordle_id)
            setGameInfo(game)
        } else {
            setWordleId(existingWordleResponse.wordle_id)
            setGameInfo(existingWordleResponse.game)
        }

        toast.dismiss()
    }

    const submitGuess = async (guess) => {
        toast.loading("Submitting guess...", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: false
        })

        const guessResponse = await wordleInterface.submitGuess(wordleId, guess)
        toast.dismiss()
        if (guessResponse.success === true) {
            if (guessResponse.game.status == WON) {
                toast.success("Congrats. You won the game 🎉 !", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000
                })
            } else if (guessResponse.game.status == LOST) {
                toast.error("Oh no. You lost the game 😞 !", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000
                })
            }
            setGameInfo(guessResponse.game)
        } else {
            toast.error(`Error ${guessResponse.msg}`, {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 5000
            })
        }
    }

    const clearGame = () => {
        setGameInfo(null)
        setWordleId(null)
        setAllWordles([])
        loadAllWordles()
    }

    const loadAllWordles = async function () {
        toast.loading("Loading your wordles..", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: false
        })
        const _allWordles = []
        const allWordlesResponse = await wordleInterface.allWordlesByUser()
        if (allWordlesResponse != null && allWordlesResponse != undefined) {
            Object.entries(allWordlesResponse)
                .forEach(([wordleId, gameInfo]) => {
                    _allWordles.push({ wordleId, gameInfo })
                })
        }

        setAllWordles(_allWordles)
        toast.dismiss()
    }
    useEffect(() => {
        loadAllWordles()
    }, [setAllWordles])

    return wordleId != null ? <Game
        clearGame={clearGame}
        gameInfo={gameInfo}
        submitGuess={submitGuess}
        wordleId={wordleId}
    /> : <>
        <div className='wordle-list-container'>
            <div className='wordle-list-header'>
                <h3>Wordles by you</h3>
                <button onClick={wordleRequest}>Solve</button>
            </div>
            <div>
                <p style={{ opacity: 0.5, fontSize: "16px" }}>
                    Note: Upon clicking solve, you can get to try a new wordle only if you have no pending ones
                </p>
            </div>
            <div>
                {allWordles.map(({ wordleId, gameInfo }, idx) => {
                    return (
                        <div className='wordle-list-item' key={idx}>
                            <h4>Wordle # {wordleId}</h4>
                            <span>{gameInfo.attempts && gameInfo.attempts.length} / 5 attempts</span>
                            <span className={`badge ${wordleStyleMap[gameInfo.status]}`}>
                                {
                                    gameInfo.status == IN_PROGRESS ? "In Progress" :
                                        gameInfo.status == WON ? "Won" : "Lost"
                                }
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    </>
}

export default WordleTab