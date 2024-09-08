import { config } from "dotenv";
import { User } from "../entities/User";
import { addDoc, collection, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../service/firebaseDB";
import { createDebugger } from "../utils/debugConfig";
import { ComparePassword, EncriptPassword } from "../utils/cryptography/encrypt";
import { sign } from "jsonwebtoken";
import { fromDefault, sendMail } from "../utils/Email/SendEmail";
import { generateCode } from "../utils/Email/VerificationCode";
import { Cache } from "../utils/cache";

config();

// logger config
const log = createDebugger('UserDAO');
const logError = log.extend('error');

export class UserDAO {

	public static async signIn(email: string, password: string) {
		try {
			//get user by email
			const usersRef = collection(db, User.COLLECTION);
			const q = query(usersRef, where("email", "==", email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				throw new Error("User not found");
			}
			const user = User.fromJson(querySnapshot.docs[0].data());

			//compare password
			const passwordMatch = await ComparePassword(
				password,
				user.password
			);
			if (!passwordMatch) {
				throw new Error(
					"Password incorrect"
				);
			}

			// create token and return it
			const token = sign(
				{ id: user.id_user, email, role: user.role },
				process.env.JWT_SECRET as string,
				{
					expiresIn: process.env.JWT_EXPIRATION_TIME,
				}
			);
			return [true, {
				token: token,
				role: user.role
			}];
		} catch (error) {
			const msg = "Error in sign in: " + error;
			logError(msg);
			return [false, msg];
		}
	}

	protected static async add(user: User) {
		try {
			// verify if email already exists

			const usersRef = collection(db, User.COLLECTION);
			const q = query(usersRef, where("email", "==", user.email));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				throw new Error("Email already exists");
			}

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
			const msg = "Error adding document: " + e;
			logError(msg);
			return [false, msg];
		}
	}

	protected static async forgorPassword(email: string) {

		try {
			// verify if email already exists
			const usersRef = collection(db, User.COLLECTION);
			const q = query(usersRef, where("email", "==", email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				throw new Error("Email not found");
			}

			const code = generateCode(6);

			const info = await sendMail({
				from: fromDefault,
				to: email,
				subject: "Forgot password",
				text: "Your verification code: " + code
			})

			if (!info[0]) {
				throw new Error("Email not sent, error: " + info[1]);
			}
			const key = "forgot_password_code_" + email;
			Cache.set(key, code);

			return [true, "Email sent"];
		} catch (e) {
			const msg = "Error sending email: " + e;
			logError(msg);
			return [false, msg];
		}
	}

	protected static async verifyForgotPasswordCode(email: string, code: string) {
		try {
			const key = "forgot_password_code_" + email;
			const cachedCode = Cache.get(key);

			if (!cachedCode) {
				throw new Error("Code not found");
			}

			if (cachedCode !== code) {
				throw new Error("Code incorrect");
			}

			// make sure code is not expired
			Cache.makeInfinite(key);

			return [true, "Code correct"];
		} catch (error) {
			const msg = "Error verifying code: " + error;
			logError(msg);
			return [false, msg];
		}
	}

	protected static async resetPassword(email: string, code: string, password: string) {
		try {
			const key = "forgot_password_code_" + email;
			const cachedCode = Cache.get(key);

			if (!cachedCode) {
				throw new Error("Code not found");
			}

			if (cachedCode !== code) {
				throw new Error("Code incorrect");
			}
			// remove code 
			Cache.delete(key);

			// encrypt password
			const hashedPassword = await EncriptPassword(password);
			// update password
			const usersRef = collection(db, User.COLLECTION);
			const q = query(usersRef, where("email", "==", email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				throw new Error("Email not found");
			}

			const userRef = querySnapshot.docs[0].ref;

			await updateDoc(userRef, {
				password: hashedPassword
			});
			return [true, "Password updated"];
		} catch (error) {
			const msg = "Error updating password: " + error;
			logError(msg);
			return [false, msg];
		}
	}

	protected static async update(user: User, id_user: number) {
		throw new Error("Method not implemented.");
	}

	protected static async delete(id_user: number) {
		throw new Error("Method not implemented.");
	}
}
