import { Request, Response, Router } from "express";
import { UserDAO } from "../dao/UserDAO";
import { UserBodyValidations } from "../middlewares/UserValidations";
import { User } from "../entities/User";
export class CategoriaController extends UserDAO {
	private router: Router;

	constructor() {
		super();
		this.router = Router();
	}

	public routes(): Router {
		// // add
		this.router.post(
			"/",
			UserBodyValidations,
			async (req: Request, res: Response) => {
					const user = User.fromJson(req.body);
					const data = await UserDAO.add(user);
					if (data[0]) {
						return res.status(201).send("User created successfully");
					}
					return res.status(400).send("User not created");
			}
		);

		return this.router;
	}
}
