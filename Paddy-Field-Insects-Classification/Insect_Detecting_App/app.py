# app.py

import streamlit as st
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import json

# Load the trained YOLOv8 model
# Using st.cache_resource to load the model only once
@st.cache_resource
def load_model():
    model = YOLO('Models/best.pt')
    return model

# Using st.cache_data to load insect data only once
@st.cache_data
def load_insect_data():
    with open('insects.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {item['key']: item for item in data['insects']}


model = load_model()
insect_data_map = load_insect_data()

st.set_page_config(layout="wide", page_title="Paddy Field Insect Detector")

st.title("🌾 Paddy Field Insect Detector")
st.write("Upload an image and the YOLOv8 model will detect insects present in it.")

# Create a file uploader widget
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Display columns for side-by-side view
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Original Image")
        # Display the uploaded image
        original_image = Image.open(uploaded_file)
        st.image(original_image, use_container_width=True)

    # When the file is uploaded, run the detection
    with st.spinner('Running detection...'):
        # Read the contents of the uploaded file
        contents = uploaded_file.getvalue()
        
        # Convert the image bytes to a NumPy array
        np_array = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        
        # Run the YOLO model on the image
        results = model.predict(source=image)
        
        # Get the image with the bounding boxes plotted on it
        result_image_array = results[0].plot() 
        
        # Convert the result from BGR (OpenCV default) to RGB for Streamlit
        result_image_rgb = cv2.cvtColor(result_image_array, cv2.COLOR_BGR2RGB)
        
        with col2:
            st.subheader("Detection Results")
            st.image(result_image_rgb, use_container_width=True)
            
    # Display detected insect information
    detected_classes_indices = results[0].boxes.cls.unique().cpu().numpy().astype(int)
    detected_classes_names = [model.names[i] for i in detected_classes_indices]

    if detected_classes_names:
        st.subheader("Detected Insect Information")
        for insect_name in detected_classes_names:
            insect_info = insect_data_map.get(insect_name)
            if insect_info:
                status_icon = "✅" if insect_info['status'] == 'Harmful' else '🛡️'
                st.markdown(f"### {status_icon} {insect_info['english_name']} ({insect_info['sinhala_name']})")
                st.markdown(f"**Status:** {insect_info['status']}")
                st.markdown(f"**Description:** {insect_info['description']}")
                st.markdown("**Reduce Methods:**")
                # reduce_method is a list of strings
                for method in insect_info['reduce_method']:
                    st.markdown(f"- {method}")
                st.markdown("---")
