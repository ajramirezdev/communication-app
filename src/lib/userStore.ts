import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export type User = {
    id: string;
    username: string;
    email: string;
    number: string;
};

type UserStore = {
    currentUser: User | null;
    isLoading: boolean;
    fetchUserInfo: (uid: string | null) => Promise<void>;
    nullFalse: () => void;
};

export const useUserStore = create<UserStore>()((set) => ({
    currentUser: null,
    isLoading: true,
    fetchUserInfo: async (uid) => {
        if (!uid) return set({ currentUser: null, isLoading: false });

        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                const user: User = {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    number: data.number,
                };

                set({ currentUser: user, isLoading: false });
            } else {
                set({ currentUser: null, isLoading: false });
            }
        } catch (error) {
            console.log(error);
            return set({ currentUser: null, isLoading: false });
        }
    },
    nullFalse: () => set({ currentUser: null, isLoading: false }),
}));
