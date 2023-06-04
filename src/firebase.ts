import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  remove,
  update,
} from "firebase/database";
import { removeSpecialChars } from "./utils/utils";
import { firebase as firebaseConfig } from "./config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const setStatus = async (userId: string, status: boolean) => {
  const sanitizedUserId = removeSpecialChars(userId);
  try {
    await update(ref(db, `status/${sanitizedUserId}`), { session: status });
  } catch (err) {
    throw new Error(
      `Failed to update status for ${sanitizedUserId}: ${err.message}`
    );
  }
};

const setEmailAdress = async (userId: string, email: string) => {
  const sanitizedUserId = removeSpecialChars(userId);
  try {
    await update(ref(db, `status/${sanitizedUserId}`), { email: email });
    return {
      success: true,
      message: "Email updated successfully",
      login: sanitizedUserId,
      email: email,
    };
  } catch (err) {
    throw new Error(
      `Failed to update email for ${sanitizedUserId}: ${err.message}`
    );
  }
};

const getStatus = async (userId: string) => {
  const sanitizedUserId = removeSpecialChars(userId);
  try {
    const snapshot = await get(child(ref(db), `status/${sanitizedUserId}`));
    return snapshot.exists() ? snapshot.val() : false;
  } catch (err) {
    throw new Error(
      `Failed to get status of session for ${sanitizedUserId}: ${err.message}`
    );
  }
};

const getUsersWithEmail = async () => {
  const snapshot = await get(child(ref(db), "status"));
  const usersWithEmailAndLogin = [];

  snapshot.forEach((childSnapshot) => {
    const user = childSnapshot.val();
    if (user.email) {
      usersWithEmailAndLogin.push({
        login: childSnapshot.key,
        email: user.email,
      });
    }
  });

  return usersWithEmailAndLogin;
};

const getUsersWithoutTodaySessionAndEmail = async () => {
  const usersWithEmailAndLogin = await getUsersWithEmail();
  const usersWithoutSessionTodayAndEmail = [];

  for (let i = 0; i < usersWithEmailAndLogin.length; i++) {
    const { login, email } = usersWithEmailAndLogin[i];
    const userLogsRef = child(ref(db), `users/${login}/logs`);

    const logsSnapshot = await get(userLogsRef);
    let sessionToday = false;

    logsSnapshot.forEach((logSnapshot) => {
      const log = logSnapshot.val();
      const logTime = new Date(log.date * 1000);
      const today = new Date();
      if (logTime.toDateString() === today.toDateString()) {
        sessionToday = true;
      }
    });

    if (!sessionToday) {
      usersWithoutSessionTodayAndEmail.push({ login, email });
    }
  }

  return usersWithoutSessionTodayAndEmail;
};

const countAllUsers = async () => {
  try {
    const snapshot = await get(child(ref(db), `status`));
    let count = 0;
    snapshot.forEach(() => {
      count++;
    });
    return count;
  } catch (err) {
    throw new Error(`Failed to count all users: ${err.message}`);
  }
};

const writeUserData = async (
  userId: string,
  state = "Nowy stan",
  date = Math.floor(new Date().getTime() / 1000)
) => {
  const sanitizedUserId = removeSpecialChars(userId);
  try {
    await set(ref(db, `users/${sanitizedUserId}/logs/${date}`), {
      state,
      date,
    });
  } catch (err) {
    throw new Error(
      `Failed to write data for user ${sanitizedUserId}: ${err.message}`
    );
  }
};

const setTempLog = async (
  user: string,
  date = Math.floor(Date.now() / 1000)
) => {
  user = removeSpecialChars(user);
  try {
    await update(ref(db, `users/${user}/logs/${date}`), {
      date,
      state: "Czyszczenie konsoli",
    });
    return true;
  } catch (err) {
    throw new Error(
      `Failed to set temporary log for user ${user}: ${err.message}`
    );
  }
};

const removeAllLogs = async (user: string) => {
  user = removeSpecialChars(user);
  try {
    await setTempLog(user);
    await remove(ref(db, `users/${user}/logs`));
    return true;
  } catch (err) {
    throw new Error(
      `Failed to remove all logs for user ${user}: ${err.message}`
    );
  }
};

const getBan = async (user: string) => {
  user = removeSpecialChars(user);
  try {
    const snapshot = await get(child(ref(db), `bans/${user}`));
    return snapshot.exists() ? snapshot.val() : false;
  } catch (err) {
    throw new Error(
      `Failed to get ban status for user ${user}: ${err.message}`
    );
  }
};

export {
  db,
  app,
  writeUserData,
  removeAllLogs,
  getStatus,
  setStatus,
  getBan,
  countAllUsers,
  getUsersWithoutTodaySessionAndEmail,
  setEmailAdress,
};
