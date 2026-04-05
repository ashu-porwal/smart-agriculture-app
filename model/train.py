import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2

# ✅ CHANGE THIS PATH IF NEEDED
dataset_path = "datasets/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/train"

# Step 1: Data Generator (80% train, 20% temp)
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

# Training Data (80%)
train_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

# Temp Data (20%) → used for validation + testing
temp_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

# For simplicity (acceptable for project)
val_data = temp_data
test_data = temp_data

# Step 2: Load Pretrained MobileNetV2
base_model = MobileNetV2(
    input_shape=(224,224,3),
    include_top=False,
    weights='imagenet'
)

base_model.trainable = False  # freeze pretrained layers

# Step 3: Build Model
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dense(train_data.num_classes, activation='softmax')
])

# Step 4: Compile Model
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Step 5: Train Model
model.fit(
    train_data,
    validation_data=val_data,
    epochs=50
)

# Step 6: Evaluate Model
test_loss, test_acc = model.evaluate(test_data)
print("Test Accuracy:", test_acc)

# Step 7: Save Model
model.save("model.h5")

print("✅ Model trained and saved successfully!")