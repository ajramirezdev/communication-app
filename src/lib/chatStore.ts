import { create } from "zustand";

export type User = {
    id: string;
    username: string;
    email: string;
    number: string;
};

type ChatStore = {
    chatID: string | null;
    user: User | null;
    changeChat: (chatID: string, user: User) => void;
};

export const useChatStore = create<ChatStore>()((set) => ({
    chatID: null,
    user: null,
    changeChat: (chatID: string, user: User) => {
        return set({ chatID, user });
    },
}));
