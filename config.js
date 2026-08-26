require('dotenv').config();

module.exports = {
    // Tên ứng dụng hiển thị trên thanh tiêu đề và logo
    SITE_NAME: process.env.SITE_NAME || "Kho Mật Khẩu MinhHan",
    
    // Cổng chạy ứng dụng (Mặc định: 3333)
    PORT: process.env.PORT || 3333,
    
    // Khóa bảo mật đăng nhập (Bạn nên đổi thành một chuỗi ngẫu nhiên dài dài)
    SESSION_SECRET: process.env.SESSION_SECRET || "minhhan-super-secret-key-2026",
    
    // Màu sắc chủ đạo của nút bấm và logo (Dùng mã màu Bootstrap: primary, dark, success, danger, info)
    THEME_COLOR: process.env.THEME_COLOR || "primary",
    
    // Đọc tài khoản Admin từ biến môi trường (.env), bảo mật tuyệt đối
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
};
