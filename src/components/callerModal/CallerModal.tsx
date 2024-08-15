import "./CallerModal.css";
import { IoCallSharp } from "react-icons/io5";
import { useChatStore } from "../../lib/chatStore";

export const CallerModal = ({
    endCall,
    callEnded,
    callAccepted,
}: {
    endCall: () => void;
    callEnded: boolean;
    callAccepted: boolean;
}) => {
    const { user } = useChatStore();

    return (
        <div className="blurred">
            <div className="call">
                <div className="info">
                    <div className="image">{user?.username[0]}</div>
                    <div className="name">{user?.username}</div>
                    <div className="number">{user?.number}</div>
                    <div className="text">
                        {callAccepted && !callEnded
                            ? "Call Accepted"
                            : "Calling..."}
                    </div>
                </div>
                <div className="buttons">
                    <button onClick={endCall} className="end">
                        <IoCallSharp size={40} />
                    </button>
                </div>
            </div>
        </div>
    );
};
