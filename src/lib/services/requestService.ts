import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { requestConverter, Request } from "@/lib/models/request";

export async function saveDraft(uid: string, requestId: string, data: any) {
  const ref = doc(db, "users", uid, "requests", requestId).withConverter(
    requestConverter
  );

  await setDoc(
    ref,
    {
      id: requestId,
      prompt: data.step1?.prompt ?? "",
      scheduledDate: data.step1?.scheduledDate ?? null,
      q1: data.step2?.q1 ?? "",
      q2: data.step2?.q2 ?? "",
      q3: data.step2?.q3 ?? "",
      status: "draft",
      updatedAt: serverTimestamp(),
    } as Request,
    { merge: true }
  );
}

export async function submitRequest(uid: string, requestId: string, data: any) {
  const ref = doc(db, "users", uid, "requests", requestId).withConverter(
    requestConverter
  );

  await setDoc(
    ref,
    {
      id: requestId,
      prompt: data.step1?.prompt ?? "",
      scheduledDate: data.step1?.scheduledDate ?? null,
      q1: data.step2?.q1 ?? "",
      q2: data.step2?.q2 ?? "",
      q3: data.step2?.q3 ?? "",
      status: "submitted",
      updatedAt: serverTimestamp(),
    } as Request,
    { merge: true }
  );
}

export async function getRequest(uid: string, requestId: string) {
  const ref = doc(db, "users", uid, "requests", requestId).withConverter(
    requestConverter
  );
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
