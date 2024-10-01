import { createDebugger } from "../utils/debugConfig";
import { Job } from "../entities/Job";
import {
	addDoc,
	and,
	collection,
	deleteDoc,
	doc,
	limit,
	startAfter,
	getDocs,
	query,
	updateDoc,
	where,
	orderBy,
	DocumentSnapshot,
	arrayUnion,
	getDoc,
	DocumentReference,
} from "firebase/firestore";
import { db } from "../service/firebaseDB";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { HttpStatusCode } from "axios";
import { User } from "../entities/User";

// logger config
const log = createDebugger("JobDAO");
const logError = log.extend("error");

export class JobDAO {
	protected static async add(
		job: Job,
		id_user: string
	): Promise<DaoResponse> {
		try {
			const jobJson = job.toSaveJson();
			const jobsRef = collection(db, Job.COLLECTION);
			const userRef = doc(db, User.COLLECTION, id_user);
			jobJson.id_creator = userRef;
			const docRef = await addDoc(jobsRef, jobJson);
			return [ErrorControl.SUCCESS, docRef.id, HttpStatusCode.Created];
		} catch (error) {
			const msg = "Error adding document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async getAll(
		page: number,
		limitP: number
	): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);

			const jobsQuery = query(
				jobsRef,
				orderBy("created_at"),
				limit(limitP)
			);

			const querySnapshot = await getDocs(jobsQuery);

			if (querySnapshot.empty) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}

			const jobs = querySnapshot.docs.map((doc) =>
				Job.fromJson({ ...doc.data(), id_job: doc.id })
			);

			if (page === 1) {
				return [ErrorControl.SUCCESS, jobs, HttpStatusCode.Ok];
			}

			const lastVisible: DocumentSnapshot =
				querySnapshot.docs[querySnapshot.docs.length - 1];

			const nextQuery = query(
				jobsRef,
				orderBy("created_at"),
				startAfter(lastVisible),
				limit(limitP)
			);

			const nextQuerySnapshot = await getDocs(nextQuery);

			if (nextQuerySnapshot.empty) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}

			const nextJobs = nextQuerySnapshot.docs.map((doc) =>
				Job.fromJson({ ...doc.data(), id_job: doc.id })
			);

			return [ErrorControl.SUCCESS, nextJobs, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error getting documents";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async get(id_job: string): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const q = query(jobsRef, where("__name__", "==", id_job));
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				return [
					ErrorControl.PERSONALIZED,
					"Job not found",
					HttpStatusCode.NotFound,
				];
			}
			return [
				ErrorControl.SUCCESS,
				Job.fromJson({
					...querySnapshot.docs[0].data(),
					id_job: querySnapshot.docs[0].id,
				}),
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error getting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async update(
		job: Job,
		id_job: string,
		id_user: string
	): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const userdocRef = doc(db, User.COLLECTION, id_user);
			const q = query(
				jobsRef,
				and(
					where("id_creator", "==", userdocRef),
					where("__name__", "==", id_job)
				)
			);
			const querySnapshot = await getDocs(q);
			const docRef = querySnapshot.docs[0].ref;
			await updateDoc(docRef, job.toSaveJson());
			return [ErrorControl.SUCCESS, docRef.id, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error updating document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async delete(
		id_job: string,
		id_user: string
	): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const userdocRef = doc(db, User.COLLECTION, id_user);
			const q = query(
				jobsRef,
				and(
					where("id_creator", "==", userdocRef),
					where("__name__", "==", id_job)
				)
			);
			const querySnapshot = await getDocs(q);
			const docRef = querySnapshot.docs[0].ref;
			await deleteDoc(docRef);
			return [ErrorControl.SUCCESS, docRef.id, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error deleting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async getUserJobs(id_user: string): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const userdocRef = doc(db, User.COLLECTION, id_user);
			const q = query(jobsRef, where("id_creator", "==", userdocRef));
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}
			const jobs = querySnapshot.docs.map((doc) =>
				Job.fromJson({ ...doc.data(), id_job: doc.id })
			);
			return [ErrorControl.SUCCESS, jobs, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error deleting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async aplyJob(
		id_job: string,
		id_user: string
	): Promise<DaoResponse> {
		const userdocRef = doc(db, User.COLLECTION, id_user);
		const jobdocRef = doc(db, Job.COLLECTION, id_job);
		try {
			await updateDoc(jobdocRef, { applicants: arrayUnion(userdocRef) });
			return [
				ErrorControl.SUCCESS,
				"Job applied",
				HttpStatusCode.Created,
			];
		} catch (error) {
			const msg = "Error deleting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async getAppliedJobs(
		id_user: string
	): Promise<DaoResponse> {
		try {
			const userdocRef = doc(db, User.COLLECTION, id_user);
			const q = query(
				collection(db, Job.COLLECTION),
				where("applicants", "array-contains", userdocRef)
			);
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}
			const jobs = querySnapshot.docs.map((doc) =>
				Job.fromJson({ ...doc.data(), id_job: doc.id })
			);
			return [ErrorControl.SUCCESS, jobs, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error deleting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async getApplicants(id_job: string): Promise<DaoResponse> {
		try {
			const jobdocRef = doc(db, Job.COLLECTION, id_job);
			const querySnapshot = await getDoc(jobdocRef);
	
			if (!querySnapshot.exists()) {
				return [
					ErrorControl.ERROR,
					"Job not found",
					HttpStatusCode.NotFound,
				];
			}
	
			const applicants = querySnapshot.data().applicants;
			const usersPromises = applicants.map(async (doc: DocumentReference) => {
				const docSnap = await getDoc(doc);
				const user = User.fromJson(docSnap.data());
				// delete password
				user.deletePassword();
				return user;
			});
	
			const users = await Promise.all(usersPromises);
			return [ErrorControl.SUCCESS, users, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error deleting document";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
	
}
