import React, { useState } from 'react'
import WordleTab from './WordleTab'

function Tabs({ wordleInterface, wallet }) {

    const [curTab, setCurTab] = useState(0)
    const tabs = [
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
        {
            "title": "Challenges",
            "component": () => <h1>Challenges</h1>
        }
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