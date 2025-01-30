'use server';

import { createAdminClient } from '@/lib/appwrite';
import { InputFile } from 'node-appwrite/file';
import { appwirteConfig } from '../appwrite/config';
import { ID } from 'node-appwrite';
import { constructFileUrl, getFileType, parseStringify } from '../utils';
import { revalidatePath } from 'next/cache';

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const buckerFile = await storage.createFile(
      appwirteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(buckerFile.name).type,
      name: buckerFile.name,
      url: constructFileUrl(buckerFile.$id),
      extension: getFileType(buckerFile.name).extension,
      size: buckerFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: buckerFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwirteConfig.databaseId,
        appwirteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwirteConfig.bucketId, buckerFile.$id);
        handleError(error, 'Failed to create file document');
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, 'Failed to upload file');
  }
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};
