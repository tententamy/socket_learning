# Chat App - Ứng dụng Chat Real-time

Ứng dụng chat hiện đại được xây dựng với Next.js, Socket.io, và PostgreSQL.

## ✨ Tính năng

- 💬 **Tin nhắn real-time** - Gửi và nhận tin nhắn tức thì
- 📁 **Chia sẻ file đa dạng** - Hỗ trợ hình ảnh, video, âm thanh, PDF, Word, Excel, và nhiều loại file khác
- 🔐 **Bảo mật cao** - Hệ thống xác thực JWT với refresh token
- 🚀 **Auto-login** - Tự động đăng nhập khi có token hợp lệ
- 🎨 **Giao diện đẹp** - UI/UX hiện đại với Tailwind CSS

## 🛠️ Công nghệ sử dụng

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Cloudinary** - File storage
- **Multer** - File upload handling

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd socket_learning
```

### 2. Cài đặt dependencies

#### Server
```bash
cd server
npm install
```

#### Client
```bash
cd cliert
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` trong thư mục `server`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/chatdb"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### 4. Chạy database
```bash
cd postgres-docker
docker-compose up -d
```

### 5. Chạy migrations
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 6. Chạy ứng dụng

#### Server (Port 6112)
```bash
cd server
npm run dev
```

#### Client (Port 4000)
```bash
cd cliert
npm run dev
```

## 📱 Cách sử dụng

1. **Truy cập ứng dụng**: Mở trình duyệt và vào `http://localhost:4000`
2. **Đăng ký tài khoản**: Nhấn "Đăng ký" và tạo tài khoản mới
3. **Đăng nhập**: Sử dụng tài khoản đã tạo để đăng nhập
4. **Chat**: Gửi tin nhắn và chia sẻ file với người khác
5. **Auto-login**: Lần sau truy cập sẽ tự động đăng nhập

## 🔧 Cấu trúc dự án

```
socket_learning/
├── cliert/                 # Frontend (Next.js)
│   ├── app/               # App Router
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   └── utils/            # API utilities
├── server/               # Backend (Express.js)
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── routes/       # API routes
│   │   ├── socket/       # Socket.io handlers
│   │   └── config/       # Configuration
│   └── prisma/          # Database schema
└── postgres-docker/     # Database setup
```

## 🔐 Bảo mật

- **JWT Access Token**: Hết hạn sau 15 phút
- **JWT Refresh Token**: Hết hạn sau 7 ngày
- **Auto-refresh**: Tự động làm mới token khi hết hạn
- **Secure logout**: Xóa refresh token khỏi database khi đăng xuất

## 📁 Hỗ trợ file

Ứng dụng hỗ trợ upload và hiển thị nhiều loại file:

- **Hình ảnh**: JPG, PNG, GIF, WebP, BMP
- **Video**: MP4, WebM, AVI, MOV, MKV
- **Âm thanh**: MP3, WAV, OGG, M4A
- **Tài liệu**: PDF, DOC, DOCX, XLS, XLSX
- **Nén**: ZIP, RAR, 7Z, TAR, GZ
- **Khác**: Tất cả các loại file khác

## 🚀 Deployment

### Docker
```bash
# Server
cd server
docker build -t chat-server .
docker run -p 6112:6112 chat-server

# Client
cd cliert
docker build -t chat-client .
docker run -p 4000:4000 chat-client
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub.

---

**Lưu ý**: Đảm bảo đã cài đặt Node.js (v18+), Docker, và PostgreSQL trước khi chạy ứng dụng.
