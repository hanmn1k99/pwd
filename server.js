const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'my-super-secret-session-key',
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

    // Tạo sẵn tài khoản admin nếu chưa có
    db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
        if (!row) {
            const hash = bcrypt.hashSync('admin123', 8);
            db.run("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)", ['admin', hash, 1]);
            console.log("Đã tạo tài khoản admin mặc định: admin / admin123");
        }
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
    
    const { title, acc_username, password, url, notes, allowed_users } = req.body;
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

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
