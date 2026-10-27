const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { isEmail } = require('class-validator');

// Зчитуємо аргументи з командного рядка (node create-user.js <email> <password>)
const email = process.argv[2];
const plainPassword = process.argv[3];

if (!email || !plainPassword) {
  console.error('❌ Помилка: Вкажіть email та пароль!');
  console.log('💡 Використання: node create-user.js <email> <пароль>');
  process.exit(1);
}
if (!isEmail(email)) {
  console.error('❌ Помилка: Вкажіть коректну email-адресу!');
  process.exit(1);
}

async function createUser() {
  // 1. Налаштовуємо підключення до вашої бази даних
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'metric_render_user',
    password: 'sELEZveN4SPBj6oSI9JRNXB8G2J9YC', // <-- Вставте ваш пароль
    database: 'metric_render',
  });

  try {
    await client.connect();

    // 2. Перевіряємо, чи вже існує така email-адреса
    const checkResult = await client.query('SELECT email FROM users WHERE email = $1', [email]);
    if (checkResult.rows.length > 0) {
      console.log(`⚠️ Користувач з email "${email}" вже існує в базі.`);
      return;
    }

    // 3. Хешуємо пароль (10 раундів солі)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // В якості ID використовуємо сам email або генеруємо унікальний (Date.now().toString())
    const userId = email;

    // 4. Записуємо в базу (використовуємо параметризований запит $1, $2 для безпеки)
    await client.query(
      'INSERT INTO users (id, email, password) VALUES ($1, $2, $3)', 
      [userId, email, hashedPassword]
    );

    console.log(`✅ Користувача "${email}" успішно створено та занесено в PostgreSQL!`);

  } catch (error) {
    console.error('❌ Сталася помилка під час запису в базу:', error.message);
  } finally {
    // 5. Обов'язково закриваємо з'єднання
    await client.end();
  }
}

createUser();