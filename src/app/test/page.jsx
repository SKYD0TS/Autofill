"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { getToken } from "next-auth/jwt";

export default function Home() {
    const [url, seturl] = useState("")
    const { data: session, SessionStatus } = useSession()
    function handleClick() {
        console.log("click!")
        if (url.includes('docs.google.com') && session) {
            console.log(url)
            const formId = url.split('/').at(-2)
            console.log(formId)
            getstructure(formId, session)
        }
    }
    function handleChange(value) {
        seturl(value)
    }
    useEffect(() => {
    }, [url])

    if (!session) {
        return <b>stop</b>
    }

    return (
        <div>
            <h1>Hello</h1>
            <input type="text" style={{ width: '70%' }} onChange={(e) => handleChange(e.target.value)} value={url} />
            <button onClick={handleClick}>CLICK</button>
        </div>
    )

}

async function getstructure(formId, session) {
    const linkTemplate = `https://forms.googleapis.com/v1/forms/${formId}?accessToken=${session.accessToken}`

    // const res = await fetch(linkTemplate);
    // const data = await res.json();
    // console.log(data)

}
    