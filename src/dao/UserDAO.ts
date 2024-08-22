import { config } from "dotenv";
import { User } from "../entities/User";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../service/firebaseDB";
import { createDebugger } from "../utils/debugConfig";
import { EncriptPassword } from "../utils/cryptography/encrypt";

config();

// logger config
const log = createDebugger('UserDAO');
const logError = log.extend('error');

export class UserDAO {

	public static async signIn(email: string, clave: string) {
		// return await db
		// 	.task(async (t: pgPromise.IDatabase<any>) => {
		// 		//get user
		// 		const user = User.fromJson(
		// 			await t.oneOrNone(UserRepository.GET_BY_EMAIL, [email])
		// 		);
		// 		if (!user) {
		// 			throw new HelperError("Error in sign in: User not found");
		// 		}
		// 		//decrypt password using crypto
		// 		const claveDecrypted = decryptContent(clave);

		// 		//compare password
		// 		const passwordMatch = await ComparePassword(
		// 			claveDecrypted,
		// 			user.password
		// 		);
		// 		if (!passwordMatch) {
		// 			throw new HelperError(
		// 				"Error in sign in: Password incorrect"
		// 			);
		// 		}

		// 		// create token and return it
		// 		const token = sign(
		// 			{ id: user.id_user, email, role: user.role },
		// 			process.env.JWT_SECRET as string,
		// 			{
		// 				expiresIn: process.env.JWT_EXPIRATION_TIME,
		// 			}
		// 		);
		// 		return token;
		// 	})
		// 	.then((token) => {
		// 		return token;
		// 	})
		// 	.catch((err) => {
		// 		console.log(err);
		// 		throw new Error("Error in sign in");
		// 	});

		throw new Error("Method not implemented.");
	}

	protected static async add(user: User) {
		try {
			// encrypt password
			user.password = await EncriptPassword(user.password);
			// convert user to json
			const userTosave = user.toSaveJson();
			// save user
			const docRef = await addDoc(collection(db, User.COLLECTION),
				userTosave);
			log("Document written with ID: %s", docRef.id);
			return [true, docRef.id];
		} catch (e) {
			logError("Error adding document: %O", e);
		}

		return [false, null];
	}

	protected static async update(user: User, id_user: number) {
		throw new Error("Method not implemented.");
	}

	protected static async delete(id_user: number) {
		throw new Error("Method not implemented.");
	}
}
