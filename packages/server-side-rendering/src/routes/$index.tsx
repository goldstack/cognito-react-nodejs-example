import React, { useState } from 'react';
import { SSRHandler } from '@goldstack/template-ssr';

import { renderPage, hydrate } from './../render';
import styles from './$index.module.css';

import {
  getLoggedInUser,
  handleRedirectCallback,
  loginWithRedirect,
} from 'user-management';

const Index = (props: { message: string }): JSX.Element => {
  const user = getLoggedInUser();
  handleRedirectCallback();
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col mt-4">
            <div className="card">
              <div className="card-body">
                {!user && <>No user is signed in.</>}
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
              <button type="button" className="btn btn-info">
                Register
              </button>{' '}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: SSRHandler = async (event, context) => {
  const message = 'Hi there';

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
