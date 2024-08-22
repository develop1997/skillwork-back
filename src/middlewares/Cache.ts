import { Request, Response } from "express";
import { Cache } from "../utils/cache";
import { createDebugger } from "../utils/debugConfig";

const middlewareDebugger= createDebugger('cache');

export const CheckCache = async (req: Request, res: Response, next: any) => {
    const cacheKey = req.method + req.originalUrl;
    const cachedData = Cache.get(cacheKey);
    if (cachedData) {
        middlewareDebugger(`Cache found for ${cacheKey}`);
        return res.status(200).send(cachedData);
    } else {
        req.body.cacheKey = cacheKey;
        next();
    }

}