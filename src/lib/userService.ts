import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { deleteUser, updateProfile } from "firebase/auth";
import { db, auth } from "./firebase";
import { submitDetailsToGoogleForms } from "./googleFormsService";

export interface UserProfileDoc {
  uid: string;
  name: string;
  "Full Name"?: string;
  email: string;
  Email?: string;
  photoFileName: string;
  "photo file name"?: string;
  location: string;
  Location?: string;
  grade: string;
  Grade?: string;
  phone: string;
  "phone number"?: string;
  school: string;
  Age: string;
  chosedSubject: string;
  "chosed subject"?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const DEFAULT_USER_PROFILE = {
  name: "",
  "Full Name": "",
  email: "",
  Email: "",
  photoFileName: "avatar_default.png",
  "photo file name": "avatar_default.png",
  location: "",
  Location: "",
  grade: "",
  Grade: "",
  phone: "",
  "phone number": "",
  school: "",
  Age: "",
  chosedSubject: "",
  "chosed subject": ""
};

/**
 * Checks if user document exists at /users/{{uid}} in Firestore or local cache.
 * Returns the profile if found, or null if the user is new and needs onboarding.
 */
export async function ensureUserInFirestore(
  user: any,
  additionalInfo: Partial<UserProfileDoc> = {}
): Promise<UserProfileDoc | null> {
  if (!user || !user.uid) {
    return null;
  }

  const userDocRef = doc(db, "users", user.uid);
  let existingData: any = null;

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      existingData = snap.data();
    }
  } catch (err) {
    console.warn("Notice checking Firestore /users doc:", err);
  }

  // Fallback to local cache if offline or permission notice
  if (!existingData) {
    try {
      const savedLocal = localStorage.getItem(`learnadm_user_profile_${user.uid}`);
      if (savedLocal) {
        existingData = JSON.parse(savedLocal);
      }
    } catch (e) {
      console.warn("Notice reading local profile cache:", e);
    }
  }

  // If user profile is not saved yet, return null to force onboarding questions
  if (!existingData || (!existingData.name && !existingData["Full Name"])) {
    return null;
  }

  return existingData as UserProfileDoc;
}

/**
 * Updates user profile at /users/{{uid}} in Firestore and local state.
 */
export async function updateUserProfileInFirestore(
  uid: string,
  updatedFields: Partial<UserProfileDoc>
): Promise<UserProfileDoc> {
  const userDocRef = doc(db, "users", uid);
  
  // Format standardized fields
  const nameVal = updatedFields.name || updatedFields["Full Name"] || "";
  const emailVal = updatedFields.email || updatedFields.Email || "";
  const photoVal = updatedFields.photoFileName || updatedFields["photo file name"] || "avatar_default.png";
  const locationVal = updatedFields.location || updatedFields.Location || "";
  const gradeVal = updatedFields.grade || updatedFields.Grade || "";
  const phoneVal = updatedFields.phone || updatedFields["phone number"] || "";
  const schoolVal = updatedFields.school || "";
  const ageVal = updatedFields.Age || "";
  const subjectVal = updatedFields.chosedSubject || updatedFields["chosed subject"] || "";

  const payload: UserProfileDoc = {
    uid,
    name: nameVal,
    "Full Name": nameVal,
    email: emailVal,
    Email: emailVal,
    photoFileName: photoVal,
    "photo file name": photoVal,
    location: locationVal,
    Location: locationVal,
    grade: gradeVal,
    Grade: gradeVal,
    phone: phoneVal,
    "phone number": phoneVal,
    school: schoolVal,
    Age: ageVal,
    chosedSubject: subjectVal,
    "chosed subject": subjectVal,
    updatedAt: new Date().toISOString()
  };

  // Cache locally
  try {
    localStorage.setItem(`learnadm_user_profile_${uid}`, JSON.stringify(payload));
  } catch (e) {
    console.warn("Error caching updated profile locally:", e);
  }

  // Update Auth Display Name if current user matches
  if (auth.currentUser && auth.currentUser.uid === uid && nameVal) {
    try {
      await updateProfile(auth.currentUser, { displayName: nameVal });
    } catch (e) {
      console.warn("Error updating Firebase auth displayName:", e);
    }
  }

  // Sync to Firestore at /users/{{uid}}
  await setDoc(userDocRef, payload, { merge: true });

  // Asynchronously submit updated details to Google Forms
  submitDetailsToGoogleForms(payload).catch((err) => {
    console.warn("Google Forms async submission notice:", err);
  });

  return payload;
}

/**
 * Deletes user document from Firestore /users/{{uid}}, clears local storage, and deletes Firebase auth user.
 */
export async function deleteUserAccountFromFirestore(user: any): Promise<void> {
  if (!user) return;

  const uid = user.uid;

  // 1. Delete from Firestore /users/{{uid}}
  try {
    const userDocRef = doc(db, "users", uid);
    await deleteDoc(userDocRef);
  } catch (e) {
    console.warn("Notice deleting user doc from Firestore:", e);
  }

  // 2. Clear local storage cache
  try {
    localStorage.removeItem(`learnadm_user_profile_${uid}`);
  } catch (e) {
    console.warn("Notice clearing local storage cache:", e);
  }

  // 3. Delete from Firebase Auth
  try {
    if (auth.currentUser && auth.currentUser.uid === uid) {
      await deleteUser(auth.currentUser);
    }
  } catch (e: any) {
    console.error("Firebase Auth delete user error:", e);
    throw e;
  }
}
