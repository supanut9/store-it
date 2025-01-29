'use server';

import { Account, Avatars, Client, Databases, Storage } from 'node-appwrite';
import { appwirteConfig } from './config';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const createSessionClient = async () => {
  const client = new Client();
  client.setEndpoint(appwirteConfig.endpointUrl);
  client.setProject(appwirteConfig.projectId);

  const session = (await cookies()).get('appwrite-session');

  if (!session || !session.value) {
    redirect('/sign-in');
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
};

export const createAdminClient = async () => {
  const client = new Client();
  client.setEndpoint(appwirteConfig.endpointUrl);
  client.setProject(appwirteConfig.projectId);
  client.setKey(appwirteConfig.secretKey);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get avatars() {
      return new Avatars(client);
    },
  };
};
