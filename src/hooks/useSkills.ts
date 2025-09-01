import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Skill {
  key: string;
  name: string;
  header: string;
  subheader: string;
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "skills"), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Skill);
      setSkills(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { skills, loading };
}
