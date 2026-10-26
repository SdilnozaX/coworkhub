import sqlite3
from datetime import datetime
import json

# Database file name
DB_NAME = 'coworking.db'

# ===== INITIALIZE DATABASE =====
def initialize_database():
    """Create database tables and insert mock data if they don't exist"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create zones table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS zones (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            price INTEGER NOT NULL,
            period TEXT NOT NULL,
            capacity INTEGER NOT NULL,
            current_booked INTEGER DEFAULT 0,
            status TEXT DEFAULT 'available',
            image_url TEXT,
            icons TEXT
        )
    ''')
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    ''')
    
    # Create bookings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            zone_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            total_price INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (zone_id) REFERENCES zones(id)
        )
    ''')
    
    # Insert mock zones if table is empty
    cursor.execute('SELECT COUNT(*) FROM zones')
    if cursor.fetchone()[0] == 0:
        mock_zones = [
            (1, 'Open Space Zone', 50000, "so'm/soat", 20, 8, 'available',
             'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
             json.dumps(['🪑', '💻', '📶'])),
            (2, 'Private Office', 150000, "so'm/soat", 4, 3, 'available',
             'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
             json.dumps(['🔒', '💻', '📊'])),
            (3, 'Meeting Room', 200000, "so'm/soat", 10, 10, 'full',
             'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800',
             json.dumps(['📽️', '📊', '☕'])),
            (4, 'Creative Studio', 80000, "so'm/soat", 8, 2, 'available',
             'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
             json.dumps(['🎨', '📷', '💡'])),
            (5, 'Focus Zone', 60000, "so'm/soat", 15, 5, 'available',
             'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
             json.dumps(['🔇', '💻', '📚'])),
            (6, 'Lounge Area', 30000, "so'm/soat", 25, 12, 'available',
             'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
             json.dumps(['🛋️', '☕', '📱']))
        ]
        cursor.executemany('''
            INSERT INTO zones (id, title, price, period, capacity, current_booked, status, image_url, icons)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', mock_zones)
    
    # Insert mock users if table is empty
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        mock_users = [
            (1, 'Admin User', 'admin@cowork.uz', 'admin123', 'admin'),
            (2, 'John Doe', 'john@example.com', 'user123', 'user'),
            (3, 'Jane Smith', 'jane@example.com', 'user123', 'user')
        ]
        cursor.executemany('''
            INSERT INTO users (id, name, email, password, role)
            VALUES (?, ?, ?, ?, ?)
        ''', mock_users)
    
    # Insert mock bookings if table is empty
    cursor.execute('SELECT COUNT(*) FROM bookings')
    if cursor.fetchone()[0] == 0:
        mock_bookings = [
            (1, 2, 1, '2026-10-20', '10:00', 50000, 'confirmed', None),
            (2, 3, 4, '2026-10-21', '14:00', 80000, 'pending', None)
        ]
        cursor.executemany('''
            INSERT INTO bookings (booking_id, user_id, zone_id, date, time, total_price, status, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', mock_bookings)
    
    conn.commit()
    conn.close()

# ===== ZONE FUNCTIONS =====
def get_zones():
    """Get all zones"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM zones')
    rows = cursor.fetchall()
    conn.close()
    
    zones = []
    for row in rows:
        zones.append({
            'id': row[0],
            'title': row[1],
            'price': row[2],
            'period': row[3],
            'capacity': row[4],
            'current_booked': row[5],
            'status': row[6],
            'image_url': row[7],
            'icons': json.loads(row[8]) if row[8] else []
        })
    return zones

def get_zone_by_id(zone_id):
    """Get zone by ID"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM zones WHERE id = ?', (zone_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row[0],
            'title': row[1],
            'price': row[2],
            'period': row[3],
            'capacity': row[4],
            'current_booked': row[5],
            'status': row[6],
            'image_url': row[7],
            'icons': json.loads(row[8]) if row[8] else []
        }
    return None

def update_zone_booked_count(zone_id, increment):
    """Update zone booked count and status"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT current_booked, capacity FROM zones WHERE id = ?', (zone_id,))
    row = cursor.fetchone()
    
    if row:
        current_booked, capacity = row
        new_booked = current_booked + increment
        
        # Update status based on capacity
        new_status = 'full' if new_booked >= capacity else 'available'
        
        cursor.execute('''
            UPDATE zones 
            SET current_booked = ?, status = ?
            WHERE id = ?
        ''', (new_booked, new_status, zone_id))
        conn.commit()
    
    conn.close()

