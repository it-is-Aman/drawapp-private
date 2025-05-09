import axios from 'axios';

const BACKEND_URL=process.env.NEXT_PUBLIC_API_URL

export default async function inDraw(canvas: HTMLCanvasElement, socket: WebSocket, id: number) {

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return null
    }

    // @ts-ignore
    let selectTool = window.selectTool
    // @ts-ignore
    console.log(window.selectTool);
    


    type ShapesProps = {
        type: "rectangle",
        x: number,
        y: number,
        width: number,
        height: number,
    } |
    {
        type: "circle",
        centerX: number,
        centerY: number,
        radius: number
    }

    const existingShapes: ShapesProps[] = await getShapes(id)
    // console.log(existingShapes);

    let clicked = false
    let startX: number;
    let startY: number;
    let endX: number
    let endY: number
    let centerX: number
    let centerY: number
    let radius: number

    const handleMouseDown = (e: MouseEvent) => {
        clicked = true
        // console.log(e.clientX);
        startX = e.screenX
        startY = e.screenY
    }
    const handleMouseUp = (e: MouseEvent) => {
        clicked = false
        endX = e.screenX - startX
        endY = e.screenY - startY
        centerX = startX + endX / 2
        centerY = startY + endY / 2
        radius = Math.max(endX, endY) / 2

        let Shape: ShapesProps | null = null

        if (selectTool === "rectangle") {
            Shape = {
                type: "rectangle", x: startX, y: startY, width: endX, height: endY
            };
        } else if (selectTool === "circle") {
            Shape = {
                type: "circle", centerX: centerX, centerY: centerY, radius: radius
            };
        }

        if (!Shape) {
            return
        }

        console.log(Shape);

        existingShapes.push(Shape)

        // check the way data is sending to web socket
        socket.send(JSON.stringify({
            type: "chat",
            roomId: Number(id),
            message: JSON.stringify(Shape)
        }))

    }
    const handleMouseMove = (e: MouseEvent) => {
        if (clicked) {
            endX = e.screenX - startX
            endY = e.screenY - startY

            // remove and generate shape while mousemove in realtime
            clearFill(canvas, ctx, existingShapes)
            if (selectTool === "rectangle") {

                ctx.strokeStyle = "rgba(255,255,255)"
                ctx.strokeRect(startX, startY, endX, endY)

            } else if (selectTool === "circle") {
                centerX = startX + endX / 2
                centerY = startY + endY / 2
                radius = Math.max(endX, endY) / 2

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
            }
        }

    }

    // Cleaning up event listeners on unmount otherwise event listeners stacking up every time
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mousemove", handleMouseMove)

    function clearFill(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, existingShapes: ShapesProps[]) {
        // clear everything on canvas
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        // make canvas in black bg
        ctx.fillStyle = "rgba(0, 0, 0)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // create 2d existing shapes
        existingShapes.map(s => {
            if (s.type === "rectangle") {
                ctx.strokeStyle = "rgba(255,255,255)"
                ctx.strokeRect(s.x, s.y, s.width, s.height)
            } else if (s.type === "circle") {
                ctx.beginPath();
                ctx.arc(s.centerX, s.centerY, s.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
            }
        })
    }

    // Cleaning up event listeners on unmount otherwise event listeners stacking up every time
    return () => {
        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mouseup", handleMouseUp)
        canvas.removeEventListener("mousemove", handleMouseMove)
    }
}
async function getShapes(id: number) {
    const response = await axios.get(`${BACKEND_URL}/chats/${id}`)

    // array of chats [{id: 4, roomId: 1, message: '{type: "rectangle", x: 0, y: 0, w: 24, h: 52}', userId: '4d-sd7-asda'}]
    const chats = response.data.chats

    const Shapes = chats.map((x: { message: string }) => {
        const message = JSON.parse(x.message)
        return message
    })
    return Shapes
}

