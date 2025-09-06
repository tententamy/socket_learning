# Cloudinary Setup Guide

## 1. Tạo Upload Preset

1. Đăng nhập vào [Cloudinary Dashboard](https://cloudinary.com/console)
2. Vào **Settings** → **Upload**
3. Scroll xuống **Upload presets**
4. Click **Add upload preset**
5. Điền thông tin:
   - **Preset name**: `chat-app`
   - **Signing Mode**: `Unsigned` (để client có thể upload trực tiếp)
   - **Folder**: `chat-app`
   - **Resource Type**: `Auto`
   - **Use filename**: ✅ Checked
   - **Unique filename**: ❌ Unchecked (để giữ tên file gốc)

## 2. Cập nhật Cloud Name

1. Trong Cloudinary Dashboard, copy **Cloud name** của bạn
2. Mở file `cliert/lib/cloudinary.ts`
3. Thay `"demo"` bằng cloud name thực tế:

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: "your-actual-cloud-name", // Thay bằng cloud name thực tế
  uploadPreset: "chat-app",
  folder: "chat-app"
};
```

## 3. Test Upload

Sau khi setup xong, bạn có thể:
- Upload file bất kỳ size nào (không bị giới hạn 50MB)
- File sẽ giữ nguyên tên gốc
- Upload trực tiếp từ client lên Cloudinary
- Server chỉ nhận URL và lưu vào database

## Lưu ý

- Upload preset phải được set là **Unsigned** để client có thể upload
- File sẽ được lưu trong folder `chat-app` trên Cloudinary
- Tên file sẽ giữ nguyên như ban đầu
