# Hướng dẫn cài đặt ENCORE Captcha Solver

Extension giải captcha tự động cho ticketbox.vn.

Hướng dẫn này viết cho người chưa từng cài extension thủ công bao giờ. Cứ
làm tuần tự từ trên xuống, mỗi bước đều có ảnh mô tả bằng chữ để bạn biết
màn hình phải trông như thế nào.

**Thời gian:** khoảng 5 phút.

> 🔒 Lo ngại về bảo mật? Đọc file [**AN-TOAN-VA-MIEN-TRU.md**](AN-TOAN-VA-MIEN-TRU.md)
> — có hướng dẫn cách tự kiểm tra mã nguồn, kể cả khi bạn không biết lập trình.

---

## Cần chuẩn bị

- Trình duyệt **Google Chrome**, **Microsoft Edge**, **Cốc Cốc** hoặc **Brave**
  (bất kỳ trình duyệt nhân Chromium nào cũng được — trừ Firefox và Safari).
- File extension (thư mục `CaptchaSolver`).
- **API Key** do người bán cung cấp.

---

## Bước 1: Giải nén file

Nếu bạn nhận được file `.zip`:

1. Chuột phải vào file → **Extract All...** (hoặc **Giải nén tất cả**).
2. Chọn nơi lưu, ví dụ `D:\ENCORE` — sẽ được thư mục `D:\ENCORE\CaptchaSolver`.
3. Bấm **Extract**.

> ⚠️ **QUAN TRỌNG:** Sau khi cài xong **KHÔNG được xoá hoặc di chuyển thư
> mục này**. Chrome đọc file trực tiếp từ đây mỗi lần khởi động — xoá đi là
> extension biến mất. Hãy để nó ở một nơi cố định, đừng để trong Downloads
> hay Desktop (dễ bị dọn nhầm).

Mở thư mục vừa giải nén ra, bạn phải thấy các file sau:

```
manifest.json        ← file này BẮT BUỘC phải có
background.js
content.js
inject-credentials.js
popup.html
popup.css
popup.js
icons/
```

Nếu bạn mở ra mà thấy **một thư mục con** khác (ví dụ `CaptchaSolver` nằm
trong `CaptchaSolver`), hãy đi vào bên trong cho tới khi nhìn thấy
`manifest.json` nằm ngay đó. Đó mới là thư mục đúng cần chọn ở Bước 4.

---

## Bước 2: Mở trang quản lý Extension

Có 2 cách, chọn cách nào cũng được:

**Cách nhanh:** Copy dòng dưới, dán vào thanh địa chỉ của trình duyệt rồi
Enter:

```
chrome://extensions
```

*(Với Microsoft Edge thì gõ `edge://extensions`, Cốc Cốc thì `coccoc://extensions`)*

**Cách bấm chuột:** Bấm dấu **⋮** (ba chấm dọc) ở góc trên bên phải →
**Tiện ích mở rộng** (Extensions) → **Quản lý tiện ích mở rộng**.

---

## Bước 3: Bật Chế độ dành cho nhà phát triển

Ở góc **trên bên phải** màn hình, bạn sẽ thấy một công tắc gạt:

```
                                    Chế độ dành cho nhà phát triển  [ ⬤]
                                    (Developer mode)
```

**Gạt công tắc đó sang phải để BẬT.**

Ngay sau khi bật, sẽ xuất hiện thêm một hàng nút mới ở phía trên bên trái:

```
[ Tải tiện ích đã giải nén ]  [ Đóng gói tiện ích ]  [ Cập nhật ]
  (Load unpacked)
```

> Nếu không thấy hàng nút này xuất hiện, nghĩa là công tắc chưa được bật.
> Thử gạt lại lần nữa.

---

## Bước 4: Nạp extension

1. Bấm nút **Tải tiện ích đã giải nén** (Load unpacked).
2. Một cửa sổ chọn thư mục hiện ra.
3. Tìm tới thư mục `CaptchaSolver` bạn đã giải nén ở Bước 1.
4. **Chọn chính thư mục chứa `manifest.json`** — bấm vào tên thư mục **một
   lần** cho nó sáng lên, KHÔNG cần vào bên trong.
5. Bấm **Chọn thư mục** (Select Folder).

Nếu thành công, một ô mới hiện ra trên trang:

```
┌──────────────────────────────────────────┐
│  🟢  ENCORE Captcha Solver     1.0.14    │
│      Automatically solves CAPTCHAs...    │
│                            [ ⬤] Đã bật   │
└──────────────────────────────────────────┘
```

✅ Xong phần cài đặt.

### Nếu báo lỗi

| Thông báo lỗi | Nguyên nhân & cách sửa |
|---|---|
| *Manifest file is missing or unreadable* | Bạn chọn sai thư mục. Quay lại và chọn đúng thư mục có chứa file `manifest.json` ngay bên trong. |
| *Could not load manifest* | File `manifest.json` bị hỏng do giải nén lỗi. Giải nén lại từ đầu. |
| Không thấy nút *Load unpacked* | Chưa bật Chế độ nhà phát triển ở Bước 3. |

---

## Bước 5: Ghim extension lên thanh công cụ

Mặc định Chrome giấu extension đi. Ghim lên để dùng cho tiện:

1. Nhìn lên góc **trên bên phải**, cạnh thanh địa chỉ, có biểu tượng hình
   **mảnh ghép 🧩** (Tiện ích).
