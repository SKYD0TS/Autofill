"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo } from "react";
import LogoutButton from "@/components/GoogleIO/OauthLogoutButton";

import * as QuestionComponents from '@/components/FormComponent';
import { redirect, useRouter, useSearchParams } from "next/navigation";
// const formData = require('@/data/formData.json');

export default function Home() {
    // const items = useMemo(() => restructureFormData(formData), [formData]);
    const { data: session, SessionStatus } = useSession()
    const [data, setData] = useState({});
    const [formData, setFormData] = useState();
    const [items, setItems] = useState([]);
    // const router = useRouter();
    // const formurl = router.query.formurl; 
    const searchParams = useSearchParams()
    const formurl = searchParams.get('formurl')
    useEffect(() => {
        if (session && session?.accessToken && typeof formData == "undefined") {
            const fetchGoogleForm = async () => {
                try {
                    const res = await fetch(`/api/google-form?accessToken=${session.accessToken}&formurl=${formurl}`);
                    console.log('FETCH:::', `/api/google-form?accessToken=${session.accessToken}&formurl=${formurl}`)
                    const data = await res.json();
                    setFormData(data);
                    // console.log(data)
                } catch (error) {
                    console.error('Error fetching form data:' + error);
                }
            };

            fetchGoogleForm();
        }
    }, [session]);
    useEffect(() => {
        console.log(formData)
        if(formData){
            setItems(restructureFormData(formData))
        }else{
            redirect('/?formurlfail=1')
        }
    },[formData])
    
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
                result[`${baseQid}`] = [{
                    option: '',
                    chance: 0
                }];
            }
        });

        setData(result);
    }, [items]);

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
        const pickedUrl = generatePickedURL(pickAll(formData));
        console.log({ pickedUrl })

    };

    if (SessionStatus === "loading") {
        return <div>Loading...</div>;
    }


    return (
        <div>
            <h1>Welcome, {session?.user.name ?? "loading..."}!</h1>
            <p>Your email: {session?.user.email ?? "loading..."}</p>
            <LogoutButton />
            <hr />
            <form onSubmit={onSubmit} action={"/result"}>
                {items.map((item) => {
                    const qid = item.questionId;
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

const generatePickedURL = (data, url) => {
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

    return `${url}?${params.toString()}`;
};

