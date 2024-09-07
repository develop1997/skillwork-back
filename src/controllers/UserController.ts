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
		// add
		this.router.post(
			"/",
			UserBodyValidations,
			async (req: Request, res: Response) => {
				const user = User.fromJson(req.body);
				const data = await UserDAO.add(user);
				if (data[0]) {
					return res.status(201).send("User created successfully: " + data[1]);
				}
				return res.status(400).send(data[1]);
			}
		);

		// sign in
		this.router.post("/signin", async (req: Request, res: Response) => {
			const { email, password } = req.body;

			const user = await UserDAO.signIn(email, password);

			if (user[0]) {
				return res.status(200).send(user[1]);
			}

			return res.status(400).send(user[1]);
		});

		// forgot password (send)
		this.router.post("/forgot_password", async (req: Request, res: Response) => {
			const { email } = req.body;
			const data = await UserDAO.forgorPassword(email);
			if (data[0]) {
				return res.status(200).send(data[1]);
			}
			return res.status(400).send(data[1]);
		});

		// forgot password (verify code)
		this.router.post("/forgot_password/verify_code", async (req: Request, res: Response) => {
			const { email, code } = req.body;
			const data = await UserDAO.verifyForgotPasswordCode(email, code);
			if (data[0]) {
				return res.status(200).send(data[1]);
			}
			return res.status(400).send(data[1]);
		})

		// forgot password (reset)
		this.router.post("/forgot_password/reset", async (req: Request, res: Response) => {
			const { email, code, password } = req.body;
			console.log("email: ", email, "code: ", code, "password: ", password);
			const data = await UserDAO.resetPassword(email, code, password);
			if (data[0]) {
				return res.status(200).send(data[1]);
			}
			return res.status(400).send(data[1]);
		})

		return this.router;
	}
}
