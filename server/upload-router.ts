import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { uploadMediaFile } from "./media-upload";

export const uploadRouter = router({
  // Upload media file (image or video)
  uploadMedia: publicProcedure
    .input(z.object({
      jobId: z.number(),
      filename: z.string(),
      mimeType: z.string(),
      base64Data: z.string(), // Base64 encoded file data
    }))
    .mutation(async ({ input }) => {
      // Convert base64 to buffer
      const fileBuffer = Buffer.from(input.base64Data, 'base64');
      
      // Upload file
      const mediaFile = await uploadMediaFile(
        fileBuffer,
        input.filename,
        input.mimeType,
        input.jobId
      );
      
      return mediaFile;
    }),
});

