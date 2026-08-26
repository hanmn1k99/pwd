const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files
app.use(express.urlencoded({ extended: true }));

// Truyền config ra toàn bộ giao diện EJS
app.use((req, res, next) => {
    res.locals.config = config;
    next();
});

app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Tự động tạo và lưu Khóa Mã Hóa (AES-256)
let ENCRYPTION_KEY;
if (fs.existsSync('./secret.key')) {
    ENCRYPTION_KEY = fs.readFileSync('./secret.key');
} else {
    ENCRYPTION_KEY = crypto.randomBytes(32);
    fs.writeFileSync('./secret.key', ENCRYPTION_KEY);
}

function encrypt(text) {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text, iv) {
    let ivBuffer = Buffer.from(iv, 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), ivBuffer);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Khởi tạo Database SQLite
const db = new sqlite3.Database('./database.db');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        is_admin INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        acc_username TEXT,
        encrypted_password TEXT,
        iv TEXT,
        url TEXT,
        notes TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS access (
        user_id INTEGER,
        password_id INTEGER,
        PRIMARY KEY(user_id, password_id)
    )`);

    // Cơ chế mới: Sẽ kiểm tra xem DB đã có user nào là admin chưa khi có request
    // Nếu chưa có, sẽ ép chuyển hướng qua trang /setup
});

// Middleware kiểm tra xem hệ thống đã được cài đặt chưa (đã có admin chưa)
function checkSetup(req, res, next) {
    db.get("SELECT id FROM users WHERE is_admin = 1 LIMIT 1", (err, row) => {
        if (!row && req.path !== '/setup') {
            return res.redirect('/setup');
        }
        if (row && req.path === '/setup') {
            return res.redirect('/login');
        }
        next();
    });
}

// Chèn checkSetup vào trước tất cả các route
app.use((req, res, next) => {
    // Không áp dụng cho file tĩnh
    if (req.path.startsWith('/css') || req.path.startsWith('/js')) return next();
    checkSetup(req, res, next);
});

app.get('/setup', (req, res) => {
    res.render('setup', { error: null });
});

app.post('/setup', (req, res) => {
    const { username, password, confirm_password } = req.body;
    
    if (password !== confirm_password) {
        return res.render('setup', { error: 'Mật khẩu xác nhận không khớp!' });
    }
    if (!username || !password || password.length < 6) {
        return res.render('setup', { error: 'Tài khoản và mật khẩu (tối thiểu 6 ký tự) không được để trống!' });
    }
    
    const hash = bcrypt.hashSync(password, 8);
    db.run("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)", [username, hash, 1], (err) => {
        if (err) return res.render('setup', { error: 'Có lỗi xảy ra, vui lòng thử lại!' });
        res.redirect('/login');
    });
});

// Middleware kiểm tra đăng nhập
function requireLogin(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

// Các Routes (Đường dẫn)
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    db.get("SELECT * FROM users WHERE username = ?", [req.body.username], (err, user) => {
        if (user && bcrypt.compareSync(req.body.password, user.password_hash)) {
            req.session.user = user;
            
            // Xử lý Ghi nhớ đăng nhập (30 ngày)
            if (req.body.remember === 'on') {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                req.session.cookie.expires = false; // Cookie sẽ mất khi đóng trình duyệt
            }
            
            res.redirect('/');
        } else {
            res.render('login', { error: 'Sai tài khoản hoặc mật khẩu' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/', requireLogin, (req, res) => {
    const user = req.session.user;
    let allUsers = [];
    
    if (user.is_admin) {
        db.all("SELECT id, username, is_admin FROM users", (err, users) => {
            allUsers = users;
            getPasswords();
        });
    } else {
        getPasswords();
    }

    function getPasswords() {
        let query = "";
        let params = [];
        if (user.is_admin) {
            query = "SELECT * FROM passwords";
        } else {
            query = `SELECT p.* FROM passwords p 
                     JOIN access a ON p.id = a.password_id 
                     WHERE a.user_id = ?`;
            params = [user.id];
        }

        db.all(query, params, (err, passwords) => {
            if (user.is_admin && passwords.length > 0) {
                db.all("SELECT a.password_id, u.username FROM access a JOIN users u ON a.user_id = u.id", (err, accessList) => {
                    passwords.forEach(p => {
                        p.shared_with = accessList.filter(a => a.password_id === p.id).map(a => a.username);
                        p.decrypted = decrypt(p.encrypted_password, p.iv);
                    });
                    res.render('dashboard', { user, passwords, allUsers, msg: req.query.msg });
                });
            } else {
                passwords.forEach(p => {
                    p.decrypted = decrypt(p.encrypted_password, p.iv);
                });
                res.render('dashboard', { user, passwords, allUsers, msg: req.query.msg });
            }
        });
    }
});

app.post('/add_password', requireLogin, (req, res) => {
    if (!req.session.user.is_admin) return res.status(403).send("Forbidden");
    
    let { title, acc_username, password, url, notes, allowed_users } = req.body;
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    
    const enc = encrypt(password);
    
    db.run(`INSERT INTO passwords (title, acc_username, encrypted_password, iv, url, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [title, acc_username, enc.encryptedData, enc.iv, url, notes], function(err) {
        if (err) return res.send(err);
        
        const pwd_id = this.lastID;
        db.run("INSERT INTO access (user_id, password_id) VALUES (?, ?)", [req.session.user.id, pwd_id]); // Admin luôn có quyền
        
        if (allowed_users) {
            const usersArr = Array.isArray(allowed_users) ? allowed_users : [allowed_users];
            usersArr.forEach(uid => {
                db.run("INSERT OR IGNORE INTO access (user_id, password_id) VALUES (?, ?)", [uid, pwd_id]);
            });
        }
        res.redirect('/?msg=added');
    });
});

