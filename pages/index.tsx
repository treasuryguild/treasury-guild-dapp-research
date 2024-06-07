import { useState } from "react";
import type { NextPage } from "next";
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const router = useRouter()

  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <>
    <div className={styles.main}>
      <div className={styles.body}>
        <div>
            <h1 className={styles.title}>Welcome to the Treasury Guild</h1>
            <p className={styles.description}>
                {`Treasury Guild is a place where you can manage your project's budget and transactions.`}
            </p>
            <div className={styles.grid}>
                <Link href="/txbuilder" className={styles.card}>              
                    <h2>Create a Transaction &rarr;</h2>
                    <p>Submit a new transaction to the blockchain</p>
                </Link>
                <Link href="/transactions" className={styles.card}>             
                    <h2>View Transactions &rarr;</h2>
                    <p>View all transactions submitted by your project</p>           
                </Link>
                <Link href="/wallet" className={styles.card}>               
                    <h2>View Wallet &rarr;</h2>
                    <p>{`View your project's wallet balance`}</p>
                </Link>
            </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;