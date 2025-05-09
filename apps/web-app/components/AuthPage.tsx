"use client"

import axios from "axios";
import { useState } from "react";
import { redirect } from "next/navigation";

const BACKEND_URL=process.env.NEXT_PUBLIC_API_URL

const AuthPage = ({ isSignin }: { isSignin: boolean }) => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    const handlesignin = async () => {
        const res = await axios.post(`${BACKEND_URL}/signin`, {
            username: email,
            password: password
        }, {
            withCredentials: true, // Important: Send/receive cookies
        })
        // console.log(res.data);
        if (res.data.success) {
            setMessage(res.data.success)
            redirect("/joinroom")
        }
        setMessage(res.data.message)
    }
    const handlesignup = async () => {
        const res = await axios.post(`${BACKEND_URL}/signup`, {
            username: email,
            password: password,
            name: name
        })
        // console.log(res.data);
        if (res.data.success) {
            setMessage(res.data.success)
            redirect("/signin")
        }
        setMessage(res.data.message)

    }

    return (
        <div>
            {!isSignin && <div>
                name<input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
            </div>}
            <div>
                email<input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                password<input type="text" placeholder="Email" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button onClick={isSignin ? handlesignin : handlesignup}>{isSignin ? "signin" : "signup"}</button>
            {message && < div className=" rounded-2xl border p-2 w-full h-12">
                {message}
            </div>
            }
        </div >
    );
}

export default AuthPage;