import { useUserStore } from "../../../lib/userStore";
import "./Info.css";
import { Link } from "react-router-dom";
import { RiHome2Line } from "react-icons/ri";

export const Info = () => {
    const { currentUser } = useUserStore();

    return (
        <div className="user-info">
            <div className="user">
                <div className="image">{currentUser?.username[0]}</div>
                <div className="info">
                    <h2>{currentUser?.username}</h2>
                    <div className="email">{currentUser?.email}</div>
                </div>
            </div>
            <Link to="/" className="icons">
                <RiHome2Line />
            </Link>
        </div>
    );
};
