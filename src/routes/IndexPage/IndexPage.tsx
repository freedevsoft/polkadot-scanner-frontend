import * as React from "react";
import styles from "./IndexPage.less";

const Index = () => {
  return (
    <div className={styles.normal}>
      <h1 className={styles.title}>Welcome Back</h1>
      <div className={styles.welcome} />
    </div>
  );
};

export default Index;
