#!/bin/bash
echo "CẢNH BÁO: Tập lệnh này sẽ XÓA TOÀN BỘ dữ liệu (Tài khoản Admin, User, Mật khẩu, v.v.)"
read -p "Bạn có chắc chắn muốn tiếp tục không? (y/n): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Đã hủy thao tác xóa dữ liệu."
    exit 1
fi

echo "Đang xóa cơ sở dữ liệu (database.db)..."
rm -f database.db

echo "Đang khởi động lại Server để áp dụng thay đổi..."
pm2 restart pwd-mgn

echo "================================================="
echo "Xóa dữ liệu thành công!"
echo "Truy cập ngay vào website để tiến hành Setup lại từ đầu."
echo "================================================="
