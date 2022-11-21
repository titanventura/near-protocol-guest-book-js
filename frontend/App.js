import 'regenerator-runtime/runtime';
import React from 'react';
import SignIn from './components/SignIn';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Tabs from './components/Tabs';

const App = ({ isSignedIn, wordleInterface, wallet }) => {
    const signIn = () => { wallet.signIn() }
    const signOut = () => { wallet.signOut() }

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
                    ? <Tabs
                        wordleInterface={wordleInterface}
                        wallet={wallet}
                    />
                    : <SignIn />
            }
            <ToastContainer />
        </main >
    );
};

export default App;