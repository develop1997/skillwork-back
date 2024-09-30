import { Request, Response, Router } from "express";
import { JobDAO } from "../dao/JobDAO";
import { Job } from "../entities/Job";
import { CreateJobBodyValidations } from "../middlewares/JobValidations";
import { validateClient, verifyToken } from "../middlewares/jwt";

export class JobController extends JobDAO {
	private router: Router;
	constructor() {
		super();
		this.router = Router();
	}

	public routes(): Router {
		// add
		this.router.post(
			"/",
			CreateJobBodyValidations,
			verifyToken,
			validateClient,
			async (req: Request, res: Response) => {
				const job = Job.fromJson(req.body);
				const data = await JobDAO.add(job, req.body.user.id);
				return res.status(data[2]).send(data[1]);
			}
		);

		// get all
		this.router.get(
			"/",
			verifyToken,
			async (req: Request, res: Response) => {
				const data = await JobDAO.getAll();
				return res.status(data[2]).send(data[1]);
			}
		);

		// get by id
		this.router.get(
			"/:id_job",
			verifyToken,
			async (req: Request, res: Response) => {
				const id_job = req.params.id_job;
				const data = await JobDAO.get(id_job);
				return res.status(data[2]).send(data[1]);
			}
		);

		// update
		this.router.put(
			"/:id_job",
			CreateJobBodyValidations,
			verifyToken,
			validateClient,
			async (req: Request, res: Response) => {
				const id_job = req.params.id_job;
				const user_id = req.body.user.id;
				const job = Job.fromJson(req.body);
				const data = await JobDAO.update(job, id_job, user_id);
				return res.status(data[2]).send(data[1]);
			}
		);

		// delete
		this.router.delete(
			"/:id_job",
			verifyToken,
			validateClient,
			async (req: Request, res: Response) => {
				const id_job = req.params.id_job;
				const user_id = req.body.user.id;
				const data = await JobDAO.delete(id_job, user_id);
				return res.status(data[2]).send(data[1]);
			}
		);

		return this.router;
	}
}
