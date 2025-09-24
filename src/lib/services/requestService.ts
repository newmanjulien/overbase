import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Request, requestConverter } from "@/lib/models/request";

/**
 * Save draft: merges partial data from the setup form store into a Request.
 * Expects the caller to pass the current form data shape { step1, step2 }.
 * We write FLAT fields (prompt, scheduledDate, q1, q2, q3) using the converter.
 */
export async function saveDraft(
  uid: string,
  requestId: string,
  data: {
    step1?: { prompt?: string; scheduledDate?: Date | null };
    step2?: { q1?: string; q2?: string; q3?: string };
  }
) {
  const ref = doc(db, "users", uid, "requests", requestId).withConverter(
    requestConverter
  );

  const draft: Partial<Request> = {
    id: requestId,
    prompt: data.step1?.prompt ?? "",
    scheduledDate:
      data.step1 && "scheduledDate" in data.step1
        ? data.step1.scheduledDate ?? null
        : null,
    q1: data.step2?.q1 ?? "",
    q2: data.step2?.q2 ?? "",
    q3: data.step2?.q3 ?? "",
    status: "draft",
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, draft as Request, { merge: true });
}

/**
 * Submit request: same fields as draft, but sets status to 'submitted'.
 */
export async function submitRequest(
  uid: string,
  requestId: string,
  data: {
    step1?: { prompt?: string; scheduledDate?: Date | null };
    step2?: { q1?: string; q2?: string; q3?: string };
  }
) {
  const ref = doc(db, "users", uid, "requests", requestId).withConverter(
    requestConverter
  );

  const payload: Partial<Request> = {
    id: requestId,
    prompt: data.step1?.prompt ?? "",
    scheduledDate:
      data.step1 && "scheduledDate" in data.step1
        ? data.step1.scheduledDate ?? null
        : null,
    q1: data.step2?.q1 ?? "",
    q2: data.step2?.q2 ?? "",
    q3: data.step2?.q3 ?? "",
    status: "submitted",
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload as Request, { merge: true });
}

/**
 * Get a single request by id under the current user.
 */
export async function getRequest(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId).withConverter(
    requestConverter
  );
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