2. Bấm vào biểu tượng đó → một danh sách thả xuống.
3. Tìm dòng **ENCORE Captcha Solver**.
4. Bên phải dòng đó có biểu tượng **đinh ghim 📌** — bấm vào nó.

Biểu tượng chữ **"t"** màu xanh lá của extension sẽ xuất hiện thẳng trên
thanh công cụ. Từ giờ chỉ cần bấm vào đó là mở được.

---

## Bước 6: Nhập API Key

1. Bấm vào **biểu tượng "t" xanh lá** trên thanh công cụ.
2. Cửa sổ nhỏ hiện ra, có ô **API Key**.
3. Dán API Key của bạn vào ô đó.
4. **Không cần bấm nút Lưu** — extension tự kiểm tra sau khi bạn ngừng gõ
   khoảng nửa giây.

**Nếu key đúng**, một dòng **Balance** hiện ra kèm số dư:

```
┌────────────────────────────────┐
│ API Key                        │
│ ┌────────────────────────────┐ │
│ │ ENC-xxxxxxxxxxxxxxxx       │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ Balance         125,000 VND│ │  ← thấy dòng này là THÀNH CÔNG
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

**Nếu key sai**, sẽ hiện thông báo đỏ *Invalid API key*. Kiểm tra lại xem
có dán thiếu ký tự hoặc dính dấu cách ở đầu/cuối không.

---

## Bước 7: Dùng thử

1. Vào **https://ticketbox.vn**, đăng nhập tài khoản.
2. Chọn sự kiện và vào trang đặt vé như bình thường.
3. Khi trang hiện captcha (kéo mảnh ghép hoặc xoay hình), extension sẽ **tự
   động giải** — bạn không phải làm gì cả.
4. Góc **dưới bên trái** màn hình sẽ hiện một ô nhỏ màu xanh lá báo tiến
   trình:

   - `Processing...` — đang giải
   - `Verifying...` — đang xác nhận với Ticketbox
   - `Success!` — xong, trang tự tải lại

Ô này chỉ hiện lúc đang xử lý rồi tự ẩn đi.

---

## Xử lý sự cố

### Extension không chạy, không thấy ô báo trạng thái

Kiểm tra lần lượt:

1. **Đúng trang chưa?** Extension chỉ chạy trên `ticketbox.vn` và các trang
   con của nó. Không chạy trên web khác.
2. **Đã nhập API Key chưa?** Bấm vào biểu tượng "t", xem có thấy dòng
   Balance không.
3. **Extension còn bật không?** Vào `chrome://extensions`, xem công tắc ở ô
   ENCORE có đang bật (màu xanh) không.
4. **Tải lại trang:** nhấn `Ctrl + F5`.

### Báo "ERROR: No API Key"

API Key chưa được lưu hoặc đã bị xoá. Bấm vào biểu tượng extension và nhập
lại key.

### Báo "No Credit"

Tài khoản hết số dư. Liên hệ người bán để nạp thêm.

### Báo "Invalid Key"

Key sai hoặc đã bị vô hiệu hoá. Liên hệ người bán.

### Sau khi khởi động lại máy thì extension biến mất

Bạn đã xoá hoặc di chuyển thư mục `CaptchaSolver`. Chrome cần thư mục đó
tồn tại vĩnh viễn. Giải nén lại và cài lại từ Bước 2, đặt ở nơi cố định.

### Chrome hiện popup "Tắt tiện ích ở chế độ nhà phát triển"

Chrome thỉnh thoảng nhắc như vậy với extension cài thủ công. Bấm **Huỷ**
(Cancel), đừng bấm Tắt. Extension vẫn chạy bình thường.

---

## Cập nhật lên phiên bản mới

Khi nhận được bản cập nhật:

1. Giải nén file mới, **ghi đè** lên thư mục `CaptchaSolver` cũ.
2. Vào `chrome://extensions`.
3. Tìm ô **ENCORE Captcha Solver**, bấm biểu tượng **🔄 Tải lại** (mũi tên
   vòng tròn) ở góc dưới bên phải của ô đó.

API Key đã lưu vẫn giữ nguyên, không phải nhập lại.

> Nếu bản cập nhật có thay đổi trong `manifest.json` mà bấm Tải lại vẫn
> không ăn, hãy gỡ extension đi (nút **Xoá**) rồi cài lại từ Bước 4.

---

## Câu hỏi thường gặp

**Cài trên nhiều máy được không?**
Được, nhưng API Key được theo dõi theo địa chỉ IP. Dùng một key trên quá
nhiều máy khác nhau có thể bị khoá. Nếu cần dùng nhiều máy, liên hệ người
bán.

**Extension có đọc mật khẩu Ticketbox của tôi không?**
Không. Xem chi tiết ở file [AN-TOAN-VA-MIEN-TRU.md](AN-TOAN-VA-MIEN-TRU.md).

**Dùng được trên điện thoại không?**
Không. Chrome trên Android/iOS không hỗ trợ cài extension.

**Firefox có dùng được không?**
Không. Extension viết theo chuẩn Manifest V3 của Chrome.

**Tại sao phải bật "Chế độ nhà phát triển"?**
Vì extension được cài thủ công chứ không tải từ Chrome Web Store. Đây là
cách Chrome cho phép cài extension từ nguồn ngoài.

---

## Liên hệ

Threads: [@encore.ticketbot](https://www.threads.com/@encore.ticketbot)
