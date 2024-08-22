import { getDateTime } from "../utils/Time";

export class User {
	public static readonly COLLECTION = "users";

	id_user?: string;
	name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
	role?: number;
	password?: string;
	created_at?: Date;

	constructor(
		id_user?: string,
		name?: string,
		last_name?: string,
		email?: string,
		phone?: string,
		password?: string,
		created_at?: Date,
		role?: number
	) {
		this.id_user = id_user;
		this.name = name;
		this.last_name = last_name;
		this.email = email;
		this.phone = phone;
		this.password = password;
		this.created_at = created_at;
		this.role = role;
	}

	public static fromJson(json: any): User {
		return new User(
			json.id_user,
			json.name,
			json.last_name,
			json.email,
			json.phone,
			json.password,
			json.created_at,
			json.role
		);
	}

	public toSaveJson(): any {
		return {
			name: this.name ?? "Guest",
			last_name: this.last_name ?? "Guest",
			email: this.email,
			phone: this.phone ?? "x",
			password: this.password,
			created_at: getDateTime(),
			role: this.role ?? 1,
		};
	}

	public static fromJsonArray(jsonArray: any[]): User[] {
		return jsonArray.map((json: any) => User.fromJson(json));
	}

	/* json example
	{
		"id_user": "1sorefnpifendw",
		"name": "john",
		"last_name": "doe",
		"email": "9zTqQ@example.com",
		"phone": "1234567890",
		"password": "password123",
		"role":1
	}
	*/
}
