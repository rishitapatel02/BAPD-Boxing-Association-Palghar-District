import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem("bapd_user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {

      console.error(
        "Invalid saved user data:",
        error
      );

      localStorage.removeItem("bapd_user");
      localStorage.removeItem("bapd_token");

      return null;
    }
  });


  useEffect(() => {

    if (user) {

      localStorage.setItem(
        "bapd_user",
        JSON.stringify(user)
      );

      if (user.token) {

        localStorage.setItem(
          "bapd_token",
          user.token
        );

      }

    } else {

      localStorage.removeItem("bapd_user");
      localStorage.removeItem("bapd_token");

    }

  }, [user]);


  const login = (userData) => {

    /*
      Backend returns:

      {
        token: "...",
        user: {
          id: 3,
          email: "...",
          role: "player"
        }
      }

      We store the inner user object
      together with the token.
    */

    const loggedInUser = {
      ...userData.user,
      token: userData.token,
    };

    setUser(loggedInUser);

    localStorage.setItem(
      "bapd_user",
      JSON.stringify(loggedInUser)
    );

    localStorage.setItem(
      "bapd_token",
      userData.token
    );
  };


  const logout = () => {

    setUser(null);

    localStorage.removeItem("bapd_user");
    localStorage.removeItem("bapd_token");

  };


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}