app.post('/add_user', requireLogin, (req, res) => {
    if (!req.session.user.is_admin) return res.status(403).send("Forbidden");
    
    const hash = bcrypt.hashSync(req.body.password, 8);
    const is_admin = req.body.is_admin === 'on' ? 1 : 0;
    
    db.run("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)", 
        [req.body.username, hash, is_admin], (err) => {
        if (err) return res.redirect('/?msg=userexists');
        res.redirect('/?msg=useradded');
    });
});

app.post('/change_my_password', requireLogin, (req, res) => {
    const { old_password, new_password } = req.body;
    db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
        if (user && bcrypt.compareSync(old_password, user.password_hash)) {
            const hash = bcrypt.hashSync(new_password, 8);
            db.run("UPDATE users SET password_hash = ? WHERE id = ?", [hash, user.id], (err) => {
                res.redirect('/?msg=pwchanged');
            });
        } else {
            res.redirect('/?msg=pwchange_err');
        }
    });
});

app.post('/delete_password/:id', requireLogin, (req, res) => {
    if (!req.session.user.is_admin) return res.status(403).send("Forbidden");
    db.run("DELETE FROM passwords WHERE id = ?", [req.params.id], (err) => {
        db.run("DELETE FROM access WHERE password_id = ?", [req.params.id]);
        res.redirect('/?msg=deleted');
    });
});

app.post('/delete_user/:id', requireLogin, (req, res) => {
    if (!req.session.user.is_admin) return res.status(403).send("Forbidden");
    if (req.params.id == req.session.user.id) return res.redirect('/?msg=cant_delete_self');
    
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
        db.run("DELETE FROM access WHERE user_id = ?", [req.params.id]);
        res.redirect('/?msg=user_deleted');
    });
});

app.post('/edit_password/:id', requireLogin, (req, res) => {
    if (!req.session.user.is_admin) return res.status(403).send("Forbidden");
    let { title, acc_username, password, url, notes, allowed_users } = req.body;
    
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    
    db.run(`UPDATE passwords SET title=?, acc_username=?, url=?, notes=? WHERE id=?`, 
        [title, acc_username, url, notes, req.params.id], (err) => {
        
        if (password && password.trim() !== '') {
            const enc = encrypt(password);
            db.run(`UPDATE passwords SET encrypted_password=?, iv=? WHERE id=?`, [enc.encryptedData, enc.iv, req.params.id]);
        }
        
        db.run(`DELETE FROM access WHERE password_id=? AND user_id != ?`, [req.params.id, req.session.user.id], () => {
            if (allowed_users) {
                const usersArr = Array.isArray(allowed_users) ? allowed_users : [allowed_users];
                usersArr.forEach(uid => {
                    db.run("INSERT OR IGNORE INTO access (user_id, password_id) VALUES (?, ?)", [uid, req.params.id]);
                });
            }
        });
        res.redirect('/?msg=updated');
    });
});

const PORT = process.env.PORT || config.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
