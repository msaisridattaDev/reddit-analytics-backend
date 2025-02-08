// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <h2>🔥 Reddit Analytics</h2>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/posts" style={styles.link}>Posts</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: "flex", justifyContent: "space-between", padding: "10px", background: "#282c34", color: "white" },
  link: { marginLeft: "10px", textDecoration: "none", color: "lightblue" },
};

export default Navbar;
