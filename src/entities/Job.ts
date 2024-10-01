import { DocumentReference } from "firebase/firestore";
import { getDateTime } from "../utils/Time";

export class Job {
	public static readonly COLLECTION = "jobs";

	id_job?: string;
	id_creator?: DocumentReference;
	title?: string;
	description?: string;
	location?: string;
	required_skills?: string[];
	salary?: number;
	created_at?: Date;
	expired_at?: Date;
	applicants?: DocumentReference[];

	constructor(
		id_job?: string,
		id_creator?: DocumentReference,
		title?: string,
		description?: string,
		location?: string,
		required_skills?: string[],
		salary?: number,
		created_at?: Date,
		expired_at?: Date,
		applicants?: DocumentReference[]
	) {
		this.id_job = id_job;
		this.id_creator = id_creator;
		this.title = title;
		this.description = description;
		this.location = location;
		this.required_skills = required_skills;
		this.salary = salary;
		this.created_at = created_at;
		this.expired_at = expired_at;
		this.applicants = applicants;
	}

	public static fromJson(json: any): Job {
		return new Job(
			json.id_job,
			json.id_creator,
			json.title,
			json.description,
			json.location,
			json.required_skills,
			json.salary,
			json.created_at,
			json.expired_at,
			json.applicants
		);
	}

	public toSaveJson(): any {
		return {
			id_creator: this.id_creator,
			title: this.title,
			description: this.description,
			location: this.location,
			required_skills: this.required_skills,
			salary: this.salary,
			created_at: getDateTime(),
			expired_at: this.expired_at,
			applicants: this.applicants,
		};
	}

	public static fromJsonArray(jsonArray: any[]): Job[] {
		return jsonArray.map((json: any) => Job.fromJson(json));
	}

	/* json example
    {
        "id_creator": "1",
        "title": "title",
        "description": "description",
        "location": "location",
        "required_skills": ["skill1", "skill2"],
        "salary": 1000,
        "expired_at": "2022-01-01T00:00:00.000Z"
    }
    */
}
