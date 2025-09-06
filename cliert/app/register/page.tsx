import AuthForm from "../../components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng ký</h1>
          <p className="text-gray-600">Tạo tài khoản mới để bắt đầu chat</p>
        </div>
        <AuthForm type="register" />
      </div>
    </div>
  );
}
