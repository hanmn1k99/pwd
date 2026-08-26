<div align="center">
    
# 🔐 Node Pass Manager

[![Author](https://img.shields.io/badge/Author-Nguy%E1%BB%85n%20Minh%20H%C3%A2n-blue.svg)](https://minhhan.net)
[![Email](https://img.shields.io/badge/Email-han%40minhhan.net-red.svg)](mailto:han@minhhan.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![NodeJS](https://img.shields.io/badge/Node.js-v14%2B-brightgreen.svg)](https://nodejs.org/)

Hệ thống quản lý mật khẩu cá nhân/đội nhóm nội bộ siêu nhẹ, bảo mật cao và giao diện Dark mode hiện đại.

</div>

---

## 🎯 Giới thiệu
**Node Pass Manager** (hay Kho Mật Khẩu MinhHan) là một hệ thống tự host (Self-hosted) giúp bạn lưu trữ và quản lý hàng trăm mật khẩu của các nền tảng khác nhau một cách an toàn. Đặc biệt phù hợp cho cá nhân hoặc các đội nhóm cần chia sẻ mật khẩu nội bộ mà không muốn bị lộ mật khẩu gốc.

### ✨ Tính năng nổi bật:
- 🚀 **Kiến trúc SPA siêu mượt:** Mọi thao tác Thêm/Sửa/Xóa đều chạy ẩn qua AJAX, không bao giờ phải reload lại trang.
- 🎨 **Giao diện Modern Dark Mode:** Thiết kế tinh tế, lấy cảm hứng từ các UI hiện đại nhất hiện nay. Thân thiện với mắt.
- 👥 **Quản lý phân quyền (Role-based):**
  - **Admin:** Có toàn quyền thêm/sửa/xóa, xem được mật khẩu gốc.
  - **User:** Chỉ được phép bấm nút "Copy mật khẩu" (không nhìn thấy ký tự thật) đối với những tài khoản được Admin phân quyền chia sẻ.
- 🔒 **Bảo mật kép:** Mật khẩu lưu vào Database được mã hóa AES-256. Mật khẩu đăng nhập Web được băm (Hash) bằng Bcrypt.

---

## 🛠️ Hướng dẫn cài đặt (Installation)

Yêu cầu hệ thống: Máy chủ/VPS chạy Linux (Ubuntu/CentOS), đã cài đặt Node.js và NPM.

1. **Clone mã nguồn về máy**
   ```bash
   git clone https://github.com/hanmn1k99/pwd.git
   cd pwd
   ```

2. **Cài đặt thư viện**
   ```bash
   npm install
   ```

3. **Khởi động ứng dụng (Khuyên dùng PM2 để chạy ngầm)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "pwd-mgn"
   ```

4. **Khởi tạo hệ thống (Setup lần đầu)**
   - Truy cập vào địa chỉ `http://IP-VPS-CỦA-BẠN:3333`.
   - Hệ thống sẽ tự động chặn và yêu cầu bạn tạo Tài khoản Admin và Mật khẩu đầu tiên.
   - Nhập thông tin và bấm **Hoàn tất cài đặt**.
   - (Lưu ý: Màn hình Setup này sẽ vĩnh viễn bị khóa lại sau khi tạo xong Admin đầu tiên để đảm bảo an toàn tuyệt đối).

---

## 📖 Hướng dẫn sử dụng (Usage)

- **Truy cập Web:** Mở trình duyệt và truy cập `http://IP-VPS-CỦA-BẠN:3333`
- **Đăng nhập:** Sử dụng tài khoản và mật khẩu Admin mà bạn đã thiết lập trong `config.js`.
- **Thêm mật khẩu:** Bấm nút **Thêm mới**, điền tên gợi nhớ, tài khoản, mật khẩu. Bạn có thể chọn chia sẻ mật khẩu này cho các User khác bằng cách click vào các thẻ tên (Badge) tương ứng.
- **Tạo tài khoản phụ (User):** Admin có thể bấm nút **User** để tạo thêm tài khoản cho nhân viên/thành viên team. Các User này chỉ thấy được những mật khẩu mà bạn đã tick chia sẻ cho họ.
- **Copy mật khẩu:** Bấm vào biểu tượng Copy 📋 bên cạnh dãy dấu `••••••••` để copy nhanh vào bộ nhớ tạm mà không cần hiển thị mật khẩu.

---

## 👨‍💻 Tác giả (Author)

Dự án được thiết kế và phát triển bởi:
- **Tên:** Nguyễn Minh Hân
- **Website:** [minhhan.net](https://minhhan.net)
- **Email:** [han@minhhan.net](mailto:han@minhhan.net)

Nếu thấy dự án hữu ích, đừng quên cho mình 1 ⭐ trên Github nhé!
