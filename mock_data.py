from faker import Faker
import json
import random

fake = Faker()
users_num = 100000
mock_data = []

genders = ["Male", "Female"]
countries = ["Viet Nam", "Japan", "Myanmar", "South Korea", "US"]

mock_data.append({
        "id": 0,
        "name": "Triệu Minh Đức",
        "gender": "Male",
        "age": 26,
        "country": "Viet Nam",
        "email": "trieuduc@gmail.com",
        "quote": "Nothing to say",
        "address": "Kitakasai",
        "phone_number": "012345678900"
    })

for i in range(1, 100000):
    mock_data.append({
        "id": i,
        "name": fake.name(),
        "gender": random.choice(genders),
        "age": random.randint(18, 99),
        "country": random.choice(countries),
        "email": fake.email(),
        "quote": fake.sentence(),
        "address": fake.address(),
        "phone_number": fake.phone_number()
    })

with open('db.json', 'w') as f:
    json.dump(mock_data, f)
