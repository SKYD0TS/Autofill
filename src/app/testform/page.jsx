"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo, Suspense } from "react";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";
import * as QuestionComponents from '@/components/FormComponent';
import { redirect, useRouter, useSearchParams } from "next/navigation";
import './formstyle.css';
import feather from 'feather-icons';
// !INFO for cold caching
// const formData = require('@/data/formData.json');

function Home() {
    const { data: session, SessionStatus } = useSession()
    const [data, setData] = useState({});
    const [formData, setFormData] = useState({
        "formId": "16Qc7HE83jrph5NvQEqGcQjQyy58MgVj3eyeuWMziOwg",
        "info": {
            "title": "Test",
            "description": "ts test",
            "documentTitle": "fulltest"
        },
        "settings": {
            "emailCollectionType": "DO_NOT_COLLECT"
        },
        "revisionId": "000000ad",
        "responderUri": "https://docs.google.com/forms/d/e/1FAIpQLSdi8v0DHEWvSg-HkPbOopq5ej79pba_njR1pYhfbjNCbOld0Q/viewform",
        "items": [
            {
                "itemId": "100812a8",
                "title": "-Short answer",
                "questionItem": {
                    "question": {
                        "questionId": "3cdeef13",
                        "required": true,
                        "textQuestion": {}
                    }
                }
            },
            {
                "itemId": "405a3d7a",
                "title": "-Paragraph",
                "questionItem": {
                    "question": {
                        "questionId": "469fc9bd",
                        "required": true,
                        "textQuestion": {
                            "paragraph": true
                        }
                    }
                }
            },
            {
                "itemId": "2d817e03",
                "title": "-Multiple Choice",
                "questionItem": {
                    "question": {
                        "questionId": "4588b4ea",
                        "required": true,
                        "choiceQuestion": {
                            "type": "RADIO",
                            "options": [
                                {
                                    "value": "Option 1"
                                },
                                {
                                    "value": "Option 2"
                                },
                                {
                                    "value": "Option 3"
                                },
                                {
                                    "isOther": true
                                }
                            ]
                        }
                    }
                }
            },
            {
                "itemId": "677876d4",
                "title": "-Checkbox",
                "questionItem": {
                    "question": {
                        "questionId": "354fbf08",
                        "required": true,
                        "choiceQuestion": {
                            "type": "CHECKBOX",
                            "options": [
                                {
                                    "value": "Option 1"
                                },
                                {
                                    "value": "Option 2"
                                },
                                {
                                    "value": "Option 3"
                                },
                                {
                                    "isOther": true
                                }
                            ]
                        }
                    }
                }
            },
            {
                "itemId": "28624453",
                "title": "-Dropdown",
                "questionItem": {
                    "question": {
                        "questionId": "2ebb19e7",
                        "required": true,
                        "choiceQuestion": {
                            "type": "DROP_DOWN",
                            "options": [
                                {
                                    "value": "Option 1"
                                },
                                {
                                    "value": "Option 2"
                                },
                                {
                                    "value": "Option 3"
                                }
                            ]
                        }
                    }
                }
            },
            {
                "itemId": "065f9a4b",
                "title": "-Linear scale",
                "questionItem": {
                    "question": {
                        "questionId": "5b406587",
                        "required": true,
                        "scaleQuestion": {
                            "low": 1,
                            "high": 5,
                            "lowLabel": "bad",
                            "highLabel": "good"
                        }
                    }
                }
            },
            {
                "itemId": "36e54d49",
                "title": "-Ratings",
                "questionItem": {
                    "question": {
                        "questionId": "3dff5f9f",
                        "required": true,
                        "ratingQuestion": {
                            "ratingScaleLevel": 5,
                            "iconType": "STAR"
                        }
                    }
                }
            },
            {
                "itemId": "3b1cd726",
                "questionGroupItem": {
                    "questions": [
                        {
                            "questionId": "10ab4c0f",
                            "required": true,
                            "rowQuestion": {
                                "title": "Row 1"
                            }
                        },
                        {
                            "questionId": "060669f0",
                            "required": true,
                            "rowQuestion": {
                                "title": "Row 2"
                            }
                        },
                        {
                            "questionId": "78e152a0",
                            "required": true,
                            "rowQuestion": {
                                "title": "Row 3"
                            }
                        }
                    ],
                    "grid": {
                        "columns": {
                            "type": "RADIO",
                            "options": [
                                {
                                    "value": "Column 1"
                                },
                                {
                                    "value": "Column 2"
                                },
                                {
                                    "value": "Column 3"
                                }
                            ]
                        }
                    }
                },
                "title": "-Multiple-choice grid"
            },
            {
                "itemId": "69a40a49",
                "questionGroupItem": {
                    "questions": [
                        {
                            "questionId": "1afeb843",
                            "required": true,
                            "rowQuestion": {
                                "title": "Row 1"
                            }
                        },
                        {
                            "questionId": "3870e9ed",
                            "required": true,
                            "rowQuestion": {
                                "title": "Row 2"
                            }
                        },
                        {
                            "questionId": "0d043cf8",
                            "required": true,
                            "rowQuestion": {
                                "title": "Row 3"
                            }
                        }
                    ],
                    "grid": {
                        "columns": {
                            "type": "CHECKBOX",
                            "options": [
                                {
                                    "value": "Column 1"
                                },
                                {
                                    "value": "Column 2"
                                },
                                {
                                    "value": "Column 3"
                                }
                            ]
                        }
                    }
                },
                "title": "-Tick box grid"
            }
        ],
        "publishSettings": {
            "publishState": {
                "isPublished": true,
                "isAcceptingResponses": true
            }
        }
    });
    const [responderUri, setResponderUri] = useState("");
    const [respondCount, setRespondCount] = useState(1);
    const [respondDelay, setRespondDelay] = useState(1);
    const [invalidForm, setInvalidForm] = useState(false);
    const [googleUserToken, setGoogleUserToken] = useState(null);
    const [items, setItems] = useState([]);
    const [redirectStatus, setRedirectStatus] = useState();
    const [formurl, setformurl] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const fetchGoogleUserToken = async () => {
        try {
            // Call the API route to get the token
            const response = await fetch(`/api/get-token?email=${session.user.email}`);
            if (response.ok) {
                const data = await response.json();
                setGoogleUserToken(data.token_count); // Set the token count
            } else {
                const errorData = await response.json();
                console.error(errorData.error);
                setGoogleUserToken(null); // Set to null if no token found
            }
        } catch (error) {
            console.error("Error fetching Google user's token:", error);
            setGoogleUserToken(null);
        }
    };
    const [isClient, setIsClient] = useState(false); // To ensure client-side execution
    useEffect(() => {
        feather.replace();  // Replaces <i> elements with feather icons
        setIsClient(true); // Set to true once the component is mounted on the client
    }, []);

    useEffect(() => {
        if (isClient) {
            setformurl(searchParams.get('formurl'));
        }
    },);

    useEffect(() => {
        if (session?.user?.email) {
            fetchGoogleUserToken();
        }
    }, [session]);

    useEffect(() => {
        if (session && session?.accessToken && typeof formData == "undefined" && formurl) {
            const fetchGoogleForm = async () => {
                try {
                    const res = await fetch(`/api/google-form?accessToken=${session?.accessToken}&formurl=${formurl}`);
                    const data = await res.json();
                    console.log(data)
                    setRedirectStatus(data.status)
                    setFormData(data);
                    setResponderUri(data.responderUri);
                } catch (error) {
                    console.error('Error fetching form data:' + error);
                }
            };
            fetchGoogleForm();
        }
    }, [session?.accessToken, formurl]);

    useEffect(() => {
        if (!formData) {
            return
        }
        if (!formData.error) {
            setItems(restructureFormData(formData))
        } else if (redirectStatus == 401) {
            redirect('/?formurlfail=3')
        } else if (formData.error) {
            redirect('/?formurlfail=1')
        }
    }, [formData])

    useEffect(() => {
        let isInvalid = false;

        items.forEach((item) => {
            const qid = item.questionId;
            const values = data[qid] || [];

            values.forEach((opt) => {
                const totalChance = parseFloat(values.reduce((acc, o) => acc + o.chance, 0));
                if (item.required && totalChance < 1) {
                    isInvalid = true;
                }

                if (opt.option === "" && opt.chance > 0) {
                    isInvalid = true;
                }
            });
        });

        setInvalidForm(isInvalid);
    }, [data, items]);

    const updateChance = (qid, index, newValue) => {
        setData(prev => {
            const updated = [...prev[qid]];
            updated[index] = { ...updated[index], chance: parseFloat(newValue) };
            return { ...prev, [qid]: updated };
        });
    };

    const updateOption = (qid, index, newValue) => {
        setData(prev => {
            const updated = [...prev[qid]];
            updated[index] = { ...updated[index], option: newValue };
            return { ...prev, [qid]: updated };
        });
    };

    const addOption = (qid, independentChance = false) => {
        const canOther = items.find((i) => i.questionId == qid).questionText ? false : true
        if (independentChance) {
            setData(prev => {
                const updated = [...prev[qid], { option: 'New Option', chance: 0, isOther: canOther, independentChance: true }];
                return { ...prev, [qid]: updated };
            });
        } else {
            setData(prev => {
                const updated = [...prev[qid], { option: 'New Option', chance: 0, isOther: canOther }];
                return { ...prev, [qid]: updated };
            });
        }
    };

    useEffect(() => {
        if (!items || items.length === 0) return;

        const result = {};

        items.forEach((item) => {
            const baseQid = item.questionId;

            if (item.type === 'RADIO' || item.type === 'CHECKBOX' || item.type === 'DROP_DOWN') {
                const options = item.options?.filter((i) => i.value).map(opt => opt.value) || [];
                if (item.type == "CHECKBOX") {
                    result[`${baseQid}`] = options.map(opt => ({
                        option: opt,
                        chance: 50,
                        independentChance: true
                    }));
                } else {
                    result[`${baseQid}`] = options.map(opt => ({
                        option: opt,
                        chance: 50
                    }));
                }
            } else if (item.type === 'LINEAR_SCALE' || item.type === 'RATING') {
                const options = item.options || [];
                result[`${baseQid}`] = options.map(opt => ({
                    option: opt,
                    chance: 50
                }));
            } else if (item.type === 'MULTIPLE_CHOICE_GRID' || item.type === 'CHECKBOX_GRID') {
                const options = item.options || [];
                item.questions.forEach((r) => {
                    const qid = r.questionId;
                    if (item.type == 'CHECKBOX_GRID') {
                        result[`${qid}`] = options.map(opt => ({
                            option: opt,
                            chance: 50,
                            independentChance: true
                        }));
                    } else {
                        result[`${qid}`] = options.map(opt => ({
                            option: opt,
                            chance: 50,
                        }));
                    }
                });
            } else {
                result[`${baseQid}`] = [{
                    option: '',
                    chance: 100
                }];
            }
        });
        setData(result);
    }, [items]);

    const onSubmit = async (e) => {
        e.preventDefault()
        const formInputData = Object.entries(data).reduce((acc, [qid, entries]) => {
            let found = items.find((e) => {
                if (e.type.includes("GRID")) {
                    return e.questions.some((q) => q.questionId == qid)
                } else {
                    return e.questionId == qid
                }

            })
            found = found.type.includes('GRID') ? found.questions.find((q) => q.questionId == qid) : found
            acc[qid] = entries.map(entry => ({
                option: entry.option,
                chance: entry.chance,
                isOther: entry.isOther || false,
                independentChance: entry.independentChance || false,
                isRequired: found.required ?? false
            }));
            return acc;
        }, {});
        let urls = []
        if (!invalidForm) {
            for (let r = 0; r < respondCount; r++) {
                const pickedUrl = generatePickedURL(pickAll(formInputData), responderUri, formurl);
                console.log(pickedUrl, "sss")
                urls.push(pickedUrl)
            }
        } else {
            alert("ada form yang belum terisi")
            return
        }
        try {
            const response = await fetch('/api/send-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urls: urls, delay: respondDelay, email: session.user.email }), // Send the URLs in the request body
            });

            const data = await response.json();
            if (response.ok) {
                fetchGoogleUserToken()
                console.log(data.message); // Success message
            } else {
                fetchGoogleUserToken()
                console.log(data.failedRequests); // Display failed URLs
            }
        } catch (error) {
            console.log('Failed to fetch data', error);
        }

    };

    if (!items) {
        return
    }

    return (
        <>

            <header>
                <div className="token-count">
                    <i data-feather="user"></i>
                    <p>000</p>
                    <button>
                        <i data-feather="plus">+</i>
                    </button>
                </div>
            </header>
            <main>
                <div>
                    <label htmlFor="">respond count: </label><input type="number" min={0} max={googleUserToken} value={respondCount > googleUserToken ? 0 : respondCount} onChange={(e) => { e.target.value <= googleUserToken && e.target.value >= 1 ? setRespondCount(e.target.value) : null }} />
                    <br />
                    <label htmlFor="">delay: </label><select onChange={(e) => { setRespondDelay(e.target.value) }} >
                        <option value="1">1s</option>
                        <option value="2">2s</option>
                        <option value="3">3s</option>
                        <option value="4">4s</option>
                        <option value="5">5s</option>
                    </select>
                    <form onSubmit={onSubmit} action={"/result"} className="survey-form">
                        {items.map((item) => {
                            const qid = item.questionId;
                            const values = data[qid] || [];
                            const totalChance = parseFloat(values.reduce((acc, o) => acc + o.chance, 0));

                            // Text questions
                            if (item.questionText) {
                                return (
                                    <div key={item.itemId} className="question-container">
                                        <hr className="divider" />
                                        <p className="question-required">{item.required ? "Required" : null}</p>
                                        <h4 className="question-title">{item.title} {item.questionId}</h4>
                                        <ul className="options-list">
                                            {values.map((opt, idx) => (
                                                <li key={`${qid}_${idx}`} className="option-item">
                                                    <div className="input-container">
                                                        {item.type === "SHORT_ANSWER" ? (
                                                            <input
                                                                className="short-answer"
                                                                placeholder="Short answer"
                                                                value={opt.option}
                                                                onChange={(e) => updateOption(qid, idx, e.target.value)}
                                                            />
                                                        ) : (
                                                            <textarea
                                                                className="long-answer"
                                                                placeholder="Long answer"
                                                                value={opt.option}
                                                                onChange={(e) => updateOption(qid, idx, e.target.value)}
                                                            ></textarea>
                                                        )}
                                                    </div>
                                                    <div className="chance-container">
                                                        <input
                                                            className="chance-range"
                                                            value={opt.chance}
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            step={1}
                                                            placeholder="Chance"
                                                            onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                        />
                                                        <input
                                                            className="chance-number"
                                                            value={opt.chance}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            placeholder="Chance"
                                                            onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                        />
                                                        <p className="chance-percentage">
                                                            {totalChance < 1 ? "0.00" : parseFloat((opt.chance / totalChance) * 100).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    {totalChance < 1 && item.required ? (
                                                        <p className="error-message">No possible option on required question</p>
                                                    ) : opt.option === "" && opt.chance > 0 ? (
                                                        <p className="error-message">Empty option on required question</p>
                                                    ) : null}
                                                </li>
                                            ))}
                                        </ul>
                                        <button type="button" className="add-option-btn" onClick={() => addOption(qid)}>
                                            + Add Option
                                        </button>
                                    </div>
                                );
                            }

                            // Grid questions (same update as above for grid)
                            else if (item.type.includes("GRID")) {
                                return (
                                    <div key={item.itemId} className="grid-container">
                                        <hr className="divider" />
                                        <h4 className="question-title">{item.title} {item.questionId}</h4>
                                        <ul className="grid-list">
                                            {item.questions.map((q, idx) => {
                                                const qid = q.questionId;
                                                const values = data[qid] || [];
                                                const totalChance = parseFloat(values.reduce((acc, o) => acc + o.chance, 0));
                                                return (
                                                    <li key={qid} className="grid-item">
                                                        <p className="question-required">{q.required ? "Required" : null}</p>
                                                        <label className="grid-question-label">{q.title} {q.questionId}</label>
                                                        <ul className="options-list">
                                                            {values.map((opt, idx) => (
                                                                <li key={`${qid}_${idx}`} className="option-item">
                                                                    <input
                                                                        className="grid-input"
                                                                        value={opt.option}
                                                                        readOnly={!opt.isOther}
                                                                        onChange={(e) => {
                                                                            if (opt.isOther) {
                                                                                return updateOption(qid, idx, e.target.value);
                                                                            }
                                                                        }}
                                                                        tabIndex={opt.isOther ? 0 : -1}
                                                                    />
                                                                    <div className="chance-container">
                                                                        <input
                                                                            className="chance-range"
                                                                            value={opt.chance}
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            placeholder="Chance"
                                                                            onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                                        />
                                                                        <input
                                                                            className="chance-number"
                                                                            value={opt.chance}
                                                                            min="0"
                                                                            max="100"
                                                                            type="number"
                                                                            placeholder="Chance"
                                                                            onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                                        />
                                                                        {item.type.includes("CHECKBOX") ? null : (
                                                                            <p className="chance-percentage">
                                                                                {totalChance < 1 ? "0.00" : parseFloat((opt.chance / totalChance) * 100).toFixed(2)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    {q.required && totalChance < 1 ? (
                                                                        <p className="error-message">No possible option on required question</p>
                                                                    ) : null}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {item.options.find((q) => q.isOther === "true") && (
                                                            <button type="button" className="add-option-btn" onClick={() => addOption(qid)}>
                                                                + Add Option
                                                            </button>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            }

                            return (
                                <div key={item.itemId} className="question-container">
                                    <hr className="divider" />
                                    <p className="question-required">{item.required ? "Required" : null}</p>
                                    <h4 className="question-title">{item.title} {item.questionId}</h4>
                                    <ul className="options-list">
                                        {values.map((opt, idx) => (
                                            <li key={qid + "" + idx} className="option-item">
                                                <input
                                                    className="option-input"
                                                    value={opt.option}
                                                    readOnly={!opt.isOther}
                                                    onChange={(e) => {
                                                        if (opt.isOther) {
                                                            return updateOption(qid, idx, e.target.value);
                                                        }
                                                    }}
                                                    tabIndex={opt.isOther ? 0 : -1}
                                                />
                                                <div className="chance-container">
                                                    <input
                                                        className="chance-range"
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={opt.chance}
                                                        onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                    />
                                                    <input
                                                        className="chance-number"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={opt.chance}
                                                        onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                    />
                                                    <p className="chance-percentage">
                                                        {totalChance < 1 ? "0.00" : parseFloat((opt.chance / totalChance) * 100).toFixed(2)}
                                                    </p>
                                                </div>
                                                {item.required && totalChance < 1 ? (
                                                    <p className="error-message">No possible option on required question</p>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                    {item.options.find((q) => q.isOther === true) && (
                                        <button type="button" className="add-option-btn" onClick={() => addOption(qid, item.type === "CHECKBOX" ? true : false)}>
                                            + Add Option
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        <button type="submit" className="submit-btn">Submit</button>
                    </form>

                </div>
            </main>
        </>
    );
}

function restructureFormData(originalData) {
    return originalData.items.map(item => {
        let options
        const { itemId, title } = item;

        if (item.questionItem) {
            const { question } = item.questionItem;
            let questionType =
                question.textQuestion ? 'SHORT_ANSWER' :
                    question.choiceQuestion ? 'MULTIPLE_CHOICE' :
                        question.scaleQuestion ? 'LINEAR_SCALE' :
                            question.ratingQuestion ? 'RATING' :
                                'UNKNOWN';
            if (questionType == "SHORT_ANSWER") {
                questionType = item.questionItem.question.textQuestion.paragraph ? "PARAGRAPH" : questionType
            }
            if (question.scaleQuestion) {
                options = Array.from({ length: Math.ceil((question.scaleQuestion.high - question.scaleQuestion.low + 1)) }, (_, i) => question.scaleQuestion.low + i,)
            }
            if (question.ratingQuestion) {
                options = Array.from({ length: Math.ceil((question.ratingQuestion.ratingScaleLevel)) }, (_, i) => 1 + i,)
            }
            if (question.choiceQuestion) {
                options = question.choiceQuestion.options
            }
            return {
                itemId,
                title,
                type: questionType,
                required: question.required ?? false,
                questionId: parseInt(question.questionId, 16),
                ...(question.textQuestion && {
                    questionText: question.textQuestion
                }),
                ...(question.choiceQuestion && {
                    options: options,
                    type: question.choiceQuestion.type
                }),
                ...(question.scaleQuestion && {
                    options,
                    scale: {
                        lowLabel: question.scaleQuestion.lowLabel,
                        highLabel: question.scaleQuestion.highLabel
                    }
                }),
                ...(question.ratingQuestion && {
                    options,
                    rating: { iconType: question.ratingQuestion.iconType }
                })
            };
        }

        if (item.questionGroupItem) {
            const { questions, grid } = item.questionGroupItem;
            const columnType = grid.columns.type;
            const options = grid.columns.options.map(option => option.value);

            return {
                itemId,
                title,
                type: columnType === 'CHECKBOX' ? 'CHECKBOX_GRID' : 'MULTIPLE_CHOICE_GRID',
                options,
                questions: questions.map(q => ({
                    questionId: parseInt(q.questionId, 16),
                    title: q.rowQuestion.title,
                    required: q.required
                })),
            };
        }

        return null;
    }).filter(item => item !== null);
}

function independentPick(options, isRequired = false) {
    const result = options.filter(opt => Math.random() * 100 < opt.chance);
    return result
}

function weightedPick(options, isRequired = false) {
    const totalChance = options.reduce((acc, o) => acc + o.chance, 0.0)
    const total = options.reduce((sum, o) => sum + o.chance, 0);
    const rand = Math.random() * total;
    let acc = 0;

    for (const opt of options) {
        acc += opt.chance;
        if (rand <= acc) return opt;
    }

    return options[0];
}

function pickAll(data) {
    const result = {};

    for (const [qid, options] of Object.entries(data)) {
        // per entry
        const isIndependent = options.some(opt => opt.independentChance === true);
        const isRequired = options.some(opt => opt.isRequired === true);

        // Handle independent options separately
        if (isIndependent) {
            let picked = independentPick(options);

            // Check if no options were picked and if it's required, pick randomly
            if (isRequired && picked.length < 1) {
                picked = options[Math.floor(Math.random() * options.length)];
            }

            // Handle "Other" options if they exist and are independent
            const otherOptions = options.filter(opt => opt.isOther);

            // If no other options were picked, pick randomly
            if (otherOptions.length === 0) {
                picked = [options[Math.floor(Math.random() * options.length)]];
            } else if (otherOptions.length === 1) {
                // If exactly one "Other" option, pick that one
                picked = [otherOptions[0]];
            }

            result[qid] = picked;
        } else {
            // For non-independent options, just pick a weighted option
            const picked = [weightedPick(options)];
            result[qid] = picked;
        }
    }

    return result;
}


const generatePickedURL = (pickedData, url, formUrl) => {
    // const params = formUrl;
    const params = new URLSearchParams();

    const responderUrl = url.replace(/viewform/, "formResponse");

    Object.entries(pickedData).forEach(([qid, entries]) => {
        entries.forEach(entry => {
            if (entry.chance > 0) {
                if (entry.isOther && entry.option === "__other_option__") {
                    params.append(`entry.${qid}.other_option_response`, entry.option);
                    params.append(`entry.${qid}`, "__other_option__");
                } else if (!entry.isOther) {
                    params.append(`entry.${qid}`, entry.option);
                }
            } else {
                console.warn(`${qid} is empty`);
            }
        });
    });

    return `${responderUrl}?${params.toString()}`;
};

export default function page() {
    return (
        <Suspense fallback={<div className="suspense-fallback">loading...</div>}><Home /></Suspense>
    )
}