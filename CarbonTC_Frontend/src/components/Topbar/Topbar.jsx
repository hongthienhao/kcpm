import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Topbar.module.css';
import AlertBox from '../../components/AlertBox/AlertBox'; 
import CustomModal from '../../components/CustomModal/CustomModal'; 
import { getUserIdFromToken } from '../../services/listingService';
import { useNotification } from '../../hooks/useNotification';

const Topbar = ({ title }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [message, setMessage] = useState(null); 
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Notifications logic
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifDropdownPosition, setNotifDropdownPosition] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const notifBtnRef = useRef(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Tính toán vị trí dropdown
  const calculateDropdownPosition = () => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 280 // trừ chiều rộng dropdown
      });
    }
  };

  const calculateNotifDropdownPosition = () => {
    if (notifBtnRef.current) {
      const rect = notifBtnRef.current.getBoundingClientRect();
      setNotifDropdownPosition({
        top: rect.bottom + window.scrollY + 10,
        left: Math.max(0, rect.right + window.scrollX - 320) // Đảm bảo không tràn màn hình
      });
    }
  };

  const toggleDropdown = () => {
    if (!showDropdown) {
      calculateDropdownPosition();
    }
    setShowDropdown(!showDropdown);
    setShowNotifDropdown(false);
  };

  const toggleNotifDropdown = () => {
    if (!showNotifDropdown) {
      calculateNotifDropdownPosition();
    }
    setShowNotifDropdown(!showNotifDropdown);
    setShowDropdown(false);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng dropdown User profile
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          profileRef.current && !profileRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      // Đóng dropdown Notifications
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target) &&
          notifBtnRef.current && !notifBtnRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // HÀM CHỈ CÓ NHIỆM VỤ HIỂN THỊ MODAL XÁC NHẬN
  const handleLogout = () => {
    setShowDropdown(false); // Đóng dropdown trước khi mở modal
    setShowLogoutModal(true);
  };
  
  // HÀM XỬ LÝ LOGIC ĐĂNG XUẤT SAU KHI XÁC NHẬN
  const confirmLogout = async () => {
    setShowLogoutModal(false); // Ẩn modal
    setIsLoggingOut(true);
    setMessage(null); // Xóa thông báo cũ

    try {
      // Gọi API logout
      await authService.logout();
      localStorage.clear();
      // THAY THẾ alert() bằng AlertBox (Thông báo thành công)
      setMessage({
          type: 'success',
          text: 'Đăng xuất thành công! Đang chuyển hướng...'
      });
      
      // Chờ một chút để người dùng đọc thông báo
      setTimeout(() => {
        navigate('/login');
      }, 1000); // Chuyển hướng sau 1 giây
      
    } catch (error) {
      console.error('Logout failed:', error);
      
      // THAY THẾ console.error bằng AlertBox (Thông báo lỗi)
      setMessage({
        type: 'error',
        text: error.message || 'Đăng xuất thất bại, nhưng hệ thống vẫn sẽ chuyển hướng.'
      });
      
      // Dù lỗi vẫn redirect về login vì authService đã clear tokens
      setTimeout(() => {
        navigate('/login');
      }, 3000); 
    } finally {
      // Tắt loading sau khi hoàn tất (hoặc đã chuyển hướng)
      setIsLoggingOut(false);
    }
  };

  // Dropdown Component được render qua Portal
  const DropdownMenu = () => {
    if (!showDropdown) return null;

    return ReactDOM.createPortal(
      <div 
        className={styles.dropdownMenu}
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          zIndex: 9999
        }}
      >
        <div className={styles.dropdownHeader}>
          <div className={styles.userInfo}>
            <img 
              src={user?.avatar || `https://i.pravatar.cc/30?u=${getUserIdFromToken() || 'default'}`} 
              alt="User Avatar" 
              className={styles.dropdownAvatar} 
            />
            <div className={styles.userDetails}>
              <p className={styles.userFullName}>{user?.fullName || 'Người dùng'}</p>
              <p className={styles.userEmail}>{user?.email || 'email@example.com'}</p>
              <span className={styles.userRole}>{user?.roleName || 'User'}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.dropdownDivider}></div>
        
        <div className={styles.dropdownBody}>
          <button 
            className={`${styles.dropdownItem} ${styles.logoutItem}`}
            onClick={handleLogout} // Gọi hàm hiển thị modal
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <i className="bi bi-hourglass-split"></i>
                <span>Đang đăng xuất...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-right"></i>
                <span>Đăng xuất</span>
              </>
            )}
          </button>
        </div>
      </div>,
      document.body
    );
  };

  // Dropdown Component cho Notifications
  const NotifDropdownMenu = () => {
    if (!showNotifDropdown) return null;

    return ReactDOM.createPortal(
      <div 
        ref={notifDropdownRef}
        style={{
          position: 'fixed',
          top: `${notifDropdownPosition.top}px`,
          left: `${notifDropdownPosition.left}px`,
          zIndex: 9999,
          width: '320px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px',
          padding: '0',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '12px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h6 style={{ margin: 0, fontWeight: 'bold' }}>Thông báo</h6>
          {unreadCount > 0 && (
            <span 
              onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
              style={{ cursor: 'pointer', color: '#0d6efd', fontSize: '13px', fontWeight: '500' }}
            >
              Đánh dấu tất cả đã đọc
            </span>
          )}
        </div>
        <div style={{ overflowY: 'auto', padding: notifications.length === 0 ? '20px' : '0' }}>
          {notifications.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', margin: 0 }}>Không có thông báo nào.</p>
          ) : (
            notifications.slice(0, 10).map(notif => (
              <div 
                key={notif.id} 
                style={{ 
                  padding: '12px 15px', 
                  borderBottom: '1px solid #f8f9fa',
                  backgroundColor: notif.isRead ? '#fff' : '#f0f8ff',
                  cursor: 'default'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#333' }}>{notif.title}</div>
                <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>{notif.message}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>{new Date(notif.createdAt).toLocaleString('vi-VN')}</div>
              </div>
            ))
          )}
        </div>
      </div>,
      document.body
    );
  };


  return (
    <>
      {message && <AlertBox message={message} />} 

      <div className={styles.topbar}>
        <h1 className={styles.topbarTitle}>{title}</h1>
        <div className={styles.topbarActions}>
          {/* Notification Button */}
          <div 
            className={styles.notificationBtn} 
            ref={notifBtnRef}
            onClick={toggleNotifDropdown}
            style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f0f2f5', margin: '0 15px' }}
          >
            <i className="bi bi-bell" style={{ fontSize: '1.2rem', color: '#555' }}></i>
            {unreadCount > 0 && (
              <span className={styles.notificationBadge} style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 5px',
                fontSize: '10px',
                fontWeight: 'bold',
                minWidth: '18px',
                textAlign: 'center',
                lineHeight: '1'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          
          {/* User Profile with Dropdown */}
          <div className={styles.profileContainer} ref={profileRef}>
            <div 
              className={styles.userProfile} 
              onClick={toggleDropdown}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleDropdown();
                }
              }}
            >
              <img 
                src={user?.avatar || `https://i.pravatar.cc/30?u=${getUserIdFromToken() || 'default'}`} 
                alt="User Avatar" 
                className={styles.userAvatar} 
              />
              <span className={styles.userName}>
                {user?.fullName || 'Người dùng'}
              </span>
              <i className={`bi bi-chevron-down ${styles.dropdownIcon} ${showDropdown ? styles.dropdownIconActive : ''}`}></i>
            </div>
          </div>
        </div>
      </div>
      <DropdownMenu />
      <NotifDropdownMenu />
      
      {/* RENDER CUSTOM MODAL XÁC NHẬN LOGOUT */}
      <CustomModal 
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout} 
        title="Xác nhận Đăng xuất"
        body="Bạn có chắc chắn muốn thoát khỏi phiên làm việc hiện tại?"
        confirmText="Đăng xuất"
        danger={false} // Đây không phải hành động "Danger" (xóa), nên dùng màu Primary
      />
    </>
  );
};

export default Topbar;