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

    const updateOption = (qid, index, newValue) => {
        setData(prev => {
            const updated = [...prev[qid]];
            updated[index] = { ...updated[index], option: newValue };
            return { ...prev, [qid]: updated };
        });
    };

    const addOption = (qid, independentChance=false) => {
        if(independentChance){
            setData(prev => {
                const updated = [...prev[qid], { option: 'New Option', chance: 0, isOther:true, independentChance:true }];
                return { ...prev, [qid]: updated };
            });
        }else{
            setData(prev => {
                const updated = [...prev[qid], { option: 'New Option', chance: 0, isOther:true }];
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
                if(item.type == "CHECKBOX"){
                    result[`${baseQid}`] = options.map(opt => ({
                        option: opt,
                        chance: 0,
                        independentChance: true
                    }));
                }else{
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
                    if(item.type == 'CHECKBOX_GRID'){    
                        result[`${qid}`] = options.map(opt => ({
                            option: opt,
                            chance: 0,
                            independentChance:true
                        }));
                    }else{
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
        console.log(data)
        // const formData = Object.keys(data).reduce((acc, key) => {
        //     if (key.includes("chances")) return acc
        //     const [qid, suffix] = key.split('_');
        //     let answers = []
        //     data[key].forEach((opt, idx) => {
        //         answers.push({
        //             answer: opt,
        //             chance: data[`${qid}_chances`][idx],
        //         })
        //     })
        //     acc[qid] = { ...answers }
        //     return acc
        // }, {});
        const formData = Object.entries(data).reduce((acc, [qid, entries]) => {
            // acc[qid] = entries.map(entry => ({
            //     answer: entry.option,
            //     chance: entry.chance
            // }));
            acc[qid] = entries.map(entry => ({
                answer: entry.option,
                chance: entry.chance,
                independentChance: entry.independentChance || false
            }));

            return acc;
        }, {});


        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Form submitted successfully:', result);
            } else {
                console.error('Form submission failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }

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
                                                type="number"
                                                value={opt.chance}
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
                                            <li key={qid}>
                                                <label htmlFor="">{q.title} {q.questionId}</label>
                                                <ul>
                                                    {/* {options.map((opt, idx) => */}
                                                    {values.map((opt, idx) =>
                                                        <li key={`${qid}_${idx}`}>
                                                            <input
                                                                value={opt.option}
                                                                readOnly={!opt.isOther}
                                                                onChange={(e) => {
                                                                if (opt.isOther) {
                                                                    return updateOption(qid, idx, e.target.value);
                                                                }}}
                                                            />
                                                            <input
                                                                value={opt.chance}
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
                                                }}}
                                                style={{ width: '150px' }}
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={opt.chance}
                                                onChange={(e) => updateChance(qid, idx, e.target.value)}
                                                style={{ width: '80px' }}
                                            />
                                        </li>
                                    )
                                })}
                            </ul>
                            {item.options.find((q) => q.isOther == true) ?
                                <button type="button" onClick={() => addOption(qid,item.type==="CHECKBOX"?true:false)}>+ Add Option</button>
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