    function initAutoDismiss() {
        setTimeout(() => {
            document.querySelectorAll('.auto-dismiss-alert').forEach(el => {
                el.classList.add('fade-out');
                setTimeout(() => el.remove(), 500); 
            });
        }, 3000);
    }
    
    initAutoDismiss();

    function togglePassword(id, password) {
        let el = document.getElementById('pw-' + id);
        let btnIcon = document.getElementById('icon-' + id);
        
        if (el.innerText === '••••••••') {
            el.innerText = password;
            btnIcon.setAttribute('name', 'eye-off');
        } else {
            el.innerText = '••••••••';
            btnIcon.setAttribute('name', 'eye');
        }
    }

    function showToast(message, icon = 'checkmark-circle') {
        const toastContainer = document.querySelector('.position-fixed.top-0.end-0');
        if (toastContainer) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success shadow-sm auto-dismiss-alert';
            alertDiv.innerHTML = `<ion-icon name="${icon}"></ion-icon> ${message}`;
            alertDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            toastContainer.appendChild(alertDiv);
            
            setTimeout(() => {
                alertDiv.classList.add('fade-out');
                setTimeout(() => alertDiv.remove(), 500);
            }, 3000);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Đã copy vào bộ nhớ tạm!', 'clipboard');
        }).catch(err => {
            console.error('Copy failed', err);
        });
    }

    function deleteUserAjax(id, username) {
        if (!confirm('Bạn có chắc chắn muốn xóa user ' + username + ' không?')) return;
        
        fetch('/delete_user/' + id, { method: 'POST' })
        .then(res => {
            const li = document.getElementById('user-item-' + id);
            if (li) {
                li.style.transition = 'all 0.4s ease';
                li.style.opacity = '0';
                li.style.transform = 'translateX(20px)';
                setTimeout(() => li.remove(), 400);
            }
            
            const toastContainer = document.querySelector('.position-fixed.top-0.end-0');
            if (toastContainer) {
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-success shadow-sm auto-dismiss-alert';
                alertDiv.innerHTML = '<ion-icon name="checkmark-circle"></ion-icon> Đã xóa user ' + username;
                alertDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                toastContainer.appendChild(alertDiv);
                
                setTimeout(() => {
                    alertDiv.classList.add('fade-out');
                    setTimeout(() => alertDiv.remove(), 500);
                }, 3000);
            }
        }).catch(err => console.error(err));
    }

    const htmlEl = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    // Chuyển toàn bộ web sang dạng SPA mượt mà không reload
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.tagName === 'FORM' && (form.method || '').toUpperCase() === 'POST') {
            e.preventDefault();
            
            // Hiện loading trên nút submit
            const btn = form.querySelector('button[type="submit"]');
            let oldText = "";
            if (btn) {
                oldText = btn.innerHTML;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm align-middle me-1"></span>Đang xử lý...';
                btn.disabled = true;
            }

            fetch(form.action, {
                method: 'POST',
                body: new URLSearchParams(new FormData(form))
            })
            .then(res => res.text())
            .then(html => {
                // Đóng tất cả modal hiện tại đúng chuẩn Bootstrap
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(modalEl => {
                    const inst = bootstrap.Modal.getInstance(modalEl);
                    if (inst) inst.hide();
                });

                // Chờ modal fade out xong rồi thay đổi DOM
                setTimeout(() => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Dọn dẹp class của body do bootstrap modal để lại (nếu có)
                    document.body.className = doc.body.className;
                    document.body.style = doc.body.style;
                    
                    // Cập nhật lại toàn bộ nội dung HTML
                    document.body.innerHTML = doc.body.innerHTML;
                    
                    // Kích hoạt lại bộ hẹn giờ tự động tắt thông báo từ Server
                    initAutoDismiss();
                }, 350);
            }).catch(err => {
                console.error(err);
                if (btn) {
                    btn.innerHTML = oldText;
                    btn.disabled = false;
                }
            });
        }
    });

    // Theme logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    htmlEl.setAttribute('data-bs-theme', savedTheme);
    themeIcon.setAttribute('name', savedTheme === 'dark' ? 'sunny' : 'moon');
    if(savedTheme === 'dark') themeIcon.style.color = '#ffc107';

    themeBtn.addEventListener('click', () => {
        const current = htmlEl.getAttribute('data-bs-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-bs-theme', next);
        localStorage.setItem('theme', next);
        themeIcon.setAttribute('name', next === 'dark' ? 'sunny' : 'moon');
        themeIcon.style.color = next === 'dark' ? '#ffc107' : '';
    });