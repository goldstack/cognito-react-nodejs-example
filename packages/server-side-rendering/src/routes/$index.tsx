import React, { useEffect, useState } from 'react';
import { SSRHandler } from '@goldstack/template-ssr';

import { connectWithCognito, performLogout } from 'user-management';

import type { ClientAuthResult } from 'user-management';

import { renderPage, hydrate } from './../render';
import styles from './$index.module.css';

import {
  getLoggedInUser,
  handleRedirectCallback,
  loginWithRedirect,
  signUpWithRedirect,
} from 'user-management';

function parseJwt(token: string): any {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

const Index = (props: { message?: string }): JSX.Element => {
  const [user, setUser] = useState<ClientAuthResult | undefined>(undefined);
  useEffect(() => {
    const user = getLoggedInUser();
    setUser(user);
  }, []);
  handleRedirectCallback();
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col mt-4">
            <div className="card">
              <div className="card-body">
                {!user && <>No user is signed in.</>}
                {user && <>User {parseJwt(user.idToken).email} signed in.</>}
              </div>
            </div>
            <div className="mt-2 d-grid gap-2 d-md-block">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  loginWithRedirect();
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-info"
                onClick={() => {
                  signUpWithRedirect();
                }}
              >
                Register
              </button>{' '}
            </div>

            {props.message && (
              <div className="card mt-2">
                <div className="card-body">
                  Server has successfully authenticated the user and says:{' '}
                  {props.message}
                </div>
              </div>
            )}

            {user && (
              <div className="mt-2 d-grid gap-2 d-md-block">
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => {
                    performLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

function getCookies(rc: string): any {
  const list = {};

  rc.split(';').forEach(function (cookie) {
    const parts = cookie.split('=');
    const shift = parts.shift();
    if (!shift) {
      return;
    }
    const key = shift.trim();
    const value = decodeURI(parts.join('='));
    if (key != '') {
      list[key] = value;
    }
  });
  return list;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: SSRHandler = async (event, context) => {
  let message: string | undefined = undefined;

  const cookies = getCookies((event.cookies || []).join(';'));
  if (cookies.goldstack_access_token) {
    const cognito = await connectWithCognito();
    await cognito.validate(cookies.goldstack_access_token);
    const idToken = await cognito.validateIdToken(cookies.goldstack_id_token);
    message = `Hello ${idToken.email}`;
  }
  return renderPage({
    component: Index,
    appendToHead: '<title>SSR Template</title>',
    properties: {
      message,
    },
    entryPoint: __filename,
    event,
  });
};

hydrate(Index);

export default Index;
