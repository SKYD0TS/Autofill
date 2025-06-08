"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo } from "react";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";

import * as QuestionComponents from '@/components/FormComponent';
const formData = require('@/data/formData.json');

export default function Home() {
    const items = useMemo(() => restructureFormData(formData), [formData]);
    const { data: session, SessionStatus } = useSession()
    const [data, setData] = useState({});

    // old
    // const updateChance = (qid, index, newValue) => {
    //     setData(prev => {
    //         const newChances = [...prev[`${qid}_chances`]];
    //         newChances[index] = parseFloat(newValue);
    //         return { ...prev, [`${qid}_chances`]: newChances };
    //     });
    // };

    // old
    // const updateOption = (qid, index, newValue) => {
    //     setData(prev => {
    //         const newOptions = [...prev[`${qid}_options`]];
    //         newOptions[index] = newValue;
    //         return { ...prev, [`${qid}_options`]: newOptions };
    //     });
    // };

    // old
    // const addOption = (qid) => {
    //     setData(prev => {
    //         const newOptions = [...prev[`${qid}_options`], 'New Option'];
    //         const newChances = [...prev[`${qid}_chances`], 0];
    //         return {
    //             ...prev,
    //             [`${qid}_options`]: newOptions,
    //             [`${qid}_chances`]: newChances
    //         };
    //     });
    // };

    // // old logic
    // useEffect(() => {
    //     if (!items || items.length === 0) return;

    //     const result = {};
    //     items.forEach((item) => {
    //         const qid = item.questionId;
    //         const options = item.options?.filter((i) => i.value).map(opt => opt.value);
    //         const chances = new Array(options?.length).fill(0);
    //         if (item.type === 'RADIO' || item.type === 'CHECKBOX' || item.type === 'DROP_DOWN') {
    //             result[`${qid}_options`] = options;
    //             result[`${qid}_chances`] = chances;
    //         } else if (item.type === 'LINEAR_SCALE' || item.type === 'RATING') {
    //             result[`${qid}_options`] = item.options;
    //             result[`${qid}_chances`] = new Array(item.options.length).fill(0);
    //         } else if (item.type === 'MULTIPLE_CHOICE_GRID' || item.type === 'CHECKBOX_GRID') {
    //             const options = item.options;
    //             const chances = new Array(options?.length).fill(0);
    //             item.questions.forEach((r) => {
    //                 const qid = r.questionId
    //                 result[`${qid}_options`] = options; // For short answer, paragraph, etc.
    //                 result[`${qid}_chances`] = chances;
    //             })
    //         } else {
    //             result[`${qid}_options`] = ['']; // For short answer, paragraph, etc.
    //             result[`${qid}_chances`] = [0];

    //         }
    //     });

    //     setData(result);
    // }, [items]);

    const updateChance = (qid, index, newValue) => {
        setData(prev => {
            const updated = [...prev[qid]];
            updated[index] = { ...updated[index], chance: parseFloat(newValue) };
            return { ...prev, [qid]: updated };
        });
    };

    // const updateChance = (qid, index, newValue) => {
    //     setData(prev => {
    //     const group = [...prev[qid]];
    //     const parsedValue = parseFloat(newValue, 2);

    //     // Check if options are dependent
    //     const isDependent = group.every(opt => !opt.independentChance);

    //     if (!isDependent) {
    //         // Fallback to normal update
    //         group[index] = { ...group[index], chance: parsedValue };
    //         return { ...prev, [qid]: group };
    //     }

    //     // Total we want to maintain (e.g., 1.0)
    //     const TOTAL = 100;

    //     // Set new value to selected index
    //     group[index] = { ...group[index], chance: parsedValue };

    //     // Sum of other chances
    //     const otherIndices = group.map((_, i) => i).filter(i => i !== index);
    //     const remaining = TOTAL - parsedValue;
    //     const oldSum = otherIndices.reduce((sum, i) => sum + group[i].chance, 0);

    //     // Redistribute proportionally
    //     otherIndices.forEach(i => {
    //         const old = group[i].chance;
    //         const newChance = oldSum > 0 ? (old / oldSum) * remaining : remaining / otherIndices.length;
    //         group[i] = { ...group[i], chance: parseFloat(newChance.toFixed(6)) };
    //     });

    //     return { ...prev, [qid]: group };
    //     });
    // };


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
                        chance: 0,
                        independentChance: true
                    }));
                } else {
                    result[`${baseQid}`] = options.map(opt => ({
                        option: opt,
                        chance: 0
                    }));
                }
            } else if (item.type === 'LINEAR_SCALE' || item.type === 'RATING') {
                const options = item.options || [];
                result[`${baseQid}`] = options.map(opt => ({
                    option: opt,
                    chance: 0
                }));
            } else if (item.type === 'MULTIPLE_CHOICE_GRID' || item.type === 'CHECKBOX_GRID') {
                const options = item.options || [];
                item.questions.forEach((r) => {
                    const qid = r.questionId;
                    if (item.type == 'CHECKBOX_GRID') {
                        result[`${qid}`] = options.map(opt => ({
                            option: opt,
                            chance: 0,
                            independentChance: true
                        }));
                    } else {
                        result[`${qid}`] = options.map(opt => ({
                            option: opt,
                            chance: 0,
                        }));
                    }
                });
            } else {
                // Short answer, paragraph, etc.
                result[`${baseQid}`] = [{
                    option: '',
                    chance: 0
                }];
            }
        });

        setData(result);
    }, [items]);


    // submit handler
    const onSubmit = async (e) => {
        e.preventDefault()
        const formData = Object.entries(data).reduce((acc, [qid, entries]) => {
            acc[qid] = entries.map(entry => ({
                option: entry.option,
                chance: entry.chance,
                isOther: entry.isOther || false,
                independentChance: entry.independentChance || false
            }));

            return acc;
        }, {});
        console.log({ formData, data })
        console.log(pickAll(formData))

        const pickedUrl = generatePickedURL(pickAll(formData));
        console.log({ pickedUrl })
        // window.location.href = pickedUrl;

        // try {
        //     const response = await fetch('/api/submit-form', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(formData)
        //     });

        //     if (response.ok) {
        //         const result = await response.json();
        //         console.log('Form submitted successfully:', result);
        //     } else {
        //         console.error('Form submission failed:', response.statusText);
        //     }
        // } catch (error) {
        //     console.error('Error submitting form:', error);
        // }

    };

    if (SessionStatus === "loading" || !session) {
        return <div>Loading...</div>;
    }


    return (
        <div>
            <h1>Welcome, {session.user.name}!</h1>
            <p>Your email: {session.user.email}</p>
            <LogoutButton />
            <hr />
            <form onSubmit={onSubmit} action={"/result"}>
                {items.map((item) => {
                    const qid = item.questionId;

                    //old
                    // const options = data[`${qid}_options`] || [];
                    // const chances = data[`${qid}_chances`] || [];

                    const values = data[qid] || [];
                    if (item.questionText) {
                        return (
                            <div key={item.itemId}>
                                <hr />
                                <h4>{item.title} {item.questionId}</h4>
                                <ul>
                                    {/* {options.map((opt, idx) => */}
                                    {values.map((opt, idx) =>
                                        <li key={`${qid}_${idx}`}>
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
                                        </li>
                                    )}
                                </ul>
                                <button type="button" onClick={() => addOption(qid)}>+ Add Option</button>
                            </div>
                        )
                    }
                    else if (item.type.includes("GRID")) {
                        return (
                            <div key={item.itemId}>
                                <hr />
                                <h4>{item.title} {item.questionId}</h4>
                                <ul>
                                    {item.questions.map((q, idx) => {
                                        const qid = q.questionId
                                        // old
                                        // const chances = data[`${qid}_chances`] || [];
                                        // const options = data[`${qid}_options`] || [];

                                        const values = data[qid] || [];
                                        return (
                                            <li key={qid} >
                                                <label htmlFor="">{q.title} {q.questionId}</label>
                                                <ul>
                                                    {/* {options.map((opt, idx) => */}
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
                                        </li>
                                    )
                                })}
                            </ul>
                            {item.options.find((q) => q.isOther == true) ?
                                <button type="button" onClick={() => addOption(qid, item.type === "CHECKBOX" ? true : false)}>+ Add Option</button>
                                : null}
                        </div>
                    );
                    // }
                })}
                <button type="submit">SUBMIT</button>
            </form>
        </div>
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
                // options = question.choiceQuestion.options.filter((i)=>i.value)
                options = question.choiceQuestion.options
            }
            return {
                itemId,
                title,
                type: questionType,
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

        // Check for questionGroupItem (for grid type questions)
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
                    title: q.rowQuestion.title
                })),
            };
        }

        // If no valid questionItem or questionGroupItem, return null or handle appropriately
        return null;
    }).filter(item => item !== null);
}

function independentPick(options) {
    return options.filter(opt => Math.random() < opt.chance);
}

function weightedPick(options) {
    const total = options.reduce((sum, o) => sum + o.chance, 0);
    const rand = Math.random() * total;
    let acc = 0;

    for (const opt of options) {
        acc += opt.chance;
        if (rand <= acc) return opt;
    }

    // fallback (shouldn't happen unless total = 0)
    return options[0];
}

function pickAll(data) {
    const result = {};

    for (const [qid, options] of Object.entries(data)) {
        const isIndependent = options.some(opt => opt.independentChance === true);

        if (isIndependent) {
            result[qid] = independentPick(options);
        } else {
            result[qid] = [weightedPick(options)];
        }
    }

    return result;
}

const generatePickedURL = (data) => {
    const params = new URLSearchParams();

    Object.entries(data).forEach(([qid, entries]) => {
        entries.forEach(entry => {
            if (entry.chance > 0) {
                if (entry.isOther) {
                    params.append(`entry.${qid}.other_option_response`, entry.option);
                    params.append(`entry.${qid}`, "__other_option__");
                } else {
                    params.append(`entry.${qid}`, entry.option);
                }
            }
        });
    });

    return `/result?${params.toString()}`;
};

