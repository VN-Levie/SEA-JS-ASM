# Task Management CLI (Day 07)

## 1. Mục tiêu và tổng quan ứng dụng

- Xây dựng ứng dụng quản lý công việc (Task Management) chạy trên dòng lệnh (CLI) bằng TypeScript.
- Hỗ trợ quản lý task, user, phân công, cập nhật trạng thái, ưu tiên, hạn chót, lưu trữ file JSON.
- Áp dụng kiến trúc hướng đối tượng, decorator, và các kỹ thuật TypeScript nâng cao.

## 2. Luồng hoạt động chi tiết

- Người dùng thao tác qua menu CLI (Inquirer).
- Thêm/sửa/xóa task, cập nhật trạng thái, chỉnh sửa chi tiết, phân công cho user.
- Thêm/xem danh sách user.
- Dữ liệu được lưu tự động vào file JSON (auto-save khi thoát).
- Có thể mở rộng lưu trữ qua API hoặc database.

## 3. Lý do thiết kế

- **Tách riêng logic quản lý task/user:** Sử dụng class `TaskManager` để gom toàn bộ nghiệp vụ.
- **Kiểm soát dữ liệu chặt chẽ:** Sử dụng TypeScript để định nghĩa kiểu dữ liệu, tránh lỗi khi thao tác.
- **Dễ mở rộng:** Có thể thay đổi backend lưu trữ (file, API, DB) chỉ bằng thay đổi service.

## 4. Các package được sử dụng

- **chalk:** In màu sắc cho menu, thông báo.
- **cli-table3:** Hiển thị bảng (nếu cần).
- **inquirer:** Nhận input từ người dùng qua terminal.
- **fs, path:** Đọc/ghi file dữ liệu JSON.

## 5. Các phần TypeScript đã sử dụng

- Interface, Enum, Class, Decorator, Generics, Type Assertion.
- Module import/export, async/await, type inference.

## 6. Các khái niệm TypeScript đã áp dụng

- **Decorator:** Ghi log khi tạo class, gọi method (LogClassCreation, LogMethodIO).
- **OOP:** Quản lý nghiệp vụ qua class, chia nhỏ module.
- **Type Safety:** Định nghĩa rõ kiểu dữ liệu cho mọi entity.

## 7. Một số điểm nổi bật về kỹ thuật

- **Auto-save khi thoát:** Dùng process event để lưu dữ liệu khi Ctrl+C hoặc exit.
- **Lưu trữ linh hoạt:** Có thể chuyển đổi giữa lưu file, API, DB qua interface `IStorageService`.
- **Xử lý ngày tự nhiên:** Hỗ trợ nhập hạn chót dạng "7 days", "2024-06-30", "1 month"...
- **Decorator logging:** Theo dõi log khi gọi các method nghiệp vụ.

## 8. Định hướng mở rộng

- Thêm chức năng thống kê, lọc, tìm kiếm nâng cao.
- Thêm xác thực đăng nhập cho user.
- Chuyển sang lưu dữ liệu bằng database thực thụ (SQLite, MongoDB, ...).
- Xây dựng giao diện web hoặc app di động dựa trên nền tảng logic đã có.

---

**Tóm lại:**  
Ứng dụng này là ví dụ điển hình cho việc sử dụng TypeScript để xây dựng ứng dụng quản lý nhỏ, tận dụng các tính năng mạnh mẽ của TS để đảm bảo an toàn, rõ ràng, dễ mở rộng và bảo trì. Thiết kế hướng đối tượng, kiểm soát dữ liệu chặt chẽ, giao diện thân thiện giúp ứng dụng dễ sử dụng và phát triển thêm trong tương lai.

---

## Hướng dẫn chạy

```bash
cd day07
npm install
npm run dev
```

> Nếu muốn build và chạy file đã biên dịch:
> ```bash
> npm run build
> npm start
> ```

---

## Cấu trúc thư mục

- `src/models/` - Định nghĩa entity (Task, User, ...)
- `src/services/` - Quản lý nghiệp vụ, lưu trữ, interface storage
- `src/utils/` - Hàm tiện ích, decorator, format, ...
- `src/app.ts` - Điểm vào chính (CLI)

---


