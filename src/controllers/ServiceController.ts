import { Request, Response, Router } from "express";
import { ServiceDAO } from "../dao/ServiceDAO";

export class ServiceController extends ServiceDAO {
	private router: Router;

	constructor() {
		super();
		this.router = Router();
	}

	public routes(): Router {
		// get all
		this.router.get("/", async (req: Request, res: Response) => {
			const { categories } = req.body;
			const data = await ServiceDAO.getAll(categories);
			return res.status(data[2]).send(data[1]);
		});

		return this.router;
	}
}
