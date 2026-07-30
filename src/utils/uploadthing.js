import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing } =
  generateReactHelpers({
    url: import.meta.env.VITE_API_URL + "/api/uploadthing"
});