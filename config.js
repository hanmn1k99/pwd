module.exports = {
    // Tên ứng dụng hiển thị trên thanh tiêu đề và logo
    SITE_NAME: "Kho Mật Khẩu MinhHan",
    
    // Cổng chạy ứng dụng (Mặc định: 3333)
    PORT: 3333,
    
    // Khóa bảo mật đăng nhập (Bạn nên đổi thành một chuỗi ngẫu nhiên dài dài)
    SESSION_SECRET: "minhhan-super-secret-key-2026",
    
    // Màu sắc chủ đạo của nút bấm và logo (Dùng mã màu Bootstrap: primary, dark, success, danger, info)
    THEME_COLOR: "primary",
    
    // Tài khoản Admin khởi tạo (Sẽ tự động tạo nếu chưa có trong DB)
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "admin123"
};
