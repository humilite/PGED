import bcrypt from 'bcryptjs';

const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

const passwords = ['password', 'admin', 'admin123', '123456'];

async function checkPasswords() {
  for (const pwd of passwords) {
    const isMatch = await bcrypt.compare(pwd, hash);
    console.log(`${pwd}: ${isMatch}`);
  }
}

checkPasswords();
