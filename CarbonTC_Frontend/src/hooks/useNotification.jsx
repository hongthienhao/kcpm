import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { startConnection, getConnection } from '../services/signalrService';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Khởi tạo kết nối SignalR (nếu chưa có)
    startConnection().then(() => {
      const conn = getConnection();
      if (conn && isMounted) {
        // Lắng nghe event từ Backend (tùy thuộc vào tên event BE emit, giả sử là "ReceiveNotification")
        conn.off("ReceiveNotification");
        conn.on("ReceiveNotification", (newNotif) => {
          // Chuẩn hóa data notification
          const formattedNotif = {
            id: newNotif?.id || Date.now(),
            message: newNotif?.message || newNotif || 'Bạn có một thông báo mới',
            title: newNotif?.title || 'Thông báo',
            createdAt: newNotif?.createdAt || new Date().toISOString(),
            isRead: false
          };

          setNotifications(prev => {
            // Chỉ giữ lại tối đa 50 thông báo gần nhất để tránh memory leak
            const updated = [formattedNotif, ...prev];
            return updated.slice(0, 50);
          });
          
          setUnreadCount(prev => prev + 1);

          // Bắn Toast tự động nếu đã cài react-toastify
          toast.info(formattedNotif.message, {
            position: "bottom-right",
            autoClose: 5000,
          });
        });
      }
    }).catch(err => console.error("SignalR Connection Error in useNotification:", err));

    return () => {
      isMounted = false;
      const conn = getConnection();
      if (conn) {
        conn.off("ReceiveNotification");
      }
    };
  }, []);

  const NotificationComponent = () => {
    if (!notification) return null;

    const notificationClass = `alert alert-${notification.type === 'success' ? 'success' : notification.type === 'error' ? 'danger' : 'info'} position-fixed top-0 end-0 m-3`;
    
    return (
      <div className={notificationClass} style={{ zIndex: 9999 }}>
        <div className="d-flex align-items-center">
          <i className={`bi bi-${notification.type === 'success' ? 'check-circle' : notification.type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2`}></i>
          {notification.message}
        </div>
      </div>
    );
  };

  return {
    showNotification,
    NotificationComponent,
    notifications,
    unreadCount,
    markAllAsRead
  };
};