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
import { useChatStore, User } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { socket } from "../../lib/socket";
import { CallModal } from "../callModal/CallModal";
import Peer, { Instance as PeerInstance } from "simple-peer";
import { CallerModal } from "../callerModal/CallerModal";

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

    const [showModal, setShowModal] = useState(false);
    const [showCallerModal, setShowCallerModal] = useState(false);
    const [caller, setCaller] = useState<User | null>(null);
    const [stream, setStream] = useState<MediaStream | undefined>();
    const [callAccepted, setCallAccepted] = useState<boolean>(false);
    const [callerSignal, setCallerSignal] = useState<
        Peer.SignalData | undefined
    >();
    const [callEnded, setCallEnded] = useState<boolean>(false);

    const endRef = useRef<HTMLDivElement | null>(null);
    const myAudio = useRef<HTMLAudioElement | null>(null);
    const otherAudio = useRef<HTMLAudioElement | null>(null);
    const connectionRef = useRef<PeerInstance | null>(null);

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

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                setStream(stream);
                if (myAudio.current) {
                    myAudio.current.srcObject = stream;
                    console.log("navigator");
                }
            })
            .catch((err) => {
                console.error("Failed to get user media:", err);
            });
    }, []);

    useEffect(() => {
        function onConnect() {
            console.log(`Connected to server with socket ID: ${socket.id}`);
        }

        function onDisconnect() {
            console.log("Disconnected from server");
        }

        const onIncomingCall = (data: {
            callerInfo: User;
            signalData: Peer.SignalData;
        }) => {
            console.log("Incoming call from:", data.callerInfo);
            console.log(data);

            setCaller(data.callerInfo);
            setCallerSignal(data.signalData);
            setShowModal(true);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("incoming-call", onIncomingCall);
        socket.emit("register", currentUser?.number);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("incoming-call", onIncomingCall);
        };
    }, []);

    const handleCall = () => {
        if (!stream) {
            console.error("Stream is not initialized.");
            return;
        }

        setShowCallerModal(true);

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data: Peer.SignalData) => {
            socket.emit("call-user", {
                calleeId: user?.number,
                callerInfo: currentUser,
                signalData: data,
            });
        });

        peer.on("stream", (remoteStream) => {
            if (otherAudio.current) {
                otherAudio.current.srcObject = remoteStream;
                console.log(
                    "Remote stream received and assigned to otherAudio."
                );
            } else {
                console.error("otherAudio is not ready to receive the stream.");
            }
        });

        socket.on("callAccepted", (signal: Peer.SignalData) => {
            setCallAccepted(true);
            console.log("hi");
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        if (!caller) {
            console.error("Caller is undefined.");
            return;
        }

        if (!callerSignal) {
            console.error("Caller signal is undefined.");
            return;
        }
        setCallAccepted(true);

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data: Peer.SignalData) => {
            socket.emit("answerCall", { signal: data, to: caller.number });
        });

        peer.on("stream", (remoteStream) => {
            if (otherAudio.current) {
                otherAudio.current.srcObject = remoteStream;
                console.log(
                    "Remote stream received and assigned to otherAudio."
                );
            } else {
                console.error("otherAudio is not ready to receive the stream.");
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const endCall = () => {
        if (connectionRef.current) {
            connectionRef.current.destroy();
            setShowModal(false);
            setCallEnded(true);
            window.location.reload();
        } else {
            console.error("Connection reference is not set.");
        }
    };

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
                    <button
                        onClick={handleCall}
                        style={{ backgroundColor: "transparent" }}
                    >
                        <IoCallOutline size={20} color="white" />
                    </button>
                    <MdMoreHoriz size={20} />
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
            {showModal && (
                <CallModal
                    caller={caller}
                    answerCall={answerCall}
                    endCall={endCall}
                    callEnded={callEnded}
                    callAccepted={callAccepted}
                />
            )}
            {showCallerModal && (
                <CallerModal
                    endCall={endCall}
                    callEnded={callEnded}
                    callAccepted={callAccepted}
                />
            )}
            {stream && (
                <audio
                    autoPlay
                    muted
                    controls
                    ref={myAudio}
                    style={{ display: "none" }}
                />
            )}
            {callAccepted && !callEnded ? (
                <audio
                    ref={otherAudio}
                    controls
                    autoPlay
                    style={{ display: "none" }}
                />
            ) : null}
        </div>
    );
}
