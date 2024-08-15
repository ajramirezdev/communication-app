import { List } from "./eList/eList";
import "./EmailList.css";
import { Info } from "./info/Info";

export const EmailList = () => {
    return (
        <div className="list">
            <Info />
            <List />
        </div>
    );
};