# ===== USER FUNCTIONS =====
def get_users():
    """Get all users"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    rows = cursor.fetchall()
    conn.close()
    
    users = []
    for row in rows:
        users.append({
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'password': row[3],
            'role': row[4]
        })
    return users

def get_user_by_id(user_id):
    """Get user by ID"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'password': row[3],
            'role': row[4]
        }
    return None

def get_user_by_email(email):
    """Get user by email"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'password': row[3],
            'role': row[4]
        }
    return None

def save_user(user):
    """Save new user"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Check if email already exists
    cursor.execute('SELECT id FROM users WHERE email = ?', (user['email'],))
    if cursor.fetchone():
        conn.close()
        return {'success': False, 'message': "Bu email allaqachon ro'yxatdan o'tgan"}
    
    # Generate new ID
    cursor.execute('SELECT MAX(id) FROM users')
    max_id = cursor.fetchone()[0]
    new_id = (max_id + 1) if max_id else 1
    
    cursor.execute('''
        INSERT INTO users (id, name, email, password, role)
        VALUES (?, ?, ?, ?, ?)
    ''', (new_id, user['name'], user['email'], user['password'], user.get('role', 'user')))
    
    conn.commit()
    conn.close()
    
    user['id'] = new_id
    return {'success': True, 'message': "Ro'yxatdan o'tish muvaffaqiyatli", 'user': user}

def login_user(email, password):
    """Login user"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        user = {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'password': row[3],
            'role': row[4]
        }
        return {'success': True, 'message': "Tizimga muvaffaqiyatli kirdingiz", 'user': user}
    
    return {'success': False, 'message': 'Email yoki parol noto\'g\'ri'}

def is_admin(user_id):
    """Check if user is admin"""
    user = get_user_by_id(user_id)
    return user and user['role'] == 'admin'

# ===== BOOKING FUNCTIONS =====
def get_bookings():
    """Get all bookings"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM bookings')
    rows = cursor.fetchall()
    conn.close()
    
    bookings = []
    for row in rows:
        bookings.append({
            'booking_id': row[0],
            'user_id': row[1],
            'zone_id': row[2],
            'date': row[3],
            'time': row[4],
            'total_price': row[5],
            'status': row[6],
            'payment_method': row[7]
        })
    return bookings

