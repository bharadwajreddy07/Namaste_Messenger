
## Your Reset Token
Token: `d136e8d7742bacc48503837d30ca690705990ea7d607da02`
Email: `bharadwajreddy78@gmail.com`

## Method 1: Browser Reset (Recommended)
1. Copy this URL and paste it in your browser:
```
http://localhost:5175/reset-password/d136e8d7742bacc48503837d30ca690705990ea7d607da02


## Method 2: API Testing with curl
```bash
curl -X POST http://localhost:5000/api/auth/reset-password/d136e8d7742bacc48503837d30ca690705990ea7d607da02 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "your-new-password",
    "confirmPassword": "your-new-password"
  }'
```

## Method 3: API Testing with Postman/Thunder Client
**URL:** `POST http://localhost:5000/api/auth/reset-password/d136e8d7742bacc48503837d30ca690705990ea7d607da02`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "password": "your-new-password",
  "confirmPassword": "your-new-password"
}
```

## Method 4: JavaScript Fetch (for testing in browser console)
```javascript
fetch('http://localhost:5000/api/auth/reset-password/d136e8d7742bacc48503837d30ca690705990ea7d607da02', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    password: 'your-new-password',
    confirmPassword: 'your-new-password'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Expected Success Response
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```
