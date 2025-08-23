# 🌾 Paddy Field Insect Detection Application

This project is a deep learning application designed to identify common insects in paddy fields from an image. It uses a user-friendly Streamlit application to serve a custom-trained YOLOv8 model for easy interaction.

The model was trained on a custom-balanced dataset to recognize 11 different classes of insects and achieves an excellent **mAP50 score of 88%**, making it a highly accurate and reliable tool.

### ✨ Features
- **High Accuracy:** Utilizes a YOLOv8 model with an mAP50 of 88%.
- **11 Insect Classes:** Trained to detect a wide variety of common paddy field insects.
- **Web-Based UI:** An intuitive Streamlit interface allows for easy drag-and-drop image uploads.

### 🛠️ Tech Stack
- **Model:** YOLOv8 (Ultralytics)
- **Frontend:** Streamlit
- **Core Libraries:** PyTorch, OpenCV, Pillow

---

## 🚀 Getting Started

Follow these instructions to set up and run the insect detection application on your local machine.

### Prerequisites
- Python 3.8 or newer
- Git

### 1. Clone the Repository
First, clone this repository to your local machine.
```bash
git clone https://github.com/ywchanna2001/Paddy-Field-Insects-Classification.git
cd Insect_Detecting_App
```

### 2. Create and Activate a Virtual Environment
It is highly recommended to use a virtual environment to keep project dependencies isolated.

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python -m venv venv
source venv/bin/activate
```


Your folder structure should look like this:
```
Insect_Detecting_App/
├── Models/
│   └── best.pt
└── app.py
```

### 3. Install Dependencies
Install all the required Python libraries using pip.
```bash
pip install streamlit python-multipart ultralytics opencv-python requests Pillow
```

---

## ▶️ Running the Application

With your virtual environment activated, you can start the application.

In your terminal, run the following command to start the Streamlit app:
```bash
streamlit run app.py
```
A new tab should automatically open in your web browser with the application's user interface. If it doesn't, navigate to the "Local URL" provided in the terminal.

---

## 🧪 How to Test

You are now ready to test the model!

1.  Download sample images of paddy fields containing insects from the dataset used for training:

    ➡️ **[Download Test Images from Google Drive]**<br>
    https://drive.google.com/drive/folders/15jYrOxWScGqxN3nevf5a78_QYJquFhnw?usp=drive_link

2.  Drag and drop one of the downloaded images onto the file uploader in the web application.
3.  The application will display the original image on the left and the image with the detected insects and their bounding boxes on the right.
