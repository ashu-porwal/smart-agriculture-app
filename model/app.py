from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from flask_cors import CORS
import numpy as np
import os

app = Flask(__name__)
CORS(app)

model = load_model("model.h5")
dataset_path = "datasets/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/train"
classes = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___healthy",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Potato___Early_blight",
    "Potato___healthy",
    "Potato___Late_blight",
    "Strawberry___healthy",
    "Strawberry___Leaf_scorch",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___healthy",
    "Tomato___Late_blight"
]

data = {
    "Apple___Apple_scab": {
        "treatment": "Apply fungicides like captan or myclobutanil",
        "precaution": "Ensure good air circulation and remove fallen leaves"
    },
    "Apple___Black_rot": {
        "treatment": "Prune infected branches and apply fungicide",
        "precaution": "Keep orchard clean and remove infected fruits"
    },
    "Apple___Cedar_apple_rust": {
        "treatment": "Use fungicides like myclobutanil",
        "precaution": "Remove nearby juniper plants"
    },
    "Apple___healthy": {
        "treatment": "No treatment required",
        "precaution": "Maintain proper nutrition and watering"
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "treatment": "Apply strobilurin fungicides",
        "precaution": "Practice crop rotation"
    },
    "Corn_(maize)___Common_rust_": {
        "treatment": "Use resistant hybrids and fungicides",
        "precaution": "Avoid overcrowding"
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "treatment": "Apply fungicides early",
        "precaution": "Use resistant varieties"
    },
    "Corn_(maize)___healthy": {
        "treatment": "No treatment required",
        "precaution": "Maintain soil fertility"
    },
    "Potato___Early_blight": {
        "treatment": "Use fungicides like chlorothalonil",
        "precaution": "Avoid overhead irrigation"
    },
    "Potato___Late_blight": {
        "treatment": "Apply copper-based fungicides",
        "precaution": "Ensure proper spacing and drainage"
    },
    "Potato___healthy": {
        "treatment": "No treatment required",
        "precaution": "Regular monitoring of crops"
    },
    "Tomato___Bacterial_spot": {
        "treatment": "Use copper sprays",
        "precaution": "Avoid handling wet plants"
    },
    "Tomato___Early_blight": {
        "treatment": "Apply fungicide and remove infected leaves",
        "precaution": "Avoid overhead watering"
    },
    "Tomato___Late_blight": {
        "treatment": "Use systemic fungicides",
        "precaution": "Remove infected plants immediately"
    },
    "Tomato___healthy": {
        "treatment": "No treatment required",
        "precaution": "Maintain proper irrigation"
    },
    "Strawberry___Leaf_scorch": {
        "treatment": "Apply fungicide spray",
        "precaution": "Avoid excess moisture"
    },
    "Strawberry___healthy": {
        "treatment": "No treatment required",
        "precaution": "Ensure proper sunlight and watering"
    }
}

@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["file"]
    filepath = "temp.jpg"
    file.save(filepath)

    img = image.load_img(filepath, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    prediction = model.predict(img_array)
    index = np.argmax(prediction)
    confidence = float(np.max(prediction) * 100)

    result = classes[index]
    crop, disease = result.split("___")

    if disease == "healthy":
        disease_output = "No Disease (Healthy)"
    else:
        disease_output = disease

    info = data.get(result, {"treatment": "Consult expert", "precaution": "General care"})

    return jsonify({
        "crop": crop,
        "disease": disease_output,
        "confidence": round(confidence, 2),
        "treatment": info["treatment"],
        "precaution": info["precaution"]
    })

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
