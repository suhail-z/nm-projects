# Call Clarity - Audio Call Analysis System

![Call Clarity Logo](frontend/public/logo.png)

Call Clarity is an advanced audio call analysis system that helps businesses monitor, analyze, and improve their customer service calls using Azure Cognitive Services.

## 🌟 Features

- 🎙️ Real-time audio recording and file upload
- 📝 Automatic speech-to-text transcription
- 🎯 Speaker diarization and identification
- 📊 Sentiment analysis and content safety checks
- ✅ Compliance monitoring and reporting
- 📈 Detailed call analytics and metrics
- 🔄 Real-time processing status updates

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- Azure account with required services:
  - Azure Speech Services
  - Azure Language Services
  - Azure Content Safety
  - Azure OpenAI Service
  - Azure Blob Storage

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/suhail-z/nm-projects.git
cd nm-5
```

2. Create and activate virtual environment:
```bash
python -m venv venv #for better performance use python 3.10
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Azure credentials and other settings
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

## 📚 Documentation

For detailed documentation, please visit our [Documentation](documentation.txt).

## 🛠️ Tech Stack

### Frontend
- React 18.x
- TypeScript
- Material-UI
- Axios
- React Router

### Backend
- Python 3.9+
- Django 4.x
- Django REST Framework
- Celery
- PostgreSQL 13+

### Azure Services
- Azure Speech Services
- Azure Language Services
- Azure Content Safety
- Azure OpenAI Service
- Azure Blob Storage

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/)
- [Django](https://www.djangoproject.com/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)

## Contact
For questions and feedback, please open an issue in the GitHub repository or contact:
- GitHub: [suhail-z](https://github.com/suhail-z)
- Project Repository: [nm-projects](https://github.com/suhail-z/nm-projects)

# Call Clarity Monitor

A real-time call monitoring and compliance analysis system for customer support and contact centers.

## Dashboard Overview

![Dashboard showing recent calls and quick actions](assets/1.png)
*Main dashboard with recent calls, upload, record, and call history options.*

## Key Features
- Upload and analyze call recordings
- Record live calls for real-time analysis
- Automatic transcription and compliance scoring
- Sentiment and language analysis
- Detailed call history and reporting
- Django backend with modular analyzer

## Upload Call Recording

![Upload interface for call recordings](assets/2.png)
*Upload .wav or .mp3 files for compliance analysis. Tips for best results are provided.*

## Record Live Call

![Live call recording interface](assets/3.png)
*Record and analyze audio in real-time. Guidelines ensure optimal recording quality.*

## Call History

![Call history with filters and export](assets/4.png)
*Review and filter past calls, export reports, and access detailed analysis.*

## Transcript & Compliance

![Transcript and compliance score](assets/5.png)
*View call transcript, compliance score, and checklist for compliance status.*

## Detailed Metrics & Sentiment

![Call statistics, sentiment, and key phrases](assets/6.png)
*Analyze call duration, talk time, sentiment, and key phrases.*

## Compliance Analysis

![Compliance status and details](assets/8.png)
*Visualize compliance findings, violations, and compliant actions.*

## Sentiment Analysis

![Sentiment analysis and interpretation](assets/9.png)
*Agent tone and customer sentiment analysis with interaction quality metrics.*

## Documentation
For more details, see [documentation.md](documentation.md) and [about.md](about.md).

## License
MIT License. See [LICENSE](LICENSE) for details.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.