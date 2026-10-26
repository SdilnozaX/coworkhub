from flask import Flask, jsonify, request
from flask_cors import CORS
from database import (
    initialize_database,
    get_zones, get_zone_by_id, update_zone_booked_count,
    get_users, get_user_by_id, get_user_by_email, save_user, login_user, is_admin,
    get_bookings, get_booking_by_id, create_booking, update_booking_payment,
    get_user_bookings, cancel_booking, update_booking_status,
    format_price, format_date, format_time
)

app = Flask(__name__)
CORS(app)

# Initialize database on startup
initialize_database()

# ===== ZONE ENDPOINTS =====
@app.route('/api/zones', methods=['GET'])
def api_get_zones():
    """Get all zones"""
    zones = get_zones()
    return jsonify(zones)

@app.route('/api/zones/<int:zone_id>', methods=['GET'])
def api_get_zone(zone_id):
    """Get zone by ID"""
    zone = get_zone_by_id(zone_id)
    if zone:
        return jsonify(zone)
    return jsonify({'error': 'Zone not found'}), 404

# ===== USER ENDPOINTS =====
@app.route('/api/users', methods=['GET'])
def api_get_users():
    """Get all users"""
    users = get_users()
    return jsonify(users)

@app.route('/api/users/<int:user_id>', methods=['GET'])
def api_get_user(user_id):
    """Get user by ID"""
    user = get_user_by_id(user_id)
    if user:
        return jsonify(user)
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/users/register', methods=['POST'])
def api_register():
    """Register new user"""
    data = request.json
    result = save_user(data)
    return jsonify(result)

@app.route('/api/users/login', methods=['POST'])
def api_login():
    """Login user"""
    data = request.json
    result = login_user(data['email'], data['password'])
    return jsonify(result)

@app.route('/api/users/<int:user_id>/is-admin', methods=['GET'])
def api_check_admin(user_id):
    """Check if user is admin"""
    admin = is_admin(user_id)
    return jsonify({'is_admin': admin})

# ===== BOOKING ENDPOINTS =====
@app.route('/api/bookings', methods=['GET'])
def api_get_bookings():
    """Get all bookings"""
    bookings = get_bookings()
    return jsonify(bookings)

@app.route('/api/bookings/<int:booking_id>', methods=['GET'])
def api_get_booking(booking_id):
    """Get booking by ID"""
    booking = get_booking_by_id(booking_id)
    if booking:
        return jsonify(booking)
    return jsonify({'error': 'Booking not found'}), 404

@app.route('/api/bookings/user/<int:user_id>', methods=['GET'])
def api_get_user_bookings(user_id):
    """Get bookings for a specific user"""
    bookings = get_user_bookings(user_id)
    return jsonify(bookings)

@app.route('/api/bookings', methods=['POST'])
def api_create_booking():
    """Create new booking"""
    data = request.json
    result = create_booking(data)
    return jsonify(result)

@app.route('/api/bookings/<int:booking_id>/payment', methods=['PUT'])
def api_update_payment(booking_id):
    """Update booking payment"""
    data = request.json
    result = update_booking_payment(booking_id, data['payment_method'])
    return jsonify(result)

@app.route('/api/bookings/<int:booking_id>/cancel', methods=['PUT'])
def api_cancel_booking(booking_id):
    """Cancel booking"""
    result = cancel_booking(booking_id)
    return jsonify(result)

@app.route('/api/bookings/<int:booking_id>/status', methods=['PUT'])
def api_update_booking_status(booking_id):
    """Update booking status"""
    data = request.json
    result = update_booking_status(booking_id, data['status'])
    return jsonify(result)

# ===== UTILITY ENDPOINTS =====
@app.route('/api/format/price', methods=['POST'])
def api_format_price():
    """Format price"""
    data = request.json
    return jsonify({'formatted': format_price(data['price'])})

@app.route('/api/format/date', methods=['POST'])
def api_format_date():
    """Format date"""
    data = request.json
    return jsonify({'formatted': format_date(data['date'])})

@app.route('/api/format/time', methods=['POST'])
def api_format_time():
    """Format time"""
    data = request.json
    return jsonify({'formatted': format_time(data['time'])})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
