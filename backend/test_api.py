import sys
from pathlib import Path

# Ensure root is in python path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_flow():
    print("--- 1. Testing Health Check ---")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    assert res.json()["status"] == "ok"
    print("Health check OK!")

    print("\n--- 2. Testing Registration & Login ---")
    test_email = "tester_qa@example.com"
    test_password = "password123"

    # Register
    reg_payload = {"name": "QA Tester", "email": test_email, "password": test_password}
    res_reg = client.post("/auth/register", json=reg_payload)
    if res_reg.status_code == 409:
        print("User already registered, proceeding to login.")
    else:
        assert res_reg.status_code == 201, f"Registration failed: {res_reg.text}"
        print("Registration OK!")

    # Login
    login_payload = {"email": test_email, "password": test_password}
    res_login = client.post("/auth/login", json=login_payload)
    assert res_login.status_code == 200, f"Login failed: {res_login.text}"
    token_data = res_login.json()
    token = token_data["access_token"]
    user_id = token_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Login OK! Token acquired for user ID: {user_id}")

    # Test /auth/me
    res_me = client.get("/auth/me", headers=headers)
    assert res_me.status_code == 200, f"Me endpoint failed: {res_me.text}"
    assert res_me.json()["email"] == test_email
    print("Auth /me OK!")

    print("\n--- 3. Testing Project Creation & Discovery ---")
    proj_payload = {
        "title": "Autonomous Drone Navigator",
        "short_description": "An autonomous drone pathfinding system using computer vision.",
        "description": "Full description of Autonomous Drone Navigator using ROS and OpenCV.",
        "problem_statement": "Drones often struggle with obstacle detection in GPS-denied environments.",
        "proposed_solution": "Real-time edge visual SLAM algorithms running on Raspberry Pi.",
        "category": "IoT & Embedded Systems",
        "technology": "Python, OpenCV, ROS, C++",
        "github_url": "https://github.com/example/drone-nav",
        "demo_url": "https://drone-demo.example.com",
        "status": "published"
    }
    res_create = client.post("/projects", json=proj_payload, headers=headers)
    assert res_create.status_code == 201, f"Project creation failed: {res_create.text}"
    created_proj = res_create.json()
    proj_id = created_proj["id"]
    print(f"Project created successfully with ID: {proj_id}")

    # Search and Filter
    res_list = client.get("/projects?search=Drone&category=IoT")
    assert res_list.status_code == 200, f"Project list failed: {res_list.text}"
    list_data = res_list.json()
    assert list_data["total"] >= 1, "Search should return at least 1 project"
    print(f"Project search & filter OK! Found {list_data['total']} items.")

    # Get Single Project
    res_get = client.get(f"/projects/{proj_id}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["title"] == "Autonomous Drone Navigator"
    print("Get project details OK!")

    print("\n--- 4. Testing Likes & Favorites ---")
    # Like
    res_like = client.post(f"/projects/{proj_id}/like", headers=headers)
    assert res_like.status_code == 200
    assert res_like.json()["is_liked"] is True
    print("Like project OK!")

    # Favorite
    res_fav = client.post(f"/projects/{proj_id}/favorite", headers=headers)
    assert res_fav.status_code == 200
    assert res_fav.json()["is_favorited"] is True
    print("Favorite project OK!")

    # Check favorites list
    res_fav_list = client.get("/favorites", headers=headers)
    assert res_fav_list.status_code == 200
    assert any(p["id"] == proj_id for p in res_fav_list.json())
    print("User favorites list OK!")

    print("\n--- 5. Testing Comments ---")
    res_comm = client.post(f"/projects/{proj_id}/comments", json={"content": "Incredible work on the SLAM pipeline!"}, headers=headers)
    assert res_comm.status_code == 201
    comment_id = res_comm.json()["id"]
    print(f"Comment added OK! ID: {comment_id}")

    res_comms = client.get(f"/projects/{proj_id}/comments")
    assert res_comms.status_code == 200
    assert any(c["id"] == comment_id for c in res_comms.json())
    print("Get comments list OK!")

    print("\n--- 6. Testing Student Profile & Dashboard ---")
    profile_update = {
        "bio": "Robotics and AI enthusiast building autonomous systems.",
        "college": "MIT / Stanford",
        "department": "Computer Science & Electrical Engineering",
        "graduation_year": 2026,
        "skills": "Python, C++, ROS, OpenCV, PyTorch"
    }
    res_prof = client.put("/students/me/profile", json=profile_update, headers=headers)
    assert res_prof.status_code == 200
    assert res_prof.json()["bio"] == profile_update["bio"]
    print("Student profile update OK!")

    # Public profile
    res_pub = client.get(f"/students/{user_id}")
    assert res_pub.status_code == 200
    assert res_pub.json()["name"] == "QA Tester"
    print("Public student profile OK!")

    # Dashboard Stats
    res_stats = client.get("/dashboard/stats", headers=headers)
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert stats["total_projects"] >= 1
    assert stats["total_likes"] >= 1
    assert stats["total_favorites"] >= 1
    print(f"Dashboard stats OK: {stats}")

    print("\n--- 7. Testing Categories ---")
    res_cats = client.get("/categories")
    assert res_cats.status_code == 200
    assert len(res_cats.json()) > 0
    print(f"Categories OK! Total categories: {len(res_cats.json())}")

    print("\n--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_full_flow()
