import Link from 'next/link';
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useRouter } from 'next/router';

const Nav = () => {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  return (
    <nav className="routes">
          <Link href="/" className="navitems">
            Home
          </Link>
          <Link href='/transactions' className="navitems">
            Transaction History
          </Link>
          <Link href='/mintfungibletokens' className="navitems">
            Mint tokens
          </Link>
    </nav>
  );
};

export default Nav;