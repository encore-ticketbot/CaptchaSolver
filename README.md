# ENCORE Captcha Solver

Tự động giải captcha trên **ticketbox.vn** — captcha hiện lên là giải ngay,
bạn không phải kéo hay xoay gì cả.

Phiên bản 1.0.14

---

## 👉 Bắt đầu từ đâu

**Lần đầu cài đặt?** Mở file **[HUONG-DAN-CAI-DAT.md](HUONG-DAN-CAI-DAT.md)**
— hướng dẫn từng bước, khoảng 5 phút là xong, không cần biết gì về máy tính.

**Lo ngại về bảo mật?** Mở file **[AN-TOAN-VA-MIEN-TRU.md](AN-TOAN-VA-MIEN-TRU.md)**
— giải thích extension gửi dữ liệu đi đâu và cách bạn tự kiểm chứng.

> 💡 File `.md` mở được bằng Notepad, hoặc bấm đúp nếu máy có sẵn trình đọc.
> Xem trên điện thoại thì dễ đọc hơn (có định dạng đẹp).

---

## Cần chuẩn bị

| | |
|---|---|
| **Trình duyệt** | Chrome, Edge, Cốc Cốc hoặc Brave (trên máy tính) |
| **API Key** | Liên hệ người bán để nhận |

Không dùng được trên điện thoại và Firefox.

---

## Dùng thế nào

1. Cài extension theo hướng dẫn.
2. Bấm vào biểu tượng **"t"** xanh lá trên thanh công cụ, dán API Key.
3. Vào ticketbox.vn đặt vé như bình thường.

Khi captcha xuất hiện, extension tự giải. Góc dưới bên trái màn hình sẽ hiện
ô báo trạng thái rồi tự ẩn đi khi xong.

---

## Các file trong thư mục này

Bạn **không cần** đụng vào bất kỳ file nào — Chrome tự đọc chúng.

```
README.md                 ← bạn đang đọc file này
HUONG-DAN-CAI-DAT.md      ← hướng dẫn cài đặt
AN-TOAN-VA-MIEN-TRU.md    ← thông tin bảo mật & điều khoản

manifest.json             ┐
background.js             │
content.js                │  mã nguồn của extension
inject-credentials.js     │  (mở bằng Notepad xem được)
popup.html / .css / .js   │
icons/                    ┘
```

> ⚠️ **Đừng xoá hoặc di chuyển thư mục này sau khi cài.** Chrome đọc file
> trực tiếp từ đây mỗi lần khởi động — mất thư mục là extension biến mất.

---

## Gặp trục trặc?

Phần **Xử lý sự cố** trong [HUONG-DAN-CAI-DAT.md](HUONG-DAN-CAI-DAT.md) có
hầu hết các lỗi thường gặp và cách khắc phục.

Vẫn không được thì liên hệ mình.

---

## Liên hệ

Threads: [@encore.ticketbot](https://www.threads.com/@encore.ticketbot)

---

*Sản phẩm độc lập, không có liên kết với Ticketbox. Xem đầy đủ điều khoản ở
[AN-TOAN-VA-MIEN-TRU.md](AN-TOAN-VA-MIEN-TRU.md).*
