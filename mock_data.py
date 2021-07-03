from faker import Faker
import json
import random

fake = Faker()
mock_data = {
    "users": []
}

genders = ["Male", "Female"]

for i in range(100000):
    mock_data["users"].append({
        "id": i,
        "name": fake.name(),
        "gender": random.choice(genders),
        "age": random.randint(18, 99),
        "email": fake.email(),
        "quote": fake.sentence(),
        "address": fake.address(),
        "phone_number": fake.phone_number()
    })

with open('db.json', 'w') as f:
    json.dump(mock_data, f)
