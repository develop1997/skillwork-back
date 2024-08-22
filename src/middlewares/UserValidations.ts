import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { createDebugger } from "../utils/debugConfig";

const middlewareDebugger= createDebugger('userValidations');

export const UserBodyValidations = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const schema = Joi.object({
		name: Joi.string().optional(),
		last_name: Joi.string().optional(),
		email: Joi.string().required(),
		phone: Joi.string().optional(),
		password: Joi.string().required(),
		role: Joi.number().required(),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		middlewareDebugger(error.details[0].message);
		return res.status(404).send(error.details[0].message);
	}

	next();
};
