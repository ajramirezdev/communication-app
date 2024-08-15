/* eslint-disable @typescript-eslint/no-explicit-any */
import "./Email.css";
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
import { Editor } from "@tinymce/tinymce-react";
import parse from "html-react-parser";

type _Timestamp = {
    seconds: number;
    nanoseconds: number;
};

type Message = {
    text: string;
    senderID: string;
    createdAt: _Timestamp;
    subject: string;
};

type ChatData = {
    createdAt: _Timestamp;
    messages: Message[];
};

export default function Email() {
    const editorRef = useRef<any>(null);
    const [chats, setChats] = useState<ChatData | null>(null);
    const [subject, setSubject] = useState("");
    const { chatID, user } = useChatStore();
    const { currentUser } = useUserStore();

    const endRef = useRef<HTMLDivElement | null>(null);

    const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        if (!chatID) return;
        if (!editorRef.current) return;

        try {
            await updateDoc(doc(db, "emails", chatID), {
                messages: arrayUnion({
                    senderID: currentUser?.id,
                    text: editorRef.current.getContent(),
                    subject,
                    createdAt: new Date(),
                }),
            });

            if (!currentUser || !user) return;

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatRef = doc(db, "userEmails", id);
                const userChatsSnapshot = await getDoc(userChatRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex(
                        (c: { chatID: string }) => c.chatID == chatID
                    );

                    userChatsData.chats[chatIndex].lastMessage =
                        editorRef.current.getContent();
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
        const unSub = onSnapshot(doc(db, "emails", chatID), (res) => {
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
                        <div>{user?.email}</div>
                    </div>
                </div>
            </div>
            <div className="messages">
                {chats?.messages.map((message) => {
                    return (
                        <div
                            className={`chat-bubbles ${
                                message.senderID === currentUser?.id &&
                                "my-chat-bubbles"
                            }`}
                            key={`${message.createdAt}`}
                        >
                            <div className="subject">
                                Subject: {message.subject}
                            </div>
                            <div className="texts">
                                {/* <p
                                    dangerouslySetInnerHTML={{
                                        __html: htmlContent,
                                    }}
                                /> */}
                                {/* <p>{message.text}</p> */}
                                <div className="p">{parse(message.text)}</div>
                            </div>
                        </div>
                    );
                })}

                <div ref={endRef}></div>
            </div>
            {/* <form onSubmit={sendMessage} className="chat-input">
                <input
                    type="text"
                    placeholder="Message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="send">
                    <IoMdSend size={28} />
                </button>
            </form> */}
            <form className="editor" onSubmit={(event) => sendMessage(event)}>
                <input
                    className="subject-input"
                    type="text"
                    placeholder="Subject"
                    name="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                <Editor
                    apiKey="sbs6g6vnle0ubycn5yeg2283h6c5kyb9edmlze2k4nrtd35n"
                    onInit={(_evt, editor) => (editorRef.current = editor)}
                    initialValue=""
                    init={{
                        height: 300,
                        menubar: false,
                        plugins: [
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "image",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "code",
                            "help",
                            "wordcount",
                        ],
                        toolbar:
                            "undo redo | blocks | " +
                            "bold italic forecolor | alignleft aligncenter " +
                            "alignright alignjustify | bullist numlist outdent indent | " +
                            "removeformat | help",
                        content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    }}
                />
                <button type="submit" className="send-email">
                    Send
                </button>
            </form>
        </div>
    );
}
