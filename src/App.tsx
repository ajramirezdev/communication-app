import { useEffect } from "react";
import "./App.css";
import Chat from "./components/chat/Chat";
import { Login } from "./components/login/Login";
import { Notification } from "./components/notification/Notification";
import Detail from "./components/userDetails/Detail";
import List from "./components/userList/List";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "./lib/userStore";
import { HashLoader } from "react-spinners";
import { useChatStore } from "./lib/chatStore";

function App() {
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

    console.log(currentUser);

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
                    <List />
                    {chatID && <Chat />}
                    {chatID && <Detail />}
                </>
            ) : (
                <Login />
            )}
            <Notification />
        </div>
    );
}

export default App;
