#!/bin/bash
echo "Đang kéo code mới nhất từ kho GitHub..."
git pull origin main

echo "Đang cài đặt/cập nhật thư viện Node.js (nếu có)..."
npm install

echo "Đang khởi động lại ứng dụng qua PM2..."
pm2 restart pwd-mgn

echo "Xong! Ứng dụng đã được cập nhật bản mới nhất."
