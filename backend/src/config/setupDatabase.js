// const db = require('./db');
// const bcrypt = require('bcrypt');

// const setupDatabase = async () => {
//   try {
//     console.log('🔍 Checking database structure...');
    
//     // Check if users table exists
//     db.query("SHOW TABLES LIKE 'users'", (err, results) => {
//       if (err) {
//         console.error('❌ Error checking tables:', err.message);
//         return;
//       }
      
//       if (results.length === 0) {
//         console.log('📋 Users table not found. Creating it...');
        
//         const createUsersTable = `
//           CREATE TABLE users (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             full_name VARCHAR(255) NOT NULL,
//             phone VARCHAR(20),
//             email VARCHAR(255) UNIQUE NOT NULL,
//             password VARCHAR(255) NOT NULL,
//             role ENUM('admin', 'customer', 'technician') DEFAULT 'customer',
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//           )
//         `;
        
//         db.query(createUsersTable, (err, result) => {
//           if (err) {
//             console.error('❌ Error creating users table:', err.message);
//           } else {
//             console.log('✅ Users table created successfully!');
//             createTestAdmin();
//           }
//         });
//       } else {
//         console.log('✅ Users table already exists');
//         checkUsers();
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Database setup error:', error.message);
//   }
// };

// const createTestAdmin = () => {
//   const testUser = {
//     full_name: 'Admin User',
//     phone: '1234567890',
//     email: 'admin@example.com',
//     password: 'admin123'
//   };
  
//   bcrypt.hash(testUser.password, 10, (err, hashedPassword) => {
//     if (err) {
//       console.error('❌ Error hashing password:', err.message);
//       return;
//     }
    
//     db.query(
//       'INSERT INTO users (full_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)',
//       [testUser.full_name, testUser.phone, testUser.email, hashedPassword, 'admin'],
//       (err, result) => {
//         if (err) {
//           if (err.code === 'ER_DUP_ENTRY') {
//             console.log('✅ Admin user already exists');
//           } else {
//             console.error('❌ Error creating test user:', err.message);
//           }
//         } else {
//           console.log('✅ Test admin user created:');
//           console.log('   Email: admin@example.com');
//           console.log('   Password: admin123');
//           console.log('   Role: admin');
//         }
//       }
//     );
//   });
// };

// const checkUsers = () => {
//   // Check if there are any users
//   db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
//     if (err) {
//       console.error('❌ Error counting users:', err.message);
//     } else {
//       const userCount = results[0].count;
//       console.log(`👥 Found ${userCount} user(s) in database`);
      
//       if (userCount === 0) {
//         console.log('⚠️  No users found. Creating admin user...');
//         createTestAdmin();
//       } else {
//         // Show existing users
//         db.query('SELECT email, role FROM users', (err, results) => {
//           if (err) {
//             console.error('❌ Error fetching users:', err.message);
//           } else {
//             console.log('📋 Existing users:');
//             results.forEach(user => {
//               console.log(`   - ${user.email} (${user.role})`);
//             });
//           }
//         });
//       }
//     }
//   });
// };

// setupDatabase();
