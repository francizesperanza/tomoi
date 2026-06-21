import { createUploadthing, createRouteHandler } from "uploadthing/express";

const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    return {
      url: file.url,
      key: file.key,
      name: file.name,
      size: file.size,
    };
  }),
};

export const uploadthingHandler = createRouteHandler({
  router: uploadRouter,
  config: {
    uploadthingSecret: process.env.UPLOADTHING_SECRET, 
    uploadthingAppId: process.env.UPLOADTHING_APP_ID, 
    token: process.env.UPLOADTHING_TOKEN, 
  }
});