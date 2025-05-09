import { ReactNode } from "react"

interface layoutProps {
    icon: ReactNode,
    onclick: () => void,
    activated: boolean
}

export default function LayoutIcon({ icon, onclick, activated }: layoutProps) {

    return (
        <>
            <div className={` rounded-full m-2 p-2 ${activated ? "text-red-600" : "text-white"} cursor-pointer`}
                onClick={onclick}
            >
                {icon}
            </div >
        </>
    )
}
