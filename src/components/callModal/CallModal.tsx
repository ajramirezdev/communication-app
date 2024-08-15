import "./CallModal.css";

import { IoCallSharp } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { User } from "../../lib/chatStore";

export const CallModal = ({
    caller,
    endCall,
    answerCall,
    callEnded,
    callAccepted,
}: {
    caller: User | null;
    endCall: () => void;
    answerCall: () => void;
    callEnded: boolean;
    callAccepted: boolean;
}) => {
    return (
        <div className="blurred">
            <div className="call">
                <div className="info">
                    <div className="image">{caller?.username[0]}</div>
                    <div className="name">{caller?.username}</div>
                    <div className="number">{caller?.number}</div>
                    <div className="text">Incoming Call...</div>
                </div>
                <div className="buttons">
                    <button onClick={endCall} className="end">
                        <IoCallSharp size={40} />
                    </button>
                    {callAccepted && !callEnded ? null : (
                        <button onClick={answerCall} className="accept">
                            <MdCallEnd size={40} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
