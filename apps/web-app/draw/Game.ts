import { Tools } from "../components/CanvasPage"
import { getShapes } from "./getShapes"

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

export class Game {
    // Core properties
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private socket: WebSocket
    private id: number
    private existingShapes: ShapesProps[]
    private selectTool: Tools = "rectangle"

    // Drawing state properties
    private clicked: boolean
    private startX: number
    private startY: number

    constructor(canvas: HTMLCanvasElement, socket: WebSocket, id: number) {
        this.canvas = canvas
        this.socket = socket
        this.id = id
        this.startX = 0
        this.startY = 0
        this.clicked = false
        this.existingShapes = []

        // Get the 2D rendering context for drawing
        this.ctx = canvas.getContext("2d")!

        this.init()
        this.handleEvents()
    }

    // Set the currently selected drawing tool
    Tools = (tool: Tools) => {
        this.selectTool = tool
    }

    // Initialize by loading existing shapes and rendering them
    init = async () => {
        this.existingShapes = await getShapes(this.id)
        this.clearFill()
    }

    // Clear canvas and redraw all existing shapes
    clearFill = () => {
        // Clear canvas and set black background
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw all existing shapes from our collection
        this.existingShapes.map(s => {
            this.ctx.strokeStyle = "rgba(255,255,255)"
            if (s.type === "rectangle") {
                this.ctx.strokeRect(s.x, s.y, s.width, s.height)
            } else if (s.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(s.centerX, s.centerY, s.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        })
    }

    // Set up mouse event listeners
    handleEvents = () => {
        this.canvas.addEventListener("mousedown", this.handleMouseDown)
        this.canvas.addEventListener("mouseup", this.handleMouseUp)
        this.canvas.addEventListener("mousemove", this.handleMouseMove)
    }

    // When mouse is pressed, start drawing by recording the position
    handleMouseDown = (e: MouseEvent) => {
        this.clicked = true
        // Convert viewport coordinates to canvas-relative coordinates
        const rect = this.canvas.getBoundingClientRect()
        this.startX = e.clientX - rect.left
        this.startY = e.clientY - rect.top
    }

    // When mouse is released, finish drawing and save the shape
    handleMouseUp = (e: MouseEvent) => {
        if (!this.clicked) return
        this.clicked = false

        // Get current position relative to canvas
        const rect = this.canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top

        // Calculate dimensions
        const width = currentX - this.startX
        const height = currentY - this.startY

        let Shape: ShapesProps | null = null

        // Create the appropriate shape based on selected tool
        if (this.selectTool === "rectangle") {
            Shape = {
                type: "rectangle",
                x: this.startX,
                y: this.startY,
                width: width,
                height: height
            };
        } else if (this.selectTool === "circle") {
            // For circles, calculate center and radius
            const centerX = this.startX + width / 2
            const centerY = this.startY + height / 2
            const radius = Math.sqrt(width * width + height * height) / 2

            Shape = {
                type: "circle",
                centerX: centerX,
                centerY: centerY,
                radius: radius
            };
        }

        if (!Shape) return

        // Add to existing shapes collection
        this.existingShapes.push(Shape)

        // Send shape data to server via WebSocket
        this.socket.send(JSON.stringify({
            type: "chat",
            roomId: Number(this.id),
            message: JSON.stringify(Shape)
        }))
    }

    // As mouse moves, show shape preview in real-time
    handleMouseMove = (e: MouseEvent) => {
        if (!this.clicked) return

        // Get current position relative to canvas
        const rect = this.canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top

        // Calculate dimensions for current shape
        const width = currentX - this.startX
        const height = currentY - this.startY

        // Redraw canvas to show current shape
        this.clearFill()
        this.ctx.strokeStyle = "rgba(255,255,255)"

        // Draw appropriate preview based on selected tool
        if (this.selectTool === "rectangle") {
            this.ctx.strokeRect(this.startX, this.startY, width, height)
        } else if (this.selectTool === "circle") {
            const centerX = this.startX + width / 2
            const centerY = this.startY + height / 2
            const radius = Math.sqrt(width * width + height * height) / 2

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    // Clean up event listeners to prevent memory leaks
    destroy = () => {
        this.canvas.removeEventListener("mousedown", this.handleMouseDown)
        this.canvas.removeEventListener("mouseup", this.handleMouseUp)
        this.canvas.removeEventListener("mousemove", this.handleMouseMove)
    }
}