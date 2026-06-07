from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/')
def health():
    return jsonify({'message': 'AquaMind AI Engine is running!'})


if __name__ == '__main__':
    app.run(port=5001, debug=True)
