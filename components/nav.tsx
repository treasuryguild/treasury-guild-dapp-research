import Link from 'next/link';
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useRouter } from 'next/router';
import styles from '../styles/Nav.module.css';

const Nav = () => {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  return (
    <nav className={styles.routes}>
          <Link href="/" className={styles.navitems}>
            Home
          </Link>
          <Link href='/txbuilder' className={styles.navitems}>
            Build Transaction
          </Link>
          <Link href='/transactions' className={styles.navitems}>
            Transaction History
          </Link>
    </nav>
  );
};

export default Nav;