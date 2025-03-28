import requests
import folium
from flask import Flask, send_file, jsonify, request, render_template
import random

app = Flask(__name__)

# Fetch questions from Open Trivia DB API
def fetch_questions(num_questions):
    url = f"https://opentdb.com/api.php?amount={num_questions}&category=22&type=multiple"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes (e.g., 429, 500)
        data = response.json()
        if 'results' in data:
            return data['results']
        else:
            print(f"API Error: No 'results' in response - {data}")
            return []  # Return empty list if no results
    except requests.RequestException as e:
        print(f"Failed to fetch questions: {e}")
        return []  # Return empty list on failure

# Create interactive map
def create_interactive_map(questions, cumulative_score, rounds_played):
    world_map = folium.Map(location=[20.5937, 78.9629], zoom_start=3)
    city_data = {
        "Paris": [48.8566, 2.3522], "New York": [40.7128, -74.0060],
        "Sydney": [-33.8688, 151.2093], "Tokyo": [35.6895, 139.6917], "Cairo": [30.0444, 31.2357]
    }

    # Handle case where questions might be empty
    if not questions:
        folium.Marker(
            [0, 0],
            popup="No questions available due to API error.",
            tooltip="Error"
        ).add_to(world_map)
    else:
        for i, question in enumerate(questions):
            city = random.choice(list(city_data.keys()))
            lat, lon = city_data[city]
            hint_text = f"Hint: This question might be related to {city}! 🌍"
            folium.Marker([lat, lon], popup=hint_text, tooltip=f"Hint for Q{i + 1}").add_to(world_map)

    score_popup = f"Rounds Played: {rounds_played}, Score: {cumulative_score} 🎯"
    folium.Marker([0, 0], popup=score_popup, tooltip="Your Score").add_to(world_map)

    credits_popup = "Made by: Tek Narayan Yadav, Shivam Sharma, Abhishek Kumar Singh"
    folium.Marker([10, 0], popup=credits_popup, tooltip="Credits 🏆").add_to(world_map)

    world_map.save("templates/map.html")
    return "templates/map.html"

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_questions')
def get_questions():
    num_questions = int(request.args.get('num', 5))
    questions = fetch_questions(num_questions)
    return jsonify(questions)

@app.route('/map')
def serve_map():
    score = int(request.args.get('score', 0))
    rounds = int(request.args.get('rounds', 0))
    questions = fetch_questions(5)  # Default number for map
    map_file = create_interactive_map(questions, score, rounds)
    return send_file(map_file)

if __name__ == "__main__":
    print("Server running at http://0.0.0.0:8080")
    app.run(host="0.0.0.0", port=8080, debug=True)