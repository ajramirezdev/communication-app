import { useEffect } from "react";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import "./EmailPage.css";
import { HashLoader } from "react-spinners";
import { onAuthStateChanged } from "firebase/auth";
import { Login } from "../../components/login/Login";
import { Notification } from "../../components/notification/Notification";
import { auth } from "../../lib/firebase";
import { EmailList } from "../../components/emailList/EmailList";
import Email from "../../components/email/Email";

export const EmailPage = () => {
    const { currentUser, isLoading, fetchUserInfo, nullFalse } = useUserStore();
    const { chatID } = useChatStore();

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                nullFalse();
                return;
            }

            fetchUserInfo(user.uid);
        });
        return () => {
            unSub();
        };
    }, [fetchUserInfo]);

    if (isLoading) {
        return (
            <div className="loading">
                <HashLoader color="#53fc18" size={100} />
            </div>
        );
    }

    return (
        <div className="container">
            {currentUser ? (
                <>
                    <EmailList />
                    {chatID && <Email />}
                </>
            ) : (
                <Login />
            )}
            <Notification />
        </div>
    );
};
