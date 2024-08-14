import "./ChatList.css";
import { CiSearch } from "react-icons/ci";
import { HiOutlineUserAdd } from "react-icons/hi";
import { AddUser } from "../../addUserModal/AddUser";
import { useEffect, useState } from "react";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

type Chat = {
    chatID: string;
    timestamp: Date;
    lastMessage: string;
    receiverID: string;
    user: {
        id: string;
        username: string;
        email: string;
        number: string;
    };
    isSeen?: boolean;
};

export default function ChatList() {
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [userChats, setUserChats] = useState<Chat[]>([]);

    useEffect(() => {
        if (!currentUser) return;

        const unsub = onSnapshot(
            doc(db, "userChats", currentUser.id),
            async (res) => {
                const data = res.data();
                if (!data) return;
                const chats = data.chats;

                const promises = chats.map(async (chat: Chat) => {
                    const userDocRef = doc(db, "users", chat.receiverID);
                    const userDocSnap = await getDoc(userDocRef);

                    const user = userDocSnap.data();
                    return { ...chat, user };
                });
                const chatData = await Promise.all(promises);

                setUserChats(
                    chatData.sort((a, b) => b.timestamp - a.timestamp)
                );
            }
        );

        return () => {
            unsub();
        };
    }, [currentUser?.id]);

    const handleSelect = async (chat: Chat) => {
        const chats = userChats.map((item) => {
            const { user, ...rest } = item;
            console.log(user);
            return rest;
        });

        const chatIndex = chats.findIndex(
            (item) => item.chatID === chat.chatID
        );

        chats[chatIndex].isSeen = true;
        if (!currentUser) return;
        const userChatRef = doc(db, "userChats", currentUser.id);
        changeChat(chat.chatID, chat.user);

        try {
            await updateDoc(userChatRef, {
                chats: chats,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const filteredChats = userChats.filter((c) =>
        c.user.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="chat-list">
            <div className="search">
                <div className="searchBar">
                    <CiSearch size={20} />
                    <input
                        onChange={(event) => setSearch(event.target.value)}
                        value={search}
                        type="text"
                        placeholder="Search"
                    />
                </div>
                <button
                    onClick={() => setShowModal((prev) => !prev)}
                    className="addUser"
                >
                    <HiOutlineUserAdd size={20} />
                </button>
            </div>

            {filteredChats.map((chat) => (
                <div
                    className="item"
                    key={chat.chatID}
                    onClick={() => handleSelect(chat)}
                    style={{
                        backgroundColor: chat?.isSeen
                            ? "transparent"
                            : "rgb(83 252 24 / 50%)",
                    }}
                >
                    <div className="image">{chat.user.username[0]}</div>
                    <div className="text">
                        <span>{chat.user.username}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}

            {showModal && <AddUser />}
        </div>
    );
}
