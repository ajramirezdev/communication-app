import { useChatStore } from "../../lib/chatStore";
import { auth } from "../../lib/firebase";
import "./Detail.css";

import { IoLogOutSharp } from "react-icons/io5";

export default function Detail() {
    const { user } = useChatStore();

    return (
        <div className="chat-details">
            <div className="user">
                <div className="image">{user?.username[0]}</div>
                <h2>{user?.username}</h2>
                <p>{user?.number}</p>
            </div>
            <div className="button">
                <button onClick={() => auth.signOut()}>
                    <div>Logout</div>
                    <IoLogOutSharp />
                </button>
            </div>
        </div>
    );
}
