"use client"

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL=process.env.NEXT_PUBLIC_API_URL

const CreateRoom = () => {

    const [roomName, setRoomName] = useState("")
    const [message, setMessage] = useState("")

    const router = useRouter()

    const handleCreate = async () => {
        const response = await axios.post(`${BACKEND_URL}/room`, {
            name: roomName
        }, { withCredentials: true })   //Pass Cookies Explicitly in API Requests
        if (response.data.success) {
            setMessage(response.data.success)
        } else setMessage(response.data.message)
    }

    const handleJoin = () => {
        router.push("/joinroom")
    }

    return (
        <div className=" flex flex-col gap-3 items-center justify-center min-h-screen p-3 rounded-full">
            <label>Room name</label>
            <input type="text" onChange={e => setRoomName(e.target.value)} />
            <button onClick={handleCreate}>Create room</button>
            <div className=" rounded-2xl border p-2 gap-2 min-w-screen">
                <button onClick={handleJoin}>Join Room</button>
            </div>
            {message && < div className=" rounded-2xl border p-2 w-full h-12">
                {message}
            </div>
            }
        </div>
    );
}

export default CreateRoom;