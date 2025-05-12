# Quản Lý Thư Viện Sách - Tài liệu chi tiết

## 1. Mục tiêu và tổng quan ứng dụng
Ứng dụng quản lý thư viện sách này mô phỏng quy trình quản lý sách, người dùng, hoạt động mượn/trả sách trong một thư viện nhỏ. Ứng dụng chạy trên dòng lệnh, sử dụng Node.js và TypeScript để đảm bảo an toàn kiểu dữ liệu, dễ bảo trì, mở rộng.

## 2. Luồng hoạt động chi tiết
- Khi khởi động, chương trình đọc dữ liệu sách từ books.json và người dùng từ users.json.
- Hiển thị menu chính với các lựa chọn: xem danh sách sách/người dùng, thêm sách/người dùng, mượn/trả sách, tìm kiếm, kiểm tra sách đang mượn, kiểm tra sách mà người dùng đang mượn.
- Người dùng nhập lựa chọn, chương trình thực hiện chức năng tương ứng:
  - **Thêm sách/người dùng:** Nhập thông tin, kiểm tra hợp lệ, lưu vào file.
  - **Mượn sách:** Kiểm tra điều kiện (tuổi tối thiểu, số lượng sách còn lại, số sách tối đa mỗi người, đã mượn chưa), cập nhật trạng thái, lưu lịch sử mượn.
  - **Trả sách:** Kiểm tra hợp lệ, cập nhật trạng thái, lưu lịch sử trả.
  - **Tìm kiếm:** Lọc theo tên sách/tác giả, hiển thị kết quả dạng bảng.
  - **Kiểm tra sách đang mượn:** Hiển thị danh sách sách đang được mượn và ai đang mượn.
  - **Kiểm tra sách người dùng đang mượn:** Hiển thị danh sách sách mà một người dùng đang mượn.
- Sau mỗi thao tác, chương trình quay lại menu chính cho đến khi người dùng chọn thoát.

## 3. Lý do thiết kế
- **Dữ liệu lưu file JSON:** Đơn giản, dễ kiểm tra, không cần cài đặt database phức tạp, phù hợp cho ứng dụng nhỏ hoặc demo.
- **Tách riêng logic quản lý sách/người dùng:** Sử dụng class Library để gom toàn bộ nghiệp vụ, giúp code rõ ràng, dễ mở rộng.
- **Kiểm soát chặt chẽ dữ liệu:** Sử dụng TypeScript để định nghĩa kiểu dữ liệu, tránh lỗi khi thao tác với dữ liệu phức tạp.
- **Giới hạn số sách mượn, kiểm tra tuổi:** Đảm bảo tuân thủ quy định thư viện thực tế, tăng tính thực tiễn.

## 4. Các package được sử dụng
- **chalk:** In màu sắc cho menu, thông báo, giúp giao diện dòng lệnh dễ nhìn, nổi bật.
- **cli-table3:** Hiển thị dữ liệu dạng bảng đẹp mắt trên terminal.
- **fs, path:** Đọc/ghi file dữ liệu JSON.
- **readline:** Nhận input từ người dùng qua terminal.

## 5. Các phần TypeScript đã sử dụng
- **Interface:**
  - `Book`, `BorrowRecord`, `User` định nghĩa cấu trúc dữ liệu rõ ràng. Ví dụ:
    ```typescript
    export interface Book {
        readonly id: number;
        title: string;
        author: string;
        copies: number;
        borrowedCount: number;
        borrowedBy?: number[];
        borrowedRecords?: BorrowRecord[];
        minAge?: number;
    }
    ```
- **Enum:**
  - `BookStatus` mô tả trạng thái sách (Available, Borrowed, Lost):
    ```typescript
    export enum BookStatus {
        Available,
        Borrowed,
        Lost
    }
    ```
- **Type Annotation:**
  - Khai báo kiểu cho biến, hàm, tham số, trả về, giúp phát hiện lỗi sớm.
- **Optional Property:**
  - Các thuộc tính như `borrowedBy?`, `borrowedRecords?`, `minAge?` cho phép linh hoạt khi dữ liệu có thể thiếu.
