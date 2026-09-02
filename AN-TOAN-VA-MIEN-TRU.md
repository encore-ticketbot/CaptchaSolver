# An toàn & Miễn trừ trách nhiệm

Tài liệu này dành cho ENCORE Captcha Solver. Hướng dẫn cài đặt nằm ở file
`HUONG-DAN-CAI-DAT.md`.

---

## An toàn & Quyền riêng tư

Extension này **không được tải từ Chrome Web Store**, nên việc bạn dè chừng
là hoàn toàn hợp lý. Phần này nói rõ extension làm gì, và quan trọng hơn:
chỉ cho bạn cách **tự kiểm chứng** thay vì phải tin lời chúng tôi.

### Toàn bộ dữ liệu gửi ra khỏi máy bạn

Extension chỉ gửi dữ liệu tới đúng **3 địa chỉ**, không có địa chỉ nào khác:

| Gửi tới | Nội dung gửi đi | Mục đích |
|---|---|---|
| `solver.encorebot.cloud` | Ảnh captcha + API Key của bạn | Để giải captcha |
| `auth.encorebot.cloud` | Chỉ mỗi API Key | Kiểm tra key còn hạn, xem số dư |
| `api-v2.ticketbox.vn` | Đáp án captcha | Gửi thẳng cho Ticketbox (máy chủ của chính họ, không phải của chúng tôi) |

### Những thứ extension KHÔNG làm

- ❌ **Không đọc mật khẩu.** Extension không hề chạm vào ô mật khẩu, không
  ghi lại phím bấm.
- ❌ **Không gửi thông tin đăng nhập của bạn về máy chủ chúng tôi.** Có đọc
  cookie phiên (`TBoxJWT`, `deviceId`) nhưng **chỉ để gửi thẳng cho
  Ticketbox** khi xác nhận captcha — giống hệt việc trình duyệt bạn vẫn làm.
  Chúng không bao giờ được gửi tới `encorebot.cloud`.
- ❌ **Không đọc thông tin thẻ ngân hàng.**
- ❌ **Không theo dõi bạn ở web khác.** Extension chỉ chạy trên
  `ticketbox.vn`. Mở Facebook, Gmail hay bất kỳ web nào khác, nó hoàn toàn
  không hoạt động.
- ❌ **Không có mã ẩn, không nén, không làm rối.** Toàn bộ mã nguồn là chữ
  thường, đọc được bằng Notepad.

### Cách tự kiểm tra (khuyến khích làm)

**Cách 1 — Xem extension được phép làm gì**

Vào `chrome://extensions` → bấm **Chi tiết** ở ô ENCORE → kéo xuống mục
**Quyền của trang web**. Bạn sẽ thấy đúng 4 địa chỉ:

```
ticketbox.vn
auth.encorebot.cloud
solver.encorebot.cloud
```

Chrome **cưỡng chế** danh sách này. Extension không thể gửi dữ liệu tới bất
kỳ địa chỉ nào khác, kể cả khi mã nguồn có cố làm vậy — trình duyệt sẽ chặn.

**Cách 2 — Tự xem mã nguồn**

Mở thư mục `CaptchaSolver`, mở các file `.js` bằng Notepad. Toàn bộ mã đều
đọc được. Muốn tìm nhanh chỗ gửi dữ liệu ra ngoài, bấm `Ctrl + F` và tìm
chữ `fetch(` — bạn sẽ thấy đúng 3 chỗ đã liệt kê ở bảng trên.

**Cách 3 — Nhờ AI kiểm tra hộ**

Cách này dễ nhất nếu bạn không rành lập trình. Mở ChatGPT, Claude, Gemini
hoặc bất kỳ AI nào, **kéo thả toàn bộ file `.js`** vào rồi hỏi:

> Đây là mã nguồn của một extension Chrome. Hãy kiểm tra giúp tôi:
> 1. Nó gửi dữ liệu đi những đâu?
> 2. Có đọc mật khẩu, thông tin thẻ, hay dữ liệu cá nhân nào không?
> 3. Có mã độc, backdoor, hoặc hành vi đáng ngờ nào không?
> 4. Nó có theo dõi tôi trên các trang web khác không?

AI sẽ đọc và trả lời độc lập. Chúng tôi khuyến khích bạn làm việc này.

**Cách 4 — Tự xem lưu lượng mạng**

Trên trang ticketbox.vn, nhấn `F12` → tab **Network** → thử đặt vé. Bạn sẽ
thấy chính xác mọi request extension gửi đi, không giấu được gì.

---

## Miễn trừ trách nhiệm

Vui lòng đọc kỹ trước khi sử dụng.

**1. Về mối liên hệ với Ticketbox**

Extension này là sản phẩm độc lập, **không có liên kết, tài trợ hay xác
nhận nào** từ Ticketbox hoặc công ty chủ quản. Mọi nhãn hiệu thuộc về chủ
sở hữu tương ứng.

**2. Về trách nhiệm khi sử dụng**

Người dùng tự chịu trách nhiệm về việc sử dụng công cụ này, bao gồm việc
tự đánh giá sự phù hợp với điều khoản dịch vụ của Ticketbox và quy định
pháp luật hiện hành. Việc sử dụng công cụ tự động **có thể vi phạm điều
khoản dịch vụ** của một số nền tảng và dẫn tới việc tài khoản bị hạn chế
hoặc khoá.

**3. Không cam kết kết quả**

Extension hỗ trợ giải captcha, **không đảm bảo** bạn sẽ mua được vé. Kết
quả phụ thuộc vào tốc độ mạng, số lượng vé, lượng người truy cập và các
thay đổi từ phía Ticketbox.

**4. Không đảm bảo hoạt động liên tục**

Ticketbox có thể thay đổi hệ thống bất kỳ lúc nào khiến extension ngừng
hoạt động. Chúng tôi cố gắng cập nhật nhưng không cam kết về thời gian.

**5. Giới hạn trách nhiệm**

Phần mềm được cung cấp "nguyên trạng" (as-is). Trong phạm vi pháp luật cho
phép, chúng tôi không chịu trách nhiệm với bất kỳ thiệt hại trực tiếp hay
gián tiếp nào phát sinh từ việc sử dụng, bao gồm nhưng không giới hạn ở:
mất vé, tài khoản bị khoá, hoặc mất mát tài chính.

**6. Về credit đã nạp**

Credit chỉ bị trừ khi giải captcha thành công. Nếu giải thất bại do lỗi hệ
thống, credit được hoàn lại tự động.

**7. Về việc chia sẻ API Key**

Mỗi API Key dành cho một người dùng. Hệ thống ghi nhận địa chỉ IP sử dụng;
key được dùng từ quá nhiều nơi khác nhau có thể bị tạm khoá.

**Bằng việc cài đặt và sử dụng extension này, bạn xác nhận đã đọc, hiểu và
đồng ý với toàn bộ nội dung trên.**

---

## Liên hệ

Threads: [@encore.ticketbot](https://www.threads.com/@encore.ticketbot)
