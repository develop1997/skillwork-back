import { Request, Response, Router } from "express";
import { UserDAO } from "../dao/UserDAO";
import { CreateUserBodyValidations } from "../middlewares/UserValidations";
import { User } from "../entities/User";
import { ErrorControl } from "../constants/ErrorControl";
export class UserController extends UserDAO {
	private router: Router;

	constructor() {
		super();
		this.router = Router();
	}

	public routes(): Router {
		// add
		this.router.post(
			"/",
			CreateUserBodyValidations,
			async (req: Request, res: Response) => {
				const user = User.fromJson(req.body);
				const data = await UserDAO.add(user);
				if (data[0]==ErrorControl.SUCCESS) {
					return res.status(data[2]).send("User created successfully: " + data[1]);
				}
				return res.status(data[2]).send(data[1]);
			}
		);

		// sign in
		this.router.post("/signin", async (req: Request, res: Response) => {
			const { email, password } = req.body;
			const data = await UserDAO.signIn(email, password);
			return res.status(data[2]).send(data[1]);
		});

		// forgot password (send)
		this.router.post("/forgot_password", async (req: Request, res: Response) => {
			const { email } = req.body;
			const data = await UserDAO.forgorPassword(email);
			return res.status(data[2]).send(data[1]);
		});

		// forgot password (verify code)
		this.router.post("/forgot_password/verify_code", async (req: Request, res: Response) => {
			const { email, code } = req.body;
			const data = await UserDAO.verifyForgotPasswordCode(email, code);
			return res.status(data[2]).send(data[1]);
		})

		// forgot password (reset)
		this.router.post("/forgot_password/reset", async (req: Request, res: Response) => {
			const { email, code, password } = req.body;
			const data = await UserDAO.resetPassword(email, code, password);
			return res.status(data[2]).send(data[1]);
		})

		return this.router;
	}
}
