import "./UserInfo.css";
import { MdOutlineEmail } from "react-icons/md";
import { useUserStore } from "../../../lib/userStore";
import { Link } from "react-router-dom";

export default function UserInfo() {
    const { currentUser } = useUserStore();

    return (
        <div className="user-info">
            <div className="user">
                <div className="image">{currentUser?.username[0]}</div>
                <h2>{currentUser?.username}</h2>
            </div>
            <Link to="/emails" className="icons">
                <MdOutlineEmail />
            </Link>
        </div>
    );
}
