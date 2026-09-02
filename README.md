<div align="center">
    
# 🔐 Kho Mật Khẩu MinhHan (Node Pass Manager)

[![Author](https://img.shields.io/badge/Author-Nguy%E1%BB%85n%20Minh%20H%C3%A2n-blue.svg?style=for-the-badge)](https://minhhan.net)
[![Email](https://img.shields.io/badge/Email-han%40minhhan.net-red.svg?style=for-the-badge)](mailto:han@minhhan.net)
[![Version](https://img.shields.io/badge/Version-2.1.0-orange.svg?style=for-the-badge)](https://github.com/hanmn1k99/pwd)
[![NodeJS](https://img.shields.io/badge/Node.js-v18%2B-brightgreen.svg?style=for-the-badge)](https://nodejs.org/)

Hệ thống quản lý mật khẩu cá nhân/đội nhóm nội bộ siêu nhẹ, bảo mật cao, giao diện Dark mode hiện đại chuẩn SPA.

</div>

---

## 🎯 Giới thiệu
**Kho Mật Khẩu MinhHan** (Node Pass Manager) là một hệ thống tự lưu trữ (Self-hosted) giúp bạn quản lý hàng trăm mật khẩu một cách an toàn nhất. Đặc biệt phù hợp cho các doanh nghiệp, đội nhóm cần chia sẻ quyền truy cập tài khoản nội bộ mà không muốn bị lộ mật khẩu gốc.

### 🚀 Tính năng nổi bật:
- ⚡ **Kiến trúc SPA (Single Page Application) mượt mà:** Mọi thao tác Thêm/Sửa/Xóa đều chạy ngầm qua AJAX. Giao diện thay đổi tức thì mà không bao giờ phải tải lại trang. Các thông báo hệ thống tự động trượt ẩn đi cực kỳ tinh tế.
- 📱 **PWA (Tiêu chuẩn Ứng dụng Web) & Caching:** Tích hợp sẵn Service Worker thông minh (Network-first), không lưu cache bậy bạ gây lỗi F5. Có thể cài đặt thành một Ứng dụng thực thụ trên điện thoại (iOS/Android) hoặc Desktop.
- 🎨 **Giao diện Modern UI:** Hỗ trợ chuyển đổi tự động Light/Dark Mode thân thiện với mắt. Thanh Navbar tùy biến hiển thị logo ngang sắc nét thay cho text đơn điệu.
- 🛡️ **Quản lý phân quyền nghiêm ngặt (Role-based):**
  - **Admin:** Toàn quyền hệ thống, xem mật khẩu gốc, quản lý User.
  - **User:** Chỉ được cấp nút "Copy mật khẩu" (ẩn hoàn toàn các ký tự mật khẩu thực sự). Chỉ nhìn thấy những tài khoản mà Admin chủ động "share".
- 🔒 **Bảo mật kép (Double Security):** Mật khẩu lưu vào SQLite được mã hóa chuẩn **AES-256**. Mật khẩu đăng nhập Web được băm bằng **Bcrypt**. Hỗ trợ ẩn IP/Email qua Cloudflare Proxy cực an toàn.

---

## ⚙️ Hướng dẫn cài đặt (Installation)

Yêu cầu hệ thống: Máy chủ/VPS chạy Linux (Ubuntu/CentOS), đã cài đặt Node.js và NPM.

### 1. Triển khai mã nguồn
```bash
git clone https://github.com/hanmn1k99/pwd.git
cd pwd
npm install
```

### 2. Khởi động hệ thống (Khuyên dùng PM2)
```bash
npm install -g pm2
pm2 start server.js --name "pwd-mgn"
pm2 save
```
*(Lệnh `pm2 save` đảm bảo hệ thống tự động khởi động lại mỗi khi VPS bị sập nguồn).*

### 3. Thiết lập hệ thống lần đầu (First-time Setup)
- Truy cập vào địa chỉ `http://IP-VPS-CỦA-BẠN:3333`.
- Giao diện **Setup** sẽ tự động kích hoạt. Bạn chỉ cần điền **Tài khoản & Mật khẩu Admin** đầu tiên.
- Bấm **Hoàn tất**. Màn hình Setup này sẽ vĩnh viễn khóa lại để ngăn chặn kẻ gian xâm nhập tái thiết lập.

---

## 📖 Hướng dẫn sử dụng & Mẹo (Tips)

- **Chia sẻ mật khẩu an toàn:** Khi Thêm mới 1 tài khoản (ví dụ: Tài khoản Netflix), hãy tick vào tên những User (Nhân viên) mà bạn muốn cho dùng chung. Họ vào web chỉ thấy nút COPY chứ không thấy chữ.
- **Tính năng Cập nhật thần tốc:** Khi có bản cập nhật tính năng mới trên Github, chỉ cần gõ 1 lệnh duy nhất trên VPS:
  ```bash
  bash update.sh
  ```
  Hệ thống sẽ tự động Pull code, cập nhật thư viện và khởi động lại ngầm, dữ liệu cũ của bạn **không bao giờ bị mất**. *(Lưu ý: Luôn bấm `Ctrl + F5` ở trình duyệt để xóa Cache giao diện).*
- **Reset hệ thống:** Nếu muốn xóa sạch sành sanh làm lại từ đầu (Factory Reset), chỉ cần gõ:
  ```bash
  bash clear.sh
  ```
- **Lỗi không đăng nhập được (Cache Loop):** Nếu gặp lỗi `ERR_FAILED` hoặc vòng lặp đăng nhập, hãy ấn `Ctrl + F5` hoặc xóa Cache/Service Worker trên trình duyệt để giải phóng phiên làm việc cũ.

---

## 👨‍💻 Tác giả (Author)

Dự án được thiết kế và phát triển bởi:
- **Tên:** Nguyễn Minh Hân
- **Website:** [minhhan.net](https://minhhan.net)
- **Email:** [han@minhhan.net](mailto:han@minhhan.net)

⭐ *Nếu thấy dự án hữu ích, đừng quên cho mình 1 sao trên Github nhé!*
