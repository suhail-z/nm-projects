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
git clone https://github.com/yourusername/call-clarity.git
cd call-clarity
```

2. Create and activate virtual environment:
```bash
python -m venv venv
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

## 📞 Contact

- Website: [www.callclarity.com](https://www.callclarity.com)
- Email: support@callclarity.com
- Documentation: [docs.callclarity.com](https://docs.callclarity.com)

## 🙏 Acknowledgments

- [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/)
- [Django](https://www.djangoproject.com/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)