- **Readonly Property:**
  - `id` của Book, User không thể thay đổi sau khi khởi tạo.
- **Class:**
  - `Library` quản lý toàn bộ logic nghiệp vụ, đóng gói dữ liệu và phương thức thao tác.
- **Type Assertion:**
  - Khi đọc dữ liệu từ file JSON, có thể ép kiểu về mảng Book/User để đảm bảo an toàn.
- **Function Type:**
  - Định nghĩa kiểu cho callback function (ví dụ: callback: () => void).
- **Array Type:**
  - Sử dụng kiểu mảng cho books, users, borrowedBy, borrowedRecords.
- **Union Type:**
  - Hàm borrowBook trả về boolean hoặc string (boolean | string) để báo lỗi chi tiết.
- **Utility Type:**
  - Sử dụng `Partial<Book>` trong hàm `updateBook` để cập nhật sách khi mượn/trả:
    ```typescript
    updateBook(id: number, data: Partial<Book>): void {
        const idx = this.books.findIndex(b => b.id === id);
        if (idx !== -1) {
            this.books[idx] = { ...this.books[idx], ...data };
            this.saveToFile();
        }
    }
    ```

## 6. Các khái niệm TypeScript đã áp dụng
- **Kiểu dữ liệu tường minh:** Giúp kiểm soát lỗi khi thao tác với dữ liệu phức tạp.
- **Phân biệt rõ interface và class:** Interface định nghĩa cấu trúc, class đóng gói logic.
- **Thuộc tính tùy chọn, readonly:** Tăng tính an toàn, tránh sửa nhầm dữ liệu quan trọng.
- **Enum:** Quản lý trạng thái rõ ràng, dễ mở rộng.
- **Callback function và function type:** Hỗ trợ luồng bất đồng bộ, dễ kiểm soát.
- **Đọc/ghi file với kiểu dữ liệu xác định:** Tránh lỗi runtime, dễ bảo trì.
- **Type Assertion:** Đảm bảo dữ liệu đọc từ file đúng kiểu mong muốn.
- **Union Type:** Trả về nhiều loại giá trị giúp báo lỗi chi tiết hơn.
- **Utility Type:** Sử dụng Partial<T> để cập nhật một phần dữ liệu.

## 7. Một số điểm nổi bật về kỹ thuật
- **Lưu lịch sử mượn/trả:** Mỗi lần mượn/trả đều lưu lại thời điểm, giúp dễ kiểm tra, mở rộng các tính năng như thống kê, phạt trễ hạn.
- **Kiểm tra điều kiện nghiệp vụ:** Số sách mượn tối đa, kiểm tra tuổi tối thiểu, kiểm tra sách còn hay không, kiểm tra đã mượn chưa.
- **Tách biệt dữ liệu và logic:** Dữ liệu lưu file, logic nằm trong class, dễ mở rộng sang các loại dữ liệu khác (ví dụ: tạp chí, báo, ...).
- **Giao diện dòng lệnh thân thiện:** Sử dụng màu sắc, bảng, ký hiệu giúp thao tác dễ dàng, trực quan.

## 8. Định hướng mở rộng
- Thêm chức năng phạt trễ hạn, thống kê sách mượn nhiều nhất.
- Thêm xác thực đăng nhập cho người dùng.
- Chuyển sang lưu dữ liệu bằng database thực thụ (SQLite, MongoDB, ...).
- Xây dựng giao diện web hoặc app di động dựa trên nền tảng logic đã có.

---

**Tóm lại:**
Ứng dụng này là ví dụ điển hình cho việc sử dụng TypeScript để xây dựng ứng dụng quản lý nhỏ, tận dụng các tính năng mạnh mẽ của TS để đảm bảo an toàn, rõ ràng, dễ mở rộng và bảo trì. Thiết kế hướng đối tượng, kiểm soát dữ liệu chặt chẽ, giao diện thân thiện giúp ứng dụng dễ sử dụng và phát triển thêm trong tương lai.