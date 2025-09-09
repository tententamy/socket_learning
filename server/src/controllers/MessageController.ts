import { Request, Response } from "express";
import { prisma } from "../config/db";
import { Server } from "socket.io";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";
import multer from "multer";

export class MessageController {
  constructor(private io: Server) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const messages = await prisma.message.findMany({
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
      });
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  };

  upload = async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const mimeType = file.mimetype;
      let resourceType: "image" | "video" | "raw" | "auto" = "raw";

      if (mimeType.startsWith('image/')) resourceType = "image";
      else if (mimeType.startsWith('video/')) resourceType = "video";
      else if (mimeType.startsWith('audio/')) resourceType = "raw";
      else resourceType = "raw";

      const streamUpload = (fileBuffer: Buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "chat-app",
              resource_type: resourceType,
              public_id: `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
              use_filename: true,
              unique_filename: false,
              access_mode: "public",
              context: {
                original_name: file.originalname,
                file_size: file.size.toString(),
                upload_date: new Date().toISOString()
              }
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result: any = await streamUpload(file.buffer);

      res.json({
        url: result.secure_url,
        fileName: file.originalname,
        fileType: result.resource_type || resourceType,
        fileSize: file.size,
        mimeType: file.mimetype
      });

    } catch (err) {
      console.error("❌ Upload failed", err);
      res.status(500).json({
        error: "Upload failed for this file type",
        details: err instanceof Error ? err.message : "Unknown error"
      });
    }
  };
  
  download = async (req: Request, res: Response) => {
    try {
      const { fileUrl } = req.query;
      
      if (!fileUrl || typeof fileUrl !== 'string') {
        return res.status(400).json({ error: "File URL is required" });
      }

      // Tạo signed URL từ Cloudinary để download
      const signedUrl = cloudinary.url(fileUrl, {
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        resource_type: "raw"
      });

      // Redirect đến signed URL
      res.redirect(signedUrl);
      
    } catch (err) {
      console.error("❌ Download failed", err);
      res.status(500).json({ error: "Download failed" });
    }
  };

  // Endpoint mới để tạo download link
  getDownloadLink = async (req: Request, res: Response) => {
    try {
      const { fileUrl } = req.query;
      
      if (!fileUrl || typeof fileUrl !== 'string') {
        return res.status(400).json({ error: "File URL is required" });
      }

      // Tạo signed URL từ Cloudinary
      const signedUrl = cloudinary.url(fileUrl, {
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        resource_type: "raw"
      });

      res.json({
        downloadUrl: signedUrl,
        expiresIn: 3600 // 1 hour in seconds
      });
      
    } catch (err) {
      console.error("❌ Generate download link failed", err);
      res.status(500).json({ error: "Failed to generate download link" });
    }
  };

  // // Endpoint mới để lấy file dưới dạng byte array
  // getFileBytes = async (req: Request, res: Response) => {
  //   try {
  //     const { fileUrl } = req.query;
      
  //     if (!fileUrl || typeof fileUrl !== 'string') {
  //       return res.status(400).json({ error: "File URL is required" });
  //     }

  //     console.log(`📥 Getting file bytes for: ${fileUrl}`);

  //     // Extract public_id từ URL
  //     const urlParts = fileUrl.split('/');
  //     const uploadIndex = urlParts.findIndex(part => part === 'upload');
  //     if (uploadIndex === -1) {
  //       throw new Error('Invalid Cloudinary URL');
  //     }
      
  //     const publicIdParts = urlParts.slice(uploadIndex + 1);
  //     const publicId = publicIdParts.join('/').split('.')[0];
      
  //     console.log(`🔍 Public ID: ${publicId}`);

  //     // Sử dụng Cloudinary SDK để lấy file
  //     const result = await cloudinary.api.resource(publicId, {
  //       resource_type: "raw"
  //     });

  //     console.log(`✅ Got resource info: ${result.secure_url}`);

  //     // Fetch file từ secure URL
  //     const response = await fetch(result.secure_url);
      
  //     if (!response.ok) {
  //       console.error(`❌ Fetch failed: ${response.status} ${response.statusText}`);
  //       return res.status(404).json({ error: "File not found" });
  //     }

  //     // Lấy file dưới dạng buffer
  //     const buffer = await response.arrayBuffer();
  //     const bytes = new Uint8Array(buffer);

  //     // Lấy thông tin file
  //     const contentType = response.headers.get('content-type') || 'application/octet-stream';
  //     const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'download';

  //     console.log(`✅ File bytes retrieved: ${bytes.length} bytes, type: ${contentType}`);

  //     // Set headers cho download
  //     res.setHeader('Content-Type', contentType);
  //     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  //     res.setHeader('Content-Length', bytes.length);

  //     // Trả về byte array trực tiếp
  //     res.send(Buffer.from(bytes));
      
  //   } catch (err) {
  //     console.error("❌ Get file bytes failed", err);
  //     res.status(500).json({ error: "Failed to get file bytes" });
  //   }
  // };

  // // Endpoint để force public tất cả file
  // makeFilesPublic = async (req: Request, res: Response) => {
  //   try {
  //     console.log(`🔧 Making all files public...`);
      
  //     // Lấy tất cả file trong folder chat-app
  //     const result = await cloudinary.api.resources({
  //       type: "upload",
  //       resource_type: "raw",
  //       prefix: "chat-app/",
  //       max_results: 500
  //     });

  //     console.log(`📁 Found ${result.resources.length} files`);

  //     // Update từng file để public
  //     const updatePromises = result.resources.map(async (resource: any) => {
  //       try {
  //         await cloudinary.api.update(resource.public_id, {
  //           resource_type: "raw",
  //           access_mode: "public",
  //           type: "upload"
  //         });
  //         console.log(`✅ Made public: ${resource.public_id}`);
  //         return { success: true, public_id: resource.public_id };
  //       } catch (error) {
  //         console.error(`❌ Failed to make public: ${resource.public_id}`, error);
  //         return { success: false, public_id: resource.public_id, error };
  //       }
  //     });

  //     const results = await Promise.all(updatePromises);
  //     const successCount = results.filter(r => r.success).length;
  //     const failCount = results.filter(r => !r.success).length;

  //     console.log(`✅ Made ${successCount} files public, ${failCount} failed`);

  //     res.json({
  //       message: `Made ${successCount} files public, ${failCount} failed`,
  //       total: result.resources.length,
  //       success: successCount,
  //       failed: failCount,
  //       results: results
  //     });
      
  //   } catch (err) {
  //     console.error("❌ Make files public failed", err);
  //     res.status(500).json({ error: "Failed to make files public" });
  //   }
  // };
}
