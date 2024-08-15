import { useState } from "react";
import "./AddEmail.css";
import { CiSearch } from "react-icons/ci";
import { TiUserAddOutline } from "react-icons/ti";
import { useUserStore } from "../../lib/userStore";
import {
    arrayUnion,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { User } from "../../lib/chatStore";

export const AddEmail = () => {
    const [user, setUser] = useState<User | null>(null);
    const { currentUser } = useUserStore();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);
        const email = formData.get("email");

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("email", "==", email));

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data() as User);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleAddUser = async () => {
        const chatRef = collection(db, "emails");
        const userChatsRef = collection(db, "userEmails");
        try {
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatsRef, user?.id), {
                chats: arrayUnion({
                    chatID: newChatRef.id,
                    lastMessage: "",
                    receiverID: currentUser?.id,
                    updatedAt: Date.now(),
                }),
            });

            await updateDoc(doc(userChatsRef, currentUser?.id), {
                chats: arrayUnion({
                    chatID: newChatRef.id,
                    lastMessage: "",
                    receiverID: user?.id,
                    updatedAt: Date.now(),
                }),
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="add-user">
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Search email" name="email" />
                <button type="submit">
                    <CiSearch size={20} />
                </button>
            </form>

            {user && (
                <div className="users">
                    <div className="details">
                        <div className="image">{user.username[0]}</div>
                        <span>{user.username}</span>
                    </div>
                    <button onClick={handleAddUser}>
                        <TiUserAddOutline size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};
