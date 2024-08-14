import "./Chat.css";

import { MdMoreHoriz } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import {
    arrayUnion,
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

type _Timestamp = {
    seconds: number;
    nanoseconds: number;
};

type Message = {
    text: string;
    senderID: string;
    createdAt: _Timestamp;
};

type ChatData = {
    createdAt: _Timestamp;
    messages: Message[];
};

export default function Chat() {
    const [text, setText] = useState("");
    const [chats, setChats] = useState<ChatData | null>(null);
    const { chatID, user } = useChatStore();
    const { currentUser } = useUserStore();

    const endRef = useRef<HTMLDivElement | null>(null);

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        if (text.trim() === "") return;
        if (!chatID) return;

        try {
            await updateDoc(doc(db, "chats", chatID), {
                messages: arrayUnion({
                    senderID: currentUser?.id,
                    text,
                    createdAt: new Date(),
                }),
            });

            if (!currentUser || !user) return;

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatRef = doc(db, "userChats", id);
                const userChatsSnapshot = await getDoc(userChatRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex(
                        (c: { chatID: string }) => c.chatID == chatID
                    );

                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen =
                        id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatRef, {
                        chats: userChatsData.chats,
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (!chatID) return;
        const unSub = onSnapshot(doc(db, "chats", chatID), (res) => {
            const data = res.data() as ChatData | undefined;
            if (!data) {
                setChats(null);
                return;
            }

            setChats(data);
        });

        return () => {
            unSub();
        };
    }, [chatID]);

    return (
        <div className="chat">
            <div className="chat-header">
                <div className="user-info">
                    <div className="image">{user?.username[0]}</div>
                    <div className="info">
                        <div>{user?.username}</div>
                        <div>{user?.number}</div>
                    </div>
                </div>
                <div className="icons">
                    <IoCallOutline />
                    <MdMoreHoriz />
                </div>
            </div>
            <div className="messages">
                {chats?.messages.map((message) => {
                    return (
                        <div
                            className={`chat-bubble ${
                                message.senderID === currentUser?.id &&
                                "my-chat-bubble"
                            }`}
                            key={`${message.createdAt}`}
                        >
                            <div className="texts">
                                {/* <span>1 min ago</span> */}
                                <p>{message.text}</p>
                            </div>
                        </div>
                    );
                })}

                <div ref={endRef}></div>
            </div>
            <form onSubmit={sendMessage} className="chat-input">
                <input
                    type="text"
                    placeholder="Message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="send">
                    <IoMdSend size={28} />
                </button>
            </form>
        </div>
    );
}
