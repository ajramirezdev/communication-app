import "./UserInfo.css";
import { MdMoreHoriz } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { useUserStore } from "../../../lib/userStore";

export default function UserInfo() {
    const { currentUser } = useUserStore();

    return (
        <div className="user-info">
            <div className="user">
                <div className="image">{currentUser?.username[0]}</div>
                <h2>{currentUser?.username}</h2>
            </div>
            <div className="icons">
                <MdMoreHoriz />
                <MdOutlineEmail />
                <CiEdit />
            </div>
        </div>
    );
}
