import csv
from flask import Flask, request, jsonify
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


def get_motivation_message(average):
    if average >= 90:
        return "اشطر واحد ❤️"
    elif average >= 75:
        return "🔥عااش"
    elif average >= 50:
        return "👏تقدر توصل"
    else:
        return "📈 لا تيأس! استمر!"


@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        file = request.files["file"]
        data_type = request.form["data_type"]
        
        if file:
            # Read the CSV file
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            csv_reader = csv.DictReader(stream)
            data = list(csv_reader)
            
            # Check for required columns
            if data_type == "exam":
                required_columns = ["اسم الامتحان", "عدد الاسئلة", "عدد الاسئلة الصحيحة", "النتيجة"]
            else:
                required_columns = ["اسم الواجب", "عدد الاسئلة", "عدد الاسئلة الصحيحة", "النتيجة"]

            if not all(col in data[0].keys() for col in required_columns):
                return jsonify({"error": "الملف لا يحتوي على الأعمدة المطلوبة."}), 400
            
            # Calculate average
            total_score = 0
            for row in data:
                score = float(row["النتيجة"].replace("%", ""))
                total_score += score
            
            average_result = int(round(total_score / len(data)))
            motivation_message = get_motivation_message(average_result)
            
            return jsonify({
                "average_result": average_result,
                "motivation_message": motivation_message,
                "data": data
            })

    return jsonify({"message": "Please send a POST request with a file"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
