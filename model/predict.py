import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# load model
model = load_model("model.h5")

# load class names automatically
dataset_path = "datasets/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/train"
classes = sorted(os.listdir(dataset_path))

# disease info database (ALL 17 classes)
data = {
    "Apple___Apple_scab": {
        "treatment": "Apply fungicides like captan or myclobutanil",
        "precaution": "Ensure good air circulation and remove fallen leaves"
    },
    "Apple___Black_rot": {
        "treatment": "Prune infected branches and apply fungicide",
        "precaution": "Keep orchard clean and remove mummified fruits"
    },
    "Apple___Cedar_apple_rust": {
        "treatment": "Use fungicides like myclobutanil",
        "precaution": "Remove nearby juniper plants"
    },
    "Apple___healthy": {
        "treatment": "No treatment required",
        "precaution": "Maintain proper care and nutrition"
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
        "precaution": "Maintain regular monitoring"
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

# load image
img_path = "test.jpg"
img = image.load_img(img_path, target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0) / 255.0

# prediction
prediction = model.predict(img_array)
index = np.argmax(prediction)
confidence = np.max(prediction) * 100

result = classes[index]

# split crop and disease
crop, disease = result.split("___")
if disease == "healthy":
    disease_output = "No Disease (Healthy)"
else:
    disease_output = disease

info = data.get(result, {"treatment": "Consult expert", "precaution": "General care"})

# FINAL OUTPUT FORMAT
print("\n===== RESULT =====")
print("Crop:", crop)
print("Disease:", disease_output)
print("Confidence:", round(confidence, 2), "%")
if confidence < 50:
    print("⚠️ Low confidence prediction. Image may not belong to trained crops.")
print("Treatment Advisory:", info["treatment"])
print("Precaution:", info["precaution"])