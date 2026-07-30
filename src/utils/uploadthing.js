import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing } =
  generateReactHelpers({
    url: "http://localhost:8080/api/uploadthing"
});