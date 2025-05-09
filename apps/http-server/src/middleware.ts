import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const JWT_SECRET=process.env.JWT_SECRET as string

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // const token = req.headers["authorization"] ?? "";

    // console.log(req.cookies);

    const token = req.cookies["token"]
    // console.log(token);


    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded) {
        // @ts-ignore: TODO: Fix this
        req.userId = decoded.userId;
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}