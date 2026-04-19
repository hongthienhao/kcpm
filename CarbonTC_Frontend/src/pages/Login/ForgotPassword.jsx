import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setStep(2);
        toast.success(`Đã gửi mã OTP. Mã của bạn là: ${response.data}`);
      } else {
        toast.error(response.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    setIsLoading(true);

    try {
      const response = await authService.resetPassword({ email, otp, newPassword });
      if (response.success) {
        setStep(3);
        toast.success('Khôi phục mật khẩu thành công');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWrapper}>
        <div className={styles.loginHeader}>
          <div className={styles.brandLogo} style={{ cursor: 'pointer' }}>
            <i className="bi bi-lightning-charge-fill"></i>
            <span>CarbonCredit</span>
          </div>
          <h1 className={styles.loginTitle}>Quên mật khẩu</h1>
          <p className={styles.loginSubtitle}>
            {step === 1 ? 'Nhập email để nhận mã OTP' : (step === 2 ? 'Nhập mã OTP và mật khẩu mới' : '')}
          </p>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.cardBody}>
            {step === 1 && (
              <form onSubmit={handleRequestOtp}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    <i className="bi bi-envelope me-2"></i>
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    className={styles.formControl}
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang gửi...' : 'Nhận mã OTP'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword}>
                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                  <label htmlFor="otp" className={styles.formLabel}>
                    <i className="bi bi-key me-2"></i>
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    className={styles.formControl}
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã 6 số"
                    autoFocus
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.formLabel}>
                    <i className="bi bi-lock me-2"></i>
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    className={styles.formControl}
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </form>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <div style={{ color: 'green', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                  Khôi phục mật khẩu thành công
                </div>
                <Link to="/login" className={`${styles.btnCustom} ${styles.btnPrimaryCustom}`} style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Về trang Đăng nhập
                </Link>
              </div>
            )}

            {step !== 3 && (
              <div className={styles.loginFooter} style={{ marginTop: '1.5rem' }}>
                <p>
                  <Link to="/login" className={styles.registerLink}>
                    Quay lại đăng nhập
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
