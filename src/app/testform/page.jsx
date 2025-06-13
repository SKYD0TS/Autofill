"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo, Suspense } from "react";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";

import * as QuestionComponents from '@/components/FormComponent';
import { redirect, useRouter, useSearchParams } from "next/navigation";

// !INFO for cold caching
// const formData = require('@/data/formData.json');

export default function Home() {
    const { data: session, SessionStatus } = useSession()
    const [data, setData] = useState({});
    const [formData, setFormData] = useState();
    const [responderUri, setResponderUri] = useState("");
    const [respondCount, setRespondCount] = useState(1);
    const [invalidForm, setInvalidForm] = useState(false);
    const [items, setItems] = useState([]);
    const [redirectStatus, setRedirectStatus] = useState();
    const router = useRouter();
    const searchParams = useSearchParams()
    const formurl = searchParams.get('formurl')
    useEffect(() => {
    },[])
    useEffect(() => {
        if (session && session?.accessToken && typeof formData == "undefined") {
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
    }, [session, formurl]);
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
        console.log("run")
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
                const pickedUrl = generatePickedURL(pickAll(formInputData), responderUri);
                console.log(pickedUrl,"sss")
                urls.push(pickedUrl)
            }
        }else{
            alert("ada form yang belum terisi")
            return
        }
        try {
            const response = await fetch('/api/send-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urls:urls }), // Send the URLs in the request body
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message); // Success message
            } else {
                console.log(data.failedRequests); // Display failed URLs
            }
        } catch (error) {
            console.log('Failed to fetch data', error);
        }

        console.log(invalidForm)
    };

    if (!items) {
        return
    }

    return (
        <Suspense fallback={<div className="suspense-fallback"></div>}>
        <div>
            <h1>Welcome, {session?.user.name??null}!</h1>
            <p>Your email: {session?.user.email??null}</p>
            <LogoutButton />
            <label htmlFor="">respond count: </label><input type="number" value={respondCount} onChange={(e) => { setRespondCount(e.target.value) }} />
            <form onSubmit={onSubmit} action={"/result"}>
                {items.map((item) => {
                    const qid = item.questionId;
                    const values = data[qid] || [];
                    const totalChance = parseFloat(values.reduce((acc, o) => acc + o.chance, 0))

                    //text questions
                    if (item.questionText) {
                        return (
                            <div key={item.itemId}>
                                <hr />
                                <p className="question-required">{item.required ? "required" : null}</p>
                                <h4>{item.title} {item.questionId}</h4>
                                <ul>
                                    {/* {options.map((opt, idx) => */}
                                    {values.map((opt, idx) =>
                                        <li style={{ display: 'flex', gap: '1rem' }} key={`${qid}_${idx}`}>
                                            {item.type == "SHORT_ANSWER" ?
                                                <input
                                                    placeholder="sa"
                                                    value={opt.option}
                                                    onChange={(e) => updateOption(qid, idx, e.target.value)}
                                                />
                                                :
                                                <textarea
                                                    placeholder="sa"
                                                    value={opt.option}
                                                    onChange={(e) => updateOption(qid, idx, e.target.value)}
                                                ></textarea>
                                            }
                                            <input
                                                value={opt.chance}
                                                type="range"
                                                min="0"
                                                max="100"
                                                step={1}
                                                placeholder="Chance"
                                                onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                tabIndex={-1}
                                            />
                                            <input
                                                value={opt.chance}
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="Chance"
                                                onChange={(e) => updateChance(qid, idx, e.target.value)}
                                            />
                                            <p>{totalChance < 1 ? "0.00" : parseFloat(opt.chance / totalChance * 100).toFixed(2).toString()}</p>
                                            {/* {item.required && totalChance < 1 ?
                                                <p>no possible option on required question</p> :
                                                opt.option == "" && opt.chance > 0 ?<p>empty option on required question</p> :
                                                    null} */}
                                            {totalChance < 1 && item.required ? (
                                                <p>no possible option on required question</p>
                                            ) : opt.option === "" && opt.chance > 0 ? (
                                                <p>empty option on required question</p>
                                            ) : null}
                                        </li>
                                    )}
                                </ul>
                                <button type="button" onClick={() => addOption(qid)}>+ Add Option</button>
                            </div>
                        )
                    }

                    // grid questions
                    else if (item.type.includes("GRID")) {
                        return (
                            <div key={item.itemId}>
                                <hr />
                                <h4>{item.title} {item.questionId}</h4>
                                <ul>
                                    {item.questions.map((q, idx) => {
                                        const qid = q.questionId
                                        const values = data[qid] || [];
                                        const totalChance = parseFloat(values.reduce((acc, o) => acc + o.chance, 0))
                                        return (
                                            <li key={qid} >
                                                <p className="question-required">{q.required ? "required" : null}</p>
                                                <label htmlFor="">{q.title} {q.questionId}</label>
                                                <ul>
                                                    {values.map((opt, idx) =>
                                                        <li key={`${qid}_${idx}`} style={{ display: 'flex', gap: '1rem' }}>
                                                            <input
                                                                value={opt.option}
                                                                readOnly={!opt.isOther}
                                                                onChange={(e) => {
                                                                    if (opt.isOther) {
                                                                        return updateOption(qid, idx, e.target.value);
                                                                    }
                                                                }}
                                                                tabIndex={opt.isOther ? 0 : -1}
                                                                style={{
                                                                    width: '150px',
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                    fontSize: '1rem',
                                                                    padding: '0.25rem',
                                                                    minWidth: '150px',
                                                                    outline: opt.isOther ? '1px solid lightgray' : 'none',
                                                                    cursor: opt.isOther ? 'text' : 'default'
                                                                }}
                                                            />
                                                            <input
                                                                value={opt.chance}
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                placeholder="Chance"
                                                                onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                                tabIndex={-1}
                                                            />
                                                            <input
                                                                value={opt.chance}
                                                                min="0"
                                                                max="100"
                                                                type="number"
                                                                placeholder="Chance"
                                                                onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                            />
                                                            {item.type.includes("CHECKBOX") ?
                                                                null :
                                                                <p>{totalChance < 1 ? "0.00" : parseFloat(opt.chance / totalChance * 100).toFixed(2).toString()}</p>}

                                                            {q.required && totalChance < 1 ?
                                                                <p>no possible option on required question</p> :
                                                                null}
                                                        </li>
                                                    )}
                                                </ul>
                                                {item.options.find((q) => q.isOther == "true") ?
                                                    <button type="button" onClick={() => addOption(qid)}>+ Add Option</button>
                                                    : null}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    }
                    return (
                        <div key={item.itemId}>
                            <hr />
                            <p className="question-required">{item.required ? "required" : null}</p>
                            <h4>{item.title} {item.questionId}</h4>
                            {/* <h4>{item.title}</h4> */}
                            <ul>
                                {/* new */}
                                {values.map((opt, idx) => {
                                    const values = data[qid] || []
                                    return (
                                        <li key={qid + "" + idx} style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                value={opt.option}
                                                readOnly={!opt.isOther}
                                                onChange={(e) => {
                                                    if (opt.isOther) {
                                                        return updateOption(qid, idx, e.target.value);
                                                    }
                                                }}
                                                tabIndex={opt.isOther ? 0 : -1}
                                                style={{
                                                    width: '150px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    fontSize: '1rem',
                                                    padding: '0.25rem',
                                                    minWidth: '150px',
                                                    outline: opt.isOther ? '1px solid lightgray' : 'none',
                                                    cursor: opt.isOther ? 'text' : 'default'
                                                }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={opt.chance}
                                                onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                style={{ width: '80px' }}
                                                tabIndex={-1}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={opt.chance}
                                                onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                style={{ width: '80px' }}
                                            />
                                            {item.type.includes("CHECKBOX") ?
                                                null
                                                : <p>{totalChance < 1 ? "0.00" : parseFloat(opt.chance / totalChance * 100).toFixed(2).toString()}</p>}
                                            {item.required && totalChance < 1 ?
                                                <p>no possible option on required question</p> :
                                                null}
                                        </li>
                                    )
                                })}
                            </ul>
                            {item.options.find((q) => q.isOther == true) ?
                                <button type="button" onClick={() => addOption(qid, item.type === "CHECKBOX" ? true : false)}>+ Add Option</button>
                                : null}
                        </div>
                    );
                })}
                <button type="submit">SUBMIT</button>
            </form>
        </div>
        </Suspense>
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


const generatePickedURL = (pickedData, url) => {
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
