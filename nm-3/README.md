Accent-Aware Speech Recognition System

Overview
This project develops an Accent-Aware Speech Recognition (ASR) system using the Common Voice dataset. The system is capable of distinguishing between different English accents and uses Mel Frequency Cepstral Coefficients (MFCC) along with a neural network built using PyTorch for training and inference.

Features
- MFCC feature extraction using librosa

- Custom PyTorch Dataset and DataLoader

- Basic Feedforward Neural Network for classification

- Training and evaluation pipeline

- Accuracy metric reporting

- Accent label classification

Dependencies
- Python 3.x

- torch

- torchaudio

- librosa

- numpy

- pandas

- matplotlib

- scikit-learn

Project Structure
bash
Copy
Edit
nm-3/
├── NM3.ipynb           # Main notebook (implementation + training + results)
├── README.md           # Project description (this file)
├── LICENSE             # MIT License
├── CONTRIBUTING.md     # Contribution guidelines
└── requirements.txt    # Project dependencies
Implementation Details
1. Data Processing
Loads audio files and metadata from Common Voice.

- Extracts MFCC features (40 coefficients).

- Encodes accent labels into integer classes.

- Normalizes and formats data for neural network input.

2. Model Architecture
- Simple Feedforward Neural Network (torch.nn.Sequential)

- Input layer matches MFCC shape

- Two hidden layers with ReLU activation

- Output layer predicts accent class

3. Training and Evaluation
- Loss function: CrossEntropyLoss

- Optimizer: Adam

- Reports training and validation accuracy per epoch

- Visualizes loss and accuracy over time

Installation
bash
Copy
Edit
git clone https://github.com/suhail-z/nm-projects.git
cd nm-3
pip install -r requirements.txt
Usage
Place your Common Voice data under a data/ directory.

Run the NM3.ipynb notebook.

Review the printed training logs and accuracy plots.

Adjust model parameters or dataset as needed.

Performance Metrics
Classification Accuracy (per accent class)

Training vs Validation Accuracy Plot

Loss Curve

Notes
Currently uses a basic feedforward architecture; you can extend to RNN/CNN for sequence modeling.

Focused on accent classification, not full speech-to-text.

MFCC-based features only — can be expanded with delta, delta-delta.

You may adapt this for real-time applications with further optimizations.

Contributing
We welcome contributions! Please see CONTRIBUTING.md for guidelines on how to contribute.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Contact
For questions or feedback:

GitHub: suhail-z

Repo: nm-projects