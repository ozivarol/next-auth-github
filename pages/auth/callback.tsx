import { GetServerSideProps, NextPage } from 'next';
import cookie from 'cookie';
import { useEffect } from 'react';

function validateState(state?: string | string[], cookies?: string): boolean {
  if (cookies) {
    const parsed = cookie.parse(cookies);
    const authCookie = parsed.authState;
    if (authCookie) {
      return state === authCookie;
    }
  }
  return false;
}

async function getTokenFromCode(
  code: string | string[]
): Promise<string | null> {
  if (code) {
    const res = await fetch(
      `https://github.com/login/oauth/access_token?` +
        `client_id=da49f68ac43db28dfd0e&` +
        `client_secret=901770d363da71f9c2e0052e720c578c2fbffae5&` +
        `code=${code}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const data = await res.json();
    return data.access_token;
  }

  return null;
}

async function getUserFromToken(token: string): Promise<User | null> {
  if (token) {
    const res = await fetch(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/json',
      },
    });
    
    const data = await res.json();
    console.log(data)

    return {
      id: data.id,
      name: data.name,
      token:token
    };
  }

  return null;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { code, state } = ctx.query;

  if (code) {
    if (validateState(state, ctx.req.headers.cookie)) {
      const token = await getTokenFromCode(code);

      if (token) {
        const user = await getUserFromToken(token);

        if (user) {
          const authCookie = cookie.serialize('auth', JSON.stringify(user), {
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });

          ctx.res.setHeader('Set-Cookie', authCookie);
        }
      }
    }
  }

  return {
    props: {},
  };
};

const Callback: NextPage = () => {
  useEffect(() => {
    location.href = '/';
  }, []);
  return null;
};

export default Callback;
