Hosting URL:https://qrgenby.web.app/

## วิธีเริ่มต้นใช้งาน

1. **ติดตั้ง dependencies**

   ```bash
   npm install
   ```

2. **เริ่มเซิร์ฟเวอร์สำหรับพัฒนา**

   ```bash
   npm run dev
   ```

   จากนั้นเปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

3. **Build สำหรับ production**

   ```bash
   npm run build
   npm start
   ```

4. **Deploy ขึ้น Firebase Hosting**
   ```bash
   firebase deploy
   ```

## การตั้งค่าเพิ่มเติม

- สามารถปรับแต่งสไตล์ได้ที่ `app/globals.css` และ `tailwind.config.js`
- เพิ่มหน้าใหม่หรือแก้ไข layout ได้ที่โฟลเดอร์ `app/`

## เทคโนโลยีที่ใช้

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
