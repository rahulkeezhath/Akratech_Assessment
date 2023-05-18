import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import Dexie from "dexie";

const db = new Dexie("UserDB");
db.version(1).stores({
  users: "id, name, picture",
});

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
        setLoading(false);
      } else {
        const response = await axios.get(
          "https://randomuser.me/api/?results=50"
        );
        const usersData = response.data.results.map((user) => ({
          ...user,
          id: user.login.uuid,
        }));
        setUsers(usersData);
        setLoading(false);
        localStorage.setItem("users", JSON.stringify(usersData));
        await db.users.bulkPut(usersData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await db.users.delete(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      localStorage.setItem("users", JSON.stringify(users));
    } catch (error) {
      console.error("Error deleting user from IndexedDB:", error);
    }
  };

  const refreshPage = () => {
    localStorage.removeItem("users");
    fetchUsers();
  };

  return (
    <div>
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <div
            style={{ color: "black", fontSize: "40px" }}
            className="cardContainer"
          >
            Total Items: {users.length}
            <Button onClick={refreshPage}>Refresh</Button>
          </div>
          {users.map((user) => (
            <Card key={user.id} className="cardItem">
              <img src={user.picture.large} alt="Profile" />
              <CardContent>
                <div>{`${user.name.title} ${user.name.first} ${user.name.last}`}</div>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<Delete />}
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
