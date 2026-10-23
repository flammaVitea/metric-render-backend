const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Зчитуємо аргументи з командного рядка (node create-user.js <username> <password>)
const username = process.argv[2];
const plainPassword = process.argv[3];

if (!username || !plainPassword) {
  console.error('❌ Помилка: Вкажіть логін та пароль!');
  console.log('💡 Використання: node create-user.js <логін> <пароль>');
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

    // 2. Перевіряємо, чи вже існує такий логін
    const checkResult = await client.query('SELECT username FROM users WHERE username = $1', [username]);
    if (checkResult.rows.length > 0) {
      console.log(`⚠️ Користувач з логіном "${username}" вже існує в базі.`);
      return;
    }

    // 3. Хешуємо пароль (10 раундів солі)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // В якості ID використовуємо сам логін або генеруємо унікальний (Date.now().toString())
    const userId = username; 

    // 4. Записуємо в базу (використовуємо параметризований запит $1, $2 для безпеки)
    await client.query(
      'INSERT INTO users (id, username, password) VALUES ($1, $2, $3)', 
      [userId, username, hashedPassword]
    );

    console.log(`✅ Користувача "${username}" успішно створено та занесено в PostgreSQL!`);

  } catch (error) {
    console.error('❌ Сталася помилка під час запису в базу:', error.message);
  } finally {
    // 5. Обов'язково закриваємо з'єднання
    await client.end();
  }
}

createUser();