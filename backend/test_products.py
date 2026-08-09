import requests


login_url = "http://127.0.0.1:5000/api/auth/login"
products_url = "http://127.0.0.1:5000/api/products/"


login_response = requests.post(
    login_url,
    json={
        "email": "owner@example.com",
        "password": "TestPassword123!"
    }
)

print("Login:", login_response.status_code)

token = login_response.json()["access_token"]

headers = {
    "Authorization": f"Bearer {token}"
}


response = requests.get(
    products_url,
    headers=headers
)

print("Products:", response.status_code)
print("Response:", response.json())