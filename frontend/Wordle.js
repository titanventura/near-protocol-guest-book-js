import 'regenerator-runtime/runtime';
import React, { useState } from 'react';
import SignIn from './components/SignIn';
import Game from './components/Game';

const Wordle = ({ isSignedIn, wordleInterface, wallet }) => {
    const signIn = () => { wallet.signIn() }
    const signOut = () => { wallet.signOut() }
    const wordleRequest = async () => {
        const solveWordleResponse = await wordleInterface.solveNewWordle()

        console.log(solveWordleResponse, " response")

        const {
            msg,
            wordle_id,
            game,
            success
        } = solveWordleResponse

        if (!success) {
            console.error(msg)
            return
        }

        setWordleId(wordle_id)
        setGameInfo(game)
    }

    const [wordleId, setWordleId] = useState("asdad")
    const [gameInfo, setGameInfo] = useState({
        attempts: [
            [{ letter: "A", correctness: -1 },
            { letter: "A", correctness: 2 },
            { letter: "A", correctness: -1 },
            { letter: "A", correctness: -1 },
            { letter: "A", correctness: 1 }]
        ]
    })

    return (
        <main>
            <table>
                <tbody>
                    <tr>
                        <td><h1>📖 NEAR Wordle</h1></td>
                        <td>{isSignedIn
                            ? <button onClick={signOut}>Log out</button>
                            : <button onClick={signIn}>Log in</button>
                        }</td>
                    </tr>
                </tbody>
            </table>

            <hr />
            {
                isSignedIn
                    ? (
                        wordleId == null ?
                            <button onClick={wordleRequest}>Solve Wordle</button>
                            : <Game wordleId={wordleId} gameInfo={gameInfo} />
                    )
                    : <SignIn />
            }
            {/* {!!isSignedIn && !!messages.length && <Messages messages={messages} />} */}
        </main >
    );
};

export default Wordle;