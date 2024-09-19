import { config } from "dotenv";
import { createDebugger } from "../utils/debugConfig";
import { Job } from "../entities/Job";
import {
	addDoc,
	and,
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "../service/firebaseDB";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { HttpStatusCode } from "axios";
import { User } from "../entities/User";

config();

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

	protected static async getAll(): Promise<DaoResponse> {
		try {
			const jobsRef = collection(db, Job.COLLECTION);
			const querySnapshot = await getDocs(jobsRef);
			if (querySnapshot.empty) {
				return [ErrorControl.SUCCESS, [], HttpStatusCode.Ok];
			}
			const jobs = querySnapshot.docs.map((doc) =>
				Job.fromJson({ ...doc.data(), id_job: doc.id })
			);
			return [ErrorControl.SUCCESS, jobs, HttpStatusCode.Ok];
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
			const q = query(
				jobsRef,
				and(
					where("id_creator", "==", id_user),
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
			const q = query(
				jobsRef,
				and(
					where("id_creator", "==", id_user),
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

	protected static async aplyJob(job: any): Promise<DaoResponse> {
		throw new Error("Method not implemented.");
	}
}
