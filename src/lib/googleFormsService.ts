export interface GoogleFormUserData {
  email?: string;
  Email?: string;
  age?: string;
  Age?: string;
  name?: string;
  "Full Name"?: string;
  grade?: string;
  Grade?: string;
  school?: string;
  chosedSubject?: string;
  "chosed subject"?: string;
  location?: string;
  Location?: string;
  phone?: string;
  "phone number"?: string;
}

export const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc8F-i9ZFCMk_zJqwP5X1Sn_LSu4GxGo28-5WNJmLBP8tDNzQ/formResponse";

/**
 * Submits user details to Google Forms via POST request according to provided field mapping:
 * Email: entry.1476941973
 * Age: entry.1699504379
 * Name: entry.1699504379
 * Grade: entry.1415919
 * School: entry.1724913017
 * Chosed subject: entry.209629772
 * Location: entry.869885082
 * Phone number: entry.986575230
 */
export async function submitDetailsToGoogleForms(data: GoogleFormUserData): Promise<boolean> {
  const emailVal = data.email || data.Email || "";
  const ageVal = data.age || data.Age || "";
  const nameVal = data.name || data["Full Name"] || "";
  const gradeVal = data.grade || data.Grade || "";
  const schoolVal = data.school || "";
  const subjectVal = data.chosedSubject || data["chosed subject"] || "";
  const locationVal = data.location || data.Location || "";
  const phoneVal = data.phone || data["phone number"] || "";

  // 1. Send via Express backend API proxy (/api/submit-google-form)
  try {
    const apiRes = await fetch("/api/submit-google-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailVal,
        age: ageVal,
        name: nameVal,
        grade: gradeVal,
        school: schoolVal,
        chosedSubject: subjectVal,
        location: locationVal,
        phone: phoneVal,
      }),
    });

    if (apiRes.ok) {
      console.log("[Google Forms] Successfully posted sign up details via backend route.");
      return true;
    }
  } catch (err) {
    console.warn("[Google Forms] Backend route submission notice, attempting client-side fallback...", err);
  }

  // 2. Client-side fallback with mode 'no-cors'
  try {
    const params = new URLSearchParams();
    if (emailVal) params.append("entry.1476941973", emailVal);
    
    // Name & Age mapping
    if (nameVal && ageVal) {
      params.append("entry.1699504379", `${nameVal} (Age: ${ageVal})`);
    } else if (nameVal) {
      params.append("entry.1699504379", nameVal);
    } else if (ageVal) {
      params.append("entry.1699504379", ageVal);
    }

    if (gradeVal) params.append("entry.1415919", gradeVal);
    if (schoolVal) params.append("entry.1724913017", schoolVal);
    if (subjectVal) params.append("entry.209629772", subjectVal);
    if (locationVal) params.append("entry.869885082", locationVal);
    if (phoneVal) params.append("entry.986575230", phoneVal);

    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    console.log("[Google Forms] Successfully submitted sign up details directly.");
    return true;
  } catch (err) {
    console.error("[Google Forms] Direct client submission error:", err);
    return false;
  }
}
