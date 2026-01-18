import requests
import json

TURSO_DATABASE_URL = "libsql://database-pink-flower-vercel-icfg-rspi65tzpl4hxmhldagh9ktb.aws-us-east-1.turso.io"
TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njg1NTQ1NDcsImlkIjoiM2I0MjZhMGQtYjE2NS00N2YxLTgxMjktNjUyZjc0ZDFiOTU1IiwicmlkIjoiNjA1MGRlOTYtNDlkMy00OGIwLThhYjQtOGUxNjg5OWUyMDE4In0.SgSJOJCULSihlTPdrRoZgUE-Uz5fNzbn2u4A-v3H1MN8gIfGuDSNYtCVTrMxDPzJBIeDXfWwkO5Vtbv_47ZLDA"

base_url = TURSO_DATABASE_URL.replace("libsql://", "https://")
headers = {
    "Authorization": f"Bearer {TURSO_AUTH_TOKEN}",
    "Content-Type": "application/json"
}

# First, check what's in the database
print("📊 Checking current suggestions...")
check_response = requests.post(
    f"{base_url}/v2/pipeline",
    headers=headers,
    json={
        "requests": [{
            "type": "execute",
            "stmt": {
                "sql": "SELECT COUNT(*) as count FROM suggestions",
                "args": []
            }
        }]
    }
)

if check_response.status_code == 200:
    result = check_response.json()
    count = result.get("results", [{}])[0].get("response", {}).get("result", {}).get("rows", [[0]])[0][0]
    print(f"Found {count} suggestions in database")

# Delete all suggestions
print("\n🗑️  Deleting all suggestions...")
delete_response = requests.post(
    f"{base_url}/v2/pipeline",
    headers=headers,
    json={
        "requests": [{
            "type": "execute",
            "stmt": {
                "sql": "DELETE FROM suggestions",
                "args": []
            }
        }]
    }
)

if delete_response.status_code == 200:
    print("✅ Successfully deleted all suggestions!")
else:
    print(f"❌ Error: {delete_response.status_code}")
    print(delete_response.text)