def get_booking_by_id(booking_id):
    """Get booking by ID"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM bookings WHERE booking_id = ?', (booking_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'booking_id': row[0],
            'user_id': row[1],
            'zone_id': row[2],
            'date': row[3],
            'time': row[4],
            'total_price': row[5],
            'status': row[6],
            'payment_method': row[7]
        }
    return None

def create_booking(booking_data):
    """Create new booking"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Check if zone is available
    zone = get_zone_by_id(booking_data['zone_id'])
    if not zone or zone['status'] == 'full':
        conn.close()
        return {'success': False, 'message': 'Bu zona hozircha mavjud emas'}
    
    # Check if already booked for same date and time
    cursor.execute('''
        SELECT * FROM bookings 
        WHERE zone_id = ? AND date = ? AND time = ? AND status != 'cancelled'
    ''', (booking_data['zone_id'], booking_data['date'], booking_data['time']))
    
    if cursor.fetchone():
        conn.close()
        return {'success': False, 'message': 'Bu vaqtda zona allaqachon bron qilingan'}
    
    # Generate new booking ID
    cursor.execute('SELECT MAX(booking_id) FROM bookings')
    max_id = cursor.fetchone()[0]
    new_booking_id = (max_id + 1) if max_id else 1
    
    cursor.execute('''
        INSERT INTO bookings (booking_id, user_id, zone_id, date, time, total_price, status, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        new_booking_id,
        booking_data['user_id'],
        booking_data['zone_id'],
        booking_data['date'],
        booking_data['time'],
        booking_data['total_price'],
        booking_data.get('status', 'pending'),
        booking_data.get('payment_method')
    ))
    
    conn.commit()
    conn.close()
    
    # Update zone booked count if payment is completed
    if booking_data.get('status') == 'paid':
        update_zone_booked_count(booking_data['zone_id'], 1)
    
    booking = {
        'booking_id': new_booking_id,
        **booking_data,
        'status': booking_data.get('status', 'pending'),
        'payment_method': booking_data.get('payment_method')
    }
    
    return {'success': True, 'message': 'Bron muvaffaqiyatli amalga oshirildi', 'booking': booking}

def update_booking_payment(booking_id, payment_method):
    """Update booking payment status"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT zone_id FROM bookings WHERE booking_id = ?', (booking_id,))
    row = cursor.fetchone()
    
    if row:
        zone_id = row[0]
        cursor.execute('''
            UPDATE bookings 
            SET status = 'paid', payment_method = ?
            WHERE booking_id = ?
        ''', (payment_method, booking_id))
        conn.commit()
        conn.close()
        
        # Update zone booked count
        update_zone_booked_count(zone_id, 1)
        
        return {'success': True, 'message': "To'lov muvaffaqiyatli amalga oshirildi"}
    
    conn.close()
    return {'success': False, 'message': 'Bron topilmadi'}

def get_user_bookings(user_id):
    """Get bookings for a specific user"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM bookings WHERE user_id = ?', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    bookings = []
    for row in rows:
        bookings.append({
            'booking_id': row[0],
            'user_id': row[1],
            'zone_id': row[2],
            'date': row[3],
            'time': row[4],
            'total_price': row[5],
            'status': row[6],
            'payment_method': row[7]
        })
    return bookings

def cancel_booking(booking_id):
    """Cancel a booking"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT zone_id FROM bookings WHERE booking_id = ?', (booking_id,))
    row = cursor.fetchone()
    
    if row:
        zone_id = row[0]
        cursor.execute('UPDATE bookings SET status = ? WHERE booking_id = ?', ('cancelled', booking_id))
        conn.commit()
        conn.close()
        
        # Update zone booked count
        update_zone_booked_count(zone_id, -1)
        
        return {'success': True, 'message': 'Bron bekor qilindi'}
    
    conn.close()
    return {'success': False, 'message': 'Bron topilmadi'}

def update_booking_status(booking_id, status):
    """Update booking status"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('UPDATE bookings SET status = ? WHERE booking_id = ?', (status, booking_id))
    conn.commit()
    conn.close()
    
    return {'success': True, 'message': 'Bron holati yangilandi'}

# ===== UTILITY FUNCTIONS =====
def format_price(price):
    """Format price with thousands separator"""
    return f"{price:,} so'm".replace(',', ' ')

def format_date(date_string):
    """Format date to Uzbek locale"""
    date = datetime.strptime(date_string, '%Y-%m-%d')
    months = {
        1: 'yanvar', 2: 'fevral', 3: 'mart', 4: 'aprel',
        5: 'may', 6: 'iyun', 7: 'iyul', 8: 'avgust',
        9: 'sentyabr', 10: 'oktyabr', 11: 'noyabr', 12: 'dekabr'
    }
    return f"{date.day} {months[date.month]} {date.year}"

def format_time(time_string):
    """Format time range"""
    hours, minutes = time_string.split(':')
    end_hours = int(hours) + 1
    return f"{time_string} - {end_hours}:{minutes}"

# ===== MAIN =====
if __name__ == '__main__':
    # Initialize database with mock data
    initialize_database()
    print("Database initialized successfully!")
    
    # Test queries
    print("\n=== Zones ===")
    for zone in get_zones():
        print(f"{zone['id']}: {zone['title']} - {format_price(zone['price'])}")
    
    print("\n=== Users ===")
    for user in get_users():
        print(f"{user['id']}: {user['name']} ({user['email']}) - {user['role']}")
    
    print("\n=== Bookings ===")
    for booking in get_bookings():
        print(f"Booking {booking['booking_id']}: User {booking['user_id']} - Zone {booking['zone_id']} - {booking['status']}")
