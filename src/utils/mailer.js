const nodemailer = require('nodemailer');

const sendOTPEmail = async (targetEmail, otp) => {
  console.log("--- DEBUG SMTP CONFIG ---");
  console.log("Host:", process.env.SMTP_HOST);
  console.log("User:", process.env.SMTP_USER);
  console.log("Pass:", process.env.SMTP_PASS ? "TERISI (HIDDEN)" : "KOSONG!");
  console.log("--------------------------");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
  });

  const mailOptions = {
    from: `"Apotek System" <${process.env.EMAIL_FROM}>`,
    to: targetEmail,
    subject: 'Kode OTP Verifikasi Akun',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
  
  <!-- Header / Logo Area -->
  <div style="background-color: #007bff; padding: 20px; text-align: center;">
    <!-- Ganti src dengan URL logo Anda -->
    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Apotek Sehat</h1>
  </div>

  <!-- Body Content -->
  <div style="padding: 30px 20px; text-align: center;">
    <h2 style="color: #333333; margin-top: 0;">Verifikasi Akun Apotek</h2>
    <p style="color: #666666; line-height: 1.6;">Halo,</p>
    <p style="color: #666666; line-height: 1.6;">Terima kasih telah mendaftar. Silakan gunakan kode di bawah ini untuk memverifikasi akun Anda:</p>
    
    <!-- OTP Box -->
    <div style="background-color: #f0f7ff; border: 2px dashed #007bff; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; font-family: monospace;">
        ${otp}
      </span>
    </div>

    <p style="color: #666666; font-size: 14px;">Kode ini hanya berlaku selama <strong>5 menit</strong>. Jangan berikan kode ini kepada siapapun.</p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
    <p style="font-size: 12px; color: #999999; margin: 0;">
      Ini adalah email otomatis. Jangan Di Balas.<br>
      Jika Anda tidak meminta kode ini, abaikan email ini.
    </p>
  </div>
</div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Berhasil! Email terkirim: ' + info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Gagal kirim email:', error.message);
    return false;
  }
};

module.exports = { sendOTPEmail };