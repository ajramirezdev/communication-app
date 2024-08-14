import React, { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export const Login = () => {
    const [loading, setLoading] = useState(false);
    const [userHasAccount, setUserHasAccount] = useState(true);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const formEntries = Object.fromEntries(formData);
        const email = formEntries.email as string;
        const password = formEntries.password as string;

        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(false);
            toast.success("Logged in successfully.");
        } catch (error) {
            setLoading(false);
            console.log(error);

            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const formEntries = Object.fromEntries(formData.entries());
        const username = formEntries.username as string;
        const email = formEntries.email as string;
        const number = formEntries.number as string;
        const password = formEntries.password as string;

        try {
            setLoading(true);
            const response = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await setDoc(doc(db, "users", response.user.uid), {
                username,
                number,
                email,
                id: response.user.uid,
            });

            await setDoc(doc(db, "userChats", response.user.uid), {
                chats: [],
                id: response.user.uid,
            });
            setLoading(false);

            toast.success("Account created successfully.");
        } catch (error) {
            setLoading(false);
            console.log(error);

            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="user-login">
            {userHasAccount ? (
                <div className="login-signin">
                    <h2>Log In</h2>
                    <form onSubmit={handleLogin}>
                        <input type="email" placeholder="Email" name="email" />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                        />
                        <button disabled={loading} type="submit">
                            {loading ? "Loading..." : "Sign In"}
                        </button>
                    </form>
                    <div>
                        Don't have an account yet?{" "}
                        <button
                            className="link"
                            onClick={() => setUserHasAccount(false)}
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            ) : (
                <div className="login-signin">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSignup}>
                        <input
                            type="text"
                            placeholder="Username"
                            name="username"
                        />
                        <input type="email" placeholder="Email" name="email" />
                        <input
                            type="tel"
                            placeholder="Phone number"
                            name="number"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                        />
                        <button disabled={loading} type="submit">
                            {loading ? "Loading..." : "Create Account"}
                        </button>
                    </form>
                    <div>
                        Already have an account?{" "}
                        <button
                            className="link"
                            onClick={() => setUserHasAccount(true)}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
