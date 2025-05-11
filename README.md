# Speech Recognition Projects - Naan Mudhalvan

[![Python Version](https://img.shields.io/badge/python-3.x-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)

## About Naan Mudhalvan
Naan Mudhalvan is a pioneering initiative by the Government of Tamil Nadu, India, aimed at enhancing the employability of students through industry-aligned training programs. The program collaborates with leading technology companies and educational institutions to provide cutting-edge training in various domains, including Artificial Intelligence, Machine Learning, and Speech Recognition.

## About GUVI
GUVI (Grab Your Vernacular Imprint) is a leading ed-tech platform that provides vernacular language-based technical education. As a partner in the Naan Mudhalvan program, GUVI offers specialized courses in emerging technologies, including their comprehensive Speech Recognition course that covers both theoretical concepts and practical implementations.

## Project Overview
This repository contains three major projects developed as part of the Naan Mudhalvan Speech Recognition course:

1. **Real Time Speech Recognition** (`nm-3/`)
   - Comprehensive audio data preparation pipeline
   - Format conversion and standardization
   - Data augmentation techniques
   - Metadata management

2. **Accent-Aware Speech Recognition** (`nm-4/`)
   - Advanced ASR system with accent adaptation
   - Deep learning-based implementation
   - Support for multiple English accents
   - Performance evaluation and metrics

3. **Call Clarity Monitor** (`nm-5/`)
   - Real-time call quality monitoring system
   - Speech recognition and analysis
   - Content safety monitoring
   - Text analytics integration
   - Django-based backend implementation

## Project Structure
```
nm-projects-speech-recognition/
|── NM3.ipynb           # Main notebook (implementation + training + results)
|     ├── README.md           # Project description (this file)
|     ├── LICENSE             # MIT License
|     ├── CONTRIBUTING.md     # Contribution guidelines
|     └── requirements.txt    # Project dependencies
│
├── nm-4/                    # Accent-Aware ASR Project
│   ├── Accent-Aware Speech Recognition.ipynb
│   ├── README.md
│   ├── LICENSE
│   ├── CONTRIBUTING.md
│   └── requirements.txt
│
├── nm-5/                    # Call Clarity Monitor
│   ├── call-clarity-monitor/    # Frontend application
│   ├── call_clarity_backend/    # Django backend
│   ├── analyzer/               # Analysis modules
│   ├── media/                 # Media storage
│   ├── documentation.md       # Detailed documentation
│   ├── about.md              # Project information
│   ├── requirements.txt      # Dependencies
│   └── manage.py            # Django management script
│
└── README.md                    # This file
```

## Course Coverage
The Naan Mudhalvan Speech Recognition course, in collaboration with GUVI, covers:

1. **Fundamentals of Speech Processing**
   - Audio signal processing
   - Feature extraction
   - Data preprocessing techniques

2. **Machine Learning for Speech**
   - Deep learning architectures
   - Model training and optimization
   - Performance evaluation

3. **Practical Implementation**
   - Real-world applications
   - Industry best practices
   - Project-based learning
   - Full-stack development
   - System integration

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/suhail-z/nm-projects.git
   cd nm-projects
   ```

2. Install dependencies for each project:
   ```bash
   # For Audio Preprocessing Project
   cd nm-3
   pip install -r requirements.txt

   # For Accent-Aware ASR Project
   cd ../nm-4
   pip install -r requirements.txt

   # For Call Clarity Monitor
   cd ../nm-5
   pip install -r requirements.txt
   ```

3. Follow the individual project READMEs for detailed setup and usage instructions.

## Contributing
We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Naan Mudhalvan Program for providing the learning opportunity
- GUVI for their comprehensive course content and support
- Common Voice dataset for providing the training data
- Open-source community for various tools and libraries
- Django framework and its contributors
- OpenAI and other API providers

## Contact
For questions and feedback, please open an issue in the GitHub repository or contact:
- GitHub: [suhail-z](https://github.com/suhail-z)
- Project Repository: [nm-projects](https://github.com/suhail-z/nm-projects)