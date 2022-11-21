import React, { useState } from 'react'
import WordleTab from './WordleTab'

function Tabs({ wordleInterface, wallet }) {

    const [curTab, setCurTab] = useState(0)
    const tabs = [
        {
            "title": "About",
            "component": () => {
                return <>
                    <h3>A wordle a day, gets a NEAR your way 😉</h3>
                    <h6>Solve a wordle by depositing 1 NEAR. You get back 2 if you win !!</h6>
                </>
            }
        },
        {
            "title": "Wordles",
            "component": () => {
                return (
                    <WordleTab
                        wordleInterface={wordleInterface}
                    />
                )
            }
        },
    ]

    return (
        <>
            <div className='tabs-container'>
                {
                    tabs.map((tab, idx) => {
                        return (
                            <div
                                key={idx}
                                className={`tab-header ${idx == curTab && "tab-selected"}`}
                                onClick={() => setCurTab(idx)}
                            >
                                {tab.title}
                            </div>
                        )
                    })
                }
            </div>
            <div className='tab-content'>
                {
                    tabs[curTab].component()
                }
            </div>
        </>
    )
}

export default Tabs