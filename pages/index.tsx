import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import cookie from 'cookie';

function getUserFromCookie(cookies?: string): User | null {
  if (cookies) {
    console.log(cookies);
    const parsed = cookie.parse(cookies);
    const authCookie = parsed.auth;
    if (authCookie) {
      console.log(authCookie);
      return JSON.parse(authCookie);
    }
  }
  return null;
}


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = getUserFromCookie(ctx.req.headers.cookie);

  return {
    props: {
      user,
    },
  };
};

interface Props {
  user?: User;
}

const Home: NextPage<Props> = ({ user }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {user ? (
          <>
            <h1>Hello {user.name}</h1>
            <a href="/auth/logout">Logout</a>
          </>
        ) : (
          <>
            <a href="/auth/login">Login</a>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
