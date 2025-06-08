"use client"
import { useForm } from "react-hook-form"
const formData = [
    {name:"a", title:"a"},
    {name:"b", title:"b"},
    {name:"c", title:"c"},
    {name:"c", title:"2nd c"},
    {name:"c", title:"3rd c"},
]
export default function Home() {
    
    function addMore(e){
        //make this add more input with the same name(field)
        e.target.parentNode.append(<p>ass</p>)
        console.log()
    }

    return(
        <div>
            <h1>Hello</h1>
            <form action="">
                {formData.map((i,index)=>
                    <div key={i.name+index}>
                        <label htmlFor="">{i.title}</label>
                        <input type="text" name={i.name}/>
                        <button type="button" onClick={(e)=>addMore(e)} >Add more</button>
                    </div>
                )}
            </form>
        </div>
    )

}
