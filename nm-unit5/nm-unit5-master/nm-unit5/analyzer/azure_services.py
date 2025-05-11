"""
Azure Services for text analytics and speech processing.

Example usage in Django shell:
    from analyzer.azure_services import AzureLanguageService
    
    # Initialize the service
    language_service = AzureLanguageService()
    
    # Example text with opinions
    text = "The food was delicious but the service was terrible. The atmosphere was nice though."
    
    # Analyze sentiment
    result = language_service.analyze_sentiment(text)
    
    # Print overall sentiment
    print(f"Overall sentiment: {result['overall']}")
    print(f"Confidence scores: {result['confidence_scores']}")
    
    # Print sentence-level analysis
    for sentence in result['sentences']:
        print(f"\nSentence: {sentence['text']}")
        print(f"Sentiment: {sentence['sentiment']}")
        
        # Print opinions if any
        for opinion in sentence['opinions']:
            print(f"\nOpinion about: {opinion['target']['text']}")
            print(f"Target sentiment: {opinion['target']['sentiment']}")
            
            for assessment in opinion['assessments']:
                print(f"Assessment: {assessment['text']}")
                print(f"Assessment sentiment: {assessment['sentiment']}")
"""

import os
import json
import requests
import time
import uuid
from datetime import datetime
from django.conf import settings
from .azure_storage import AzureStorageService
import logging
from .models import AudioJob, Transcript
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient
from azure.ai.contentsafety import ContentSafetyClient

logger = logging.getLogger(__name__)

class AzureSpeechService:
    def __init__(self):
        self.key = settings.AZURE_SPEECH_KEY
        self.region = settings.AZURE_SPEECH_REGION
        self.endpoint = f"https://{self.region}.api.cognitive.microsoft.com"
        self.transcription_path = "/speechtotext/v3.2/transcriptions"
        self.wait_seconds = 10
        self.storage = AzureStorageService()
        self.supported_formats = {
            'wav': ['audio/wav', 'audio/wave', 'audio/x-wav'],
            'mp3': ['audio/mpeg', 'audio/mp3'],
            'ogg': ['audio/ogg', 'audio/opus'],
            'flac': ['audio/flac'],
            'wma': ['audio/x-ms-wma'],
            'aac': ['audio/aac'],
            'webm': ['audio/webm'],
            'amr': ['audio/amr'],
            'speex': ['audio/speex']
        }

    def _validate_audio_file(self, file_path):
        """Validate audio file format and size"""
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")

            # Check file size (max 1GB)
            file_size = os.path.getsize(file_path)
            if file_size > 1024 * 1024 * 1024:  # 1GB
                raise ValueError("File size exceeds maximum limit of 1GB")

            # Get file extension
            _, ext = os.path.splitext(file_path)
            ext = ext.lower().lstrip('.')
            
            if ext not in self.supported_formats:
                raise ValueError(f"Unsupported audio format: {ext}. Supported formats: {', '.join(self.supported_formats.keys())}")

            return True
        except Exception as e:
            logger.error(f"Audio file validation failed: {str(e)}")
            raise

    def transcribe_audio(self, audio_file_path, job_id=None, options=None):
        """
        Transcribe audio using Azure Speech REST API with comprehensive analytics
        
        Args:
            audio_file_path (str): Path to the audio file
            job_id (str): Optional job ID to associate with the transcription
            options (dict): Optional configuration for transcription
        """
        try:
            # Validate audio file
            self._validate_audio_file(audio_file_path)
            
            # First upload the file to Azure Storage
            audio_url = self.storage.upload_audio(audio_file_path)
            logger.info(f"Audio file uploaded to: {audio_url}")
            
            # Set default options
            options = options or {}
            locale = options.get('locale', 'en-US')
            diarization_enabled = options.get('diarization_enabled', True)
            word_level_timestamps = options.get('word_level_timestamps', True)
            language_identification = options.get('language_identification', [])
            model = options.get('model')
            destination_container = options.get('destination_container')
            pii_redaction = options.get('pii_redaction', True)
            sentiment_analysis = options.get('sentiment_analysis', True)
            
            # Create transcription request with optimized settings
            uri = f"{self.endpoint}{self.transcription_path}"
            content = {
                "contentUrls": [audio_url],
                "locale": locale,
                "displayName": f"call_center_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "properties": {
                    "diarizationEnabled": diarization_enabled,
                    "wordLevelTimestampsEnabled": word_level_timestamps,
                    "timeToLive": "PT30M",  # 30 minutes
                    "punctuationMode": "DictatedAndAutomatic",
                    "profanityFilterMode": "Masked",
                    "piiRedactionEnabled": pii_redaction,
                    "sentimentAnalysisEnabled": sentiment_analysis,
                    "channels": [0],  # Default to single channel
                    "diarization": {
                        "speakers": {
                            "minCount": 2,
                            "maxCount": 2
                        }
                    }
                }
            }

            # Add optional configurations
            if language_identification:
                content["properties"]["languageIdentification"] = {
                    "candidateLocales": language_identification
                }
            
            if model:
                content["model"] = {"self": model}
            
            if destination_container:
                content["destinationContainerUrl"] = destination_container

            headers = {
                "Ocp-Apim-Subscription-Key": self.key,
                "Content-Type": "application/json"
            }

            logger.info("Creating transcription request with configuration:")
            logger.info(f"Locale: {locale}")
            logger.info(f"Diarization enabled: {diarization_enabled}")
            logger.info(f"Word level timestamps: {word_level_timestamps}")
            logger.info(f"PII redaction: {pii_redaction}")
            logger.info(f"Sentiment analysis: {sentiment_analysis}")

            response = requests.post(uri, json=content, headers=headers)
            response.raise_for_status()
            
            # Get transcription ID from response
            transcription_uri = response.json()["self"]
            transcription_id = transcription_uri.split("/")[-1]
            
            # Verify transcription ID is valid GUID
            try:
                uuid.UUID(transcription_id)
            except ValueError:
                raise Exception(f"Invalid transcription ID: {transcription_id}")

            # Wait for transcription to complete with optimized polling
            logger.info(f"Waiting for transcription {transcription_id} to complete")
            max_wait_time = 300  # 5 minutes timeout
            start_time = time.time()
            last_status = None
            poll_interval = 5  # Start with 5 second intervals
            
            while True:
                if time.time() - start_time > max_wait_time:
                    raise Exception("Transcription timeout after 5 minutes")
                    
                time.sleep(poll_interval)
                status_response = requests.get(
                    f"{self.endpoint}{self.transcription_path}/{transcription_id}",
                    headers={"Ocp-Apim-Subscription-Key": self.key}
                )
                status_response.raise_for_status()
                status_data = status_response.json()
                status = status_data["status"].lower()
                
                # Log status changes
                if status != last_status:
                    logger.info(f"Transcription status changed to: {status}")
                    last_status = status
                    
                    # Adjust polling interval based on status
                    if status == "running":
                        poll_interval = 10  # Increase interval during processing
                    else:
                        poll_interval = 5  # Keep shorter interval for other states
                
                if status == "failed":
                    error_msg = status_data.get("properties", {}).get("error", {}).get("message", "Unknown error")
                    logger.error(f"Transcription failed with error: {error_msg}")
                    raise Exception(f"Transcription failed: {error_msg}")
                elif status == "succeeded":
                    logger.info("Transcription completed successfully")
                    break
                elif status == "notstarted":
                    logger.info("Transcription not started yet...")
                elif status == "running":
                    # Log progress information if available
                    progress = status_data.get("properties", {}).get("progress", {})
                    if progress:
                        logger.info(f"Transcription progress: {progress}")
                    else:
                        logger.info("Transcription in progress...")

            # Get transcription files with optimized request
            logger.info("Retrieving transcription files")
            files_response = requests.get(
                f"{self.endpoint}{self.transcription_path}/{transcription_id}/files",
                headers={"Ocp-Apim-Subscription-Key": self.key}
            )
            files_response.raise_for_status()
            
            # Get transcription content URL
            transcription_file = next(
                (f for f in files_response.json()["values"] if f["kind"].lower() == "transcription"),
                None
            )
            if not transcription_file:
                raise Exception("No transcription file found in response")
            
            content_url = transcription_file["links"]["contentUrl"]
            
            # Get transcription content with optimized request
            logger.info("Retrieving transcription content")
            content_response = requests.get(content_url)
            content_response.raise_for_status()
            transcription = content_response.json()
            
            # Log transcription summary
            logger.info("Transcription summary:")
            logger.info(f"Duration: {transcription.get('duration', 'unknown')}")
            logger.info(f"Number of phrases: {len(transcription.get('recognizedPhrases', []))}")
            
            # Process the transcription results
            result = {
                "transcription": {
                    "source": transcription.get("source", ""),
                    "timestamp": transcription.get("createdDateTime", datetime.now().isoformat()),
                    "durationInTicks": transcription.get("durationInTicks", 0),
                    "duration": transcription.get("duration", ""),
                    "combinedRecognizedPhrases": [],
                    "recognizedPhrases": []
                },
                "conversationAnalyticsResults": {
                    "conversationSummaryResults": {
                        "conversations": [],
                        "errors": [],
                        "modelVersion": "2022-05-15-preview"
                    },
                    "conversationPiiResults": {
                        "combinedRedactedContent": [],
                        "conversations": []
                    }
                }
            }

            # Process combined phrases with speaker information
            for phrase in transcription.get("combinedRecognizedPhrases", []):
                speaker = "agent" if phrase.get("speaker", 1) == 1 else "customer"
                phrase_data = {
                    "channel": phrase.get("channel", 0),
                    "speaker": speaker,
                    "offset": phrase.get("offset", "00:00"),
                    "lexical": phrase.get("lexical", ""),
                    "itn": phrase.get("itn", ""),
                    "maskedITN": phrase.get("maskedITN", ""),
                    "display": phrase.get("display", "")
                }
                result["transcription"]["combinedRecognizedPhrases"].append(phrase_data)
                logger.debug(f"Processed phrase: {phrase_data}")

            # Process individual phrases with detailed information
            for phrase in transcription.get("recognizedPhrases", []):
                best = phrase.get("nBest", [{}])[0]
                speaker = "agent" if phrase.get("speaker", 1) == 1 else "customer"
                phrase_data = {
                    "recognitionStatus": phrase.get("recognitionStatus", "Success"),
                    "channel": phrase.get("channel", 0),
                    "speaker": speaker,
                    "offset": phrase.get("offset", ""),
                    "duration": phrase.get("duration", ""),
                    "offsetInTicks": phrase.get("offsetInTicks", 0),
                    "durationInTicks": phrase.get("durationInTicks", 0),
                    "nBest": [{
                        "confidence": best.get("confidence", 0.0),
                        "lexical": best.get("lexical", ""),
                        "itn": best.get("itn", ""),
                        "maskedITN": best.get("maskedITN", ""),
                        "display": best.get("display", ""),
                        "sentiment": best.get("sentiment", {
                            "positive": 0.0,
                            "neutral": 0.0,
                            "negative": 0.0
                        })
                    }]
                }
                result["transcription"]["recognizedPhrases"].append(phrase_data)
                logger.debug(f"Processed detailed phrase: {phrase_data}")

            # Clean up transcription
            logger.info("Cleaning up transcription resources")
            self._delete_transcription(transcription_id)
            
            return result

        except Exception as e:
            logger.error(f"Error in transcribe_audio: {str(e)}")
            if job_id:
                try:
                    job = AudioJob.objects.get(id=job_id)
                    job.status = 'failed'
                    job.error_message = str(e)
                    job.save()
                except:
                    pass
            raise

    def _delete_transcription(self, transcription_id):
        """Delete a transcription job"""
        try:
            uri = f"{self.endpoint}{self.transcription_path}/{transcription_id}"
            response = requests.delete(
                uri,
                headers={"Ocp-Apim-Subscription-Key": self.key}
            )
            response.raise_for_status()
            logger.info(f"Successfully deleted transcription {transcription_id}")
        except Exception as e:
            logger.error(f"Error deleting transcription {transcription_id}: {str(e)}")
            # Don't raise the exception as this is cleanup

class AzureLanguageService:
    def __init__(self):
        self.endpoint = settings.AZURE_LANGUAGE_ENDPOINT
        self.key = settings.AZURE_LANGUAGE_KEY
        
        # Validate endpoint format
        if not self.endpoint:
            raise ValueError("AZURE_LANGUAGE_ENDPOINT is not set")
        if not self.key:
            raise ValueError("AZURE_LANGUAGE_KEY is not set")
            
        # Ensure endpoint has correct format
        if not self.endpoint.startswith("https://"):
            self.endpoint = f"https://{self.endpoint}"
        if self.endpoint.endswith("/"):
            self.endpoint = self.endpoint[:-1]
            
        # Initialize client with proper configuration
        self.credential = AzureKeyCredential(self.key)
        self.client = TextAnalyticsClient(
            endpoint=self.endpoint,
            credential=self.credential,
            api_version="2023-04-01"  # Using stable version that supports opinion mining
        )
        self.logger = logging.getLogger(__name__)
        
        # Test connection
        try:
            # Simple test to verify connection
            test_response = self.client.extract_key_phrases(["Test connection"])
            # Convert to list and check first result
            results = list(test_response)
            if not results:
                raise Exception("No results returned from API")
            self.logger.info("Successfully connected to Azure Text Analytics API")
        except Exception as e:
            self.logger.error(f"Failed to connect to Azure Text Analytics API: {str(e)}")
            raise

    def analyze_sentiment(self, text):
        """Analyze sentiment of text with opinion mining
        
        Args:
            text (str): The text to analyze
            
        Returns:
            dict: A dictionary containing:
                - overall: The overall sentiment (positive, negative, neutral, mixed)
                - confidence_scores: Dictionary of positive, neutral, negative scores
                - sentences: List of sentence-level analysis with:
                    - text: The sentence text
                    - sentiment: The sentence sentiment
                    - confidence_scores: Dictionary of positive, neutral, negative scores
                    - opinions: List of opinions with:
                        - target: The target of the opinion
                        - assessments: List of assessments with:
                            - text: The assessment text
                            - sentiment: The assessment sentiment
                            - confidence_scores: Dictionary of positive, neutral, negative scores
        """
        try:
            if not text or not isinstance(text, str):
                raise ValueError("Text must be a non-empty string")

            # Prepare the request
            url = f"{self.endpoint}/text/analytics/v3.1/sentiment"
            headers = {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': self.key
            }
            body = {
                "documents": [
                    {
                        "id": "1",
                        "language": "en",
                        "text": text
                    }
                ],
                "opinionMining": True
            }

            # Make the API call
            response = requests.post(url, headers=headers, json=body)
            response.raise_for_status()
            result = response.json()

            if not result.get('documents'):
                raise Exception("No sentiment analysis results returned")

            doc = result['documents'][0]
            
            # Process the sentiment analysis result
            sentiment_result = {
                'overall': doc['sentiment'],
                'confidence_scores': doc['confidenceScores'],
                'sentences': []
            }
            
            # Process each sentence with its opinions
            for sentence in doc.get('sentences', []):
                sentence_data = {
                    'text': sentence['text'],
                    'sentiment': sentence['sentiment'],
                    'confidence_scores': sentence['confidenceScores'],
                    'opinions': []
                }
                
                # Process opinions if available
                for opinion in sentence.get('opinions', []):
                    opinion_data = {
                        'target': {
                            'text': opinion['target']['text'],
                            'sentiment': opinion['target']['sentiment'],
                            'confidence_scores': opinion['target']['confidenceScores']
                        },
                        'assessments': []
                    }
                    
                    # Process assessments
                    for assessment in opinion.get('assessments', []):
                        assessment_data = {
                            'text': assessment['text'],
                            'sentiment': assessment['sentiment'],
                            'confidence_scores': assessment['confidenceScores']
                        }
                        opinion_data['assessments'].append(assessment_data)
                        
                    sentence_data['opinions'].append(opinion_data)
                
                sentiment_result['sentences'].append(sentence_data)
            
            return sentiment_result
            
        except Exception as e:
            self.logger.error(f"Error in analyze_sentiment: {str(e)}")
            # Return a default neutral sentiment result
            return {
                'overall': 'neutral',
                'confidence_scores': {
                    'positive': 0.0,
                    'neutral': 1.0,
                    'negative': 0.0
                },
                'sentences': [{
                    'text': text,
                    'sentiment': 'neutral',
                    'confidence_scores': {
                        'positive': 0.0,
                        'neutral': 1.0,
                        'negative': 0.0
                    },
                    'opinions': []
                }]
            }

    def extract_entities(self, text):
        """Extract named entities from text"""
        try:
            if not text or not isinstance(text, str):
                raise ValueError("Text must be a non-empty string")
                
            response = self.client.recognize_entities(
                [text],
                language="en"
            )
            # Convert to list and get first result
            results = list(response)
            if not results:
                raise Exception("No entity recognition results returned")
            result = results[0]
            
            return [{
                'text': entity.text,
                'category': entity.category,
                'subcategory': entity.subcategory,
                'confidence_score': entity.confidence_score,
                'offset': entity.offset,
                'length': entity.length
            } for entity in getattr(result, 'entities', [])]
        except Exception as e:
            self.logger.error(f"Error in extract_entities: {str(e)}")
            return []

    def extract_key_phrases(self, text):
        """Extract key phrases from text"""
        try:
            if not text or not isinstance(text, str):
                raise ValueError("Text must be a non-empty string")
                
            response = self.client.extract_key_phrases(
                [text],
                language="en"
            )
            # Convert to list and get first result
            results = list(response)
            if not results:
                raise Exception("No key phrase extraction results returned")
            result = results[0]
            return getattr(result, 'key_phrases', [])
        except Exception as e:
            self.logger.error(f"Error in extract_key_phrases: {str(e)}")
            return []

    def detect_pii(self, text):
        """Detect Personally Identifiable Information in text"""
        try:
            if not text or not isinstance(text, str):
                raise ValueError("Text must be a non-empty string")
                
            response = self.client.recognize_pii_entities(
                [text],
                language="en"
            )
            # Convert to list and get first result
            results = list(response)
            if not results:
                raise Exception("No PII detection results returned")
            result = results[0]
            
            return [{
                'text': entity.text,
                'category': entity.category,
                'confidence_score': entity.confidence_score,
                'offset': entity.offset,
                'length': entity.length
            } for entity in getattr(result, 'entities', [])]
        except Exception as e:
            self.logger.error(f"Error in detect_pii: {str(e)}")
            return []

    def analyze_text(self, text):
        """Perform comprehensive text analysis"""
        try:
            if not text or not isinstance(text, str):
                raise ValueError("Text must be a non-empty string")
                
            result = {
                'sentiment': self.analyze_sentiment(text),
                'entities': self.extract_entities(text),
                'key_phrases': self.extract_key_phrases(text),
                'pii_entities': self.detect_pii(text)
            }
            return result
        except Exception as e:
            self.logger.error(f"Error in analyze_text: {str(e)}")
            # Return a default result instead of raising
            return {
                'sentiment': {
                    'overall': 'neutral',
                    'confidence_scores': {
                        'positive': 0.0,
                        'neutral': 1.0,
                        'negative': 0.0
                    },
                    'sentences': [{
                        'text': text,
                        'sentiment': 'neutral',
                        'confidence_scores': {
                            'positive': 0.0,
                            'neutral': 1.0,
                            'negative': 0.0
                        }
                    }]
                },
                'entities': [],
                'key_phrases': [],
                'pii_entities': []
            }

class AzureContentSafetyService:
    def __init__(self):
        self.endpoint = settings.AZURE_CONTENT_SAFETY_ENDPOINT
        self.key = settings.AZURE_CONTENT_SAFETY_KEY
        
        # Validate endpoint and key
        if not self.endpoint:
            raise ValueError("AZURE_CONTENT_SAFETY_ENDPOINT is not set")
        if not self.key:
            raise ValueError("AZURE_CONTENT_SAFETY_KEY is not set")
            
        # Ensure endpoint has correct format
        if not self.endpoint.startswith("https://"):
            self.endpoint = f"https://{self.endpoint}"
        if self.endpoint.endswith("/"):
            self.endpoint = self.endpoint[:-1]
            
        self.analyze_url = f"{self.endpoint}/contentsafety/text:analyze?api-version=2024-09-01"
        self.logger = logging.getLogger(__name__)
        
        # Test connection
        try:
            headers = {
                'Ocp-Apim-Subscription-Key': self.key,
                'Content-Type': 'application/json'
            }
            body = {
                "text": "Test connection",
                "categories": ["Hate", "SelfHarm", "Sexual", "Violence"],
                "outputType": "FourSeverityLevels"
            }
            response = requests.post(self.analyze_url, headers=headers, json=body)
            response.raise_for_status()
            self.logger.info("Successfully connected to Azure Content Safety API")
        except Exception as e:
            self.logger.error(f"Failed to connect to Azure Content Safety API: {str(e)}")
            raise

    def analyze_text(self, text):
        """Analyze text for harmful content
        
        Args:
            text (str): The text to analyze
            
        Returns:
            dict: A dictionary containing analysis results for each category:
                - Hate: Hate speech analysis
                - SelfHarm: Self-harm content analysis
                - Sexual: Sexual content analysis
                - Violence: Violent content analysis
                Each category contains:
                    - severity: Severity level (0-4)
        """
        try:
            if not text or not isinstance(text, str):
                raise ValueError("Text must be a non-empty string")

            headers = {
                'Ocp-Apim-Subscription-Key': self.key,
                'Content-Type': 'application/json'
            }
            body = {
                "text": text,
                "categories": ["Hate", "SelfHarm", "Sexual", "Violence"],
                "outputType": "FourSeverityLevels"
            }
            
            response = requests.post(self.analyze_url, headers=headers, json=body)
            response.raise_for_status()
            result = response.json()
            
            # Process results
            results = {}
            for category in result.get('categoriesAnalysis', []):
                results[category['category']] = {
                    'severity': category['severity']
                }
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in analyze_text: {str(e)}")
            # Return default safe results
            return {
                'Hate': {'severity': 0},
                'SelfHarm': {'severity': 0},
                'Sexual': {'severity': 0},
                'Violence': {'severity': 0}
            }

class AzureOpenAIService:
    def __init__(self):
        self.endpoint = settings.AZURE_OPENAI_ENDPOINT
        self.key = settings.AZURE_OPENAI_KEY
        self.api_version = "2024-10-21"  # Latest stable version
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT
        self.logger = logging.getLogger(__name__)
        
        # Validate configuration
        if not self.endpoint:
            raise ValueError("AZURE_OPENAI_ENDPOINT is not set")
        if not self.key:
            raise ValueError("AZURE_OPENAI_KEY is not set")
        if not self.deployment:
            raise ValueError("AZURE_OPENAI_DEPLOYMENT is not set")
            
        # Ensure endpoint has correct format
        if not self.endpoint.startswith("https://"):
            self.endpoint = f"https://{self.endpoint}"
        if self.endpoint.endswith("/"):
            self.endpoint = self.endpoint[:-1]

    def audit_call_compliance(self, transcript):
        """
        Analyze call transcript for compliance using GPT-4
        
        Args:
            transcript (str): Full call transcript with speaker labels
            
        Returns:
            dict: Compliance analysis results including:
                - checklist: Compliance rules check results
                - risk_level: Overall risk assessment
                - score: Compliance score (0-100)
                - violations: List of detected violations
                - improvements: Suggested improvements
                - sentiment: Overall call sentiment
                - summary: Brief call summary
        """
        try:
            system_prompt = """You are a compliance auditor AI for customer support call transcripts.
            Your task is to evaluate compliance with:
            - GDPR (EU)
            - HIPAA (USA)
            - PCI-DSS (Payment Security)
            - Professionalism and SOPs

            Analyze the transcript and provide a structured evaluation."""

            user_prompt = f"""Review this customer support transcript for compliance violations and areas of improvement.
            
            Provide your analysis in the following JSON format:
            {{
                "checklist": [
                    {{"rule": "GDPR Compliance", "passed": true/false, "details": "explanation"}},
                    {{"rule": "HIPAA Compliance", "passed": true/false, "details": "explanation"}},
                    {{"rule": "PCI-DSS Compliance", "passed": true/false, "details": "explanation"}},
                    {{"rule": "Professional Conduct", "passed": true/false, "details": "explanation"}}
                ],
                "risk_level": "Low/Medium/High",
                "score": 0-100,
                "violations": [
                    {{"type": "violation category", "example": "quoted text", "severity": "severity level"}}
                ],
                "improvements": [
                    "improvement suggestion 1",
                    "improvement suggestion 2"
                ],
                "sentiment": "Positive/Neutral/Negative",
                "summary": "brief call summary"
            }}

            TRANSCRIPT:
            {transcript}"""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            response = self.chat_completion(
                messages=messages,
                temperature=0.3,  # Lower temperature for more consistent analysis
                response_format={"type": "json_object"},
                max_tokens=2000
            )

            try:
                result = json.loads(response['choices'][0]['message']['content'])
                
                # Validate required fields
                required_fields = {
                    'checklist', 'risk_level', 'score', 'violations', 
                    'improvements', 'sentiment', 'summary'
                }
                if not all(field in result for field in required_fields):
                    raise ValueError("Missing required fields in compliance analysis")
                
                # Validate score range
                if not (0 <= result['score'] <= 100):
                    raise ValueError("Compliance score must be between 0 and 100")
                
                # Validate risk level
                if result['risk_level'] not in ['Low', 'Medium', 'High']:
                    raise ValueError("Invalid risk level")
                
                return result
                
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                self.logger.error(f"Error parsing compliance analysis: {str(e)}")
                raise ValueError(f"Invalid compliance analysis format: {str(e)}")
                
        except Exception as e:
            self.logger.error(f"Error in compliance audit: {str(e)}")
            raise

    def _make_request(self, endpoint, method="POST", headers=None, json_data=None):
        """Helper method to make API requests with proper error handling"""
        try:
            headers = headers or {}
            headers.update({
            'api-key': self.key,
            'Content-Type': 'application/json'
            })
            
            response = requests.request(
                method,
                endpoint,
                headers=headers,
                json=json_data
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"API request failed: {str(e)}")
            raise

    def chat_completion(self, messages, temperature=0.7, max_tokens=None, stream=False, 
                       response_format=None, tools=None, tool_choice=None):
        """Create a chat completion
        
        Args:
            messages (list): List of message objects with role and content
            temperature (float): Sampling temperature between 0 and 2
            max_tokens (int): Maximum tokens to generate
            stream (bool): Whether to stream the response
            response_format (dict): Format specification for the response
            tools (list): List of tools the model can use
            tool_choice (dict): Tool choice configuration
            
        Returns:
            dict: Chat completion response
        """
        url = f"{self.endpoint}/openai/deployments/{self.deployment}/chat/completions?api-version={self.api_version}"
        
        body = {
            "messages": messages,
            "temperature": temperature,
            "stream": stream
        }
        
        if max_tokens:
            body["max_tokens"] = max_tokens
        if response_format:
            body["response_format"] = response_format
        if tools:
            body["tools"] = tools
        if tool_choice:
            body["tool_choice"] = tool_choice
            
        return self._make_request(url, json_data=body)

    def get_embeddings(self, input_text, encoding_format="float"):
        """Get embeddings for input text
        
        Args:
            input_text (str or list): Text or list of texts to embed
            encoding_format (str): Format of the embeddings (float or base64)
            
        Returns:
            dict: Embeddings response
        """
        url = f"{self.endpoint}/openai/deployments/{self.deployment}/embeddings?api-version={self.api_version}"
        
        body = {
            "input": input_text,
            "encoding_format": encoding_format
        }
        
        return self._make_request(url, json_data=body)

    def analyze_compliance(self, text):
        """Analyze text for compliance using chat completion
        
        Args:
            text (str): Text to analyze
            
        Returns:
            dict: Compliance analysis results
        """
        messages = [
                {
                    "role": "system",
                    "content": """Analyze for compliance. Return JSON with:
                    - checklist: array of {requirement: string, passed: bool, details: string}
                    - risk_level: Low/Medium/High
                    - summary: string
                    - score: 0-100
                    - recommendations: string[]"""
                },
                {
                    "role": "user",
                    "content": text
                }
        ]
        
        response = self.chat_completion(
            messages=messages,
            temperature=0.3,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        try:
            compliance_data = json.loads(response['choices'][0]['message']['content'])
            required_keys = {'checklist', 'risk_level', 'summary', 'score', 'recommendations'}
            if not all(key in compliance_data for key in required_keys):
                raise ValueError("Missing required keys in response")
            return compliance_data
        except (json.JSONDecodeError, KeyError) as e:
            self.logger.error(f"Invalid compliance analysis response: {str(e)}")
            raise ValueError(f"Invalid response format: {str(e)}")

    def generate_image(self, prompt, n=1, size="1024x1024", quality="standard", style="vivid"):
        """Generate images using DALL-E
        
        Args:
            prompt (str): Text description of desired image
            n (int): Number of images to generate
            size (str): Size of generated images
            quality (str): Quality of generated images
            style (str): Style of generated images
            
        Returns:
            dict: Image generation response
        """
        url = f"{self.endpoint}/openai/deployments/{self.deployment}/images/generations?api-version={self.api_version}"
        
        body = {
            "prompt": prompt,
            "n": n,
            "size": size,
            "quality": quality,
            "style": style,
            "response_format": "url"
        }
        
        return self._make_request(url, json_data=body)

    def transcribe_audio(self, audio_file, language=None, response_format="json"):
        """Transcribe audio to text
        
        Args:
            audio_file (file): Audio file to transcribe
            language (str): Language of the audio
            response_format (str): Format of the response
            
        Returns:
            dict: Transcription response
        """
        url = f"{self.endpoint}/openai/deployments/{self.deployment}/audio/transcriptions?api-version={self.api_version}"
        
        headers = {
            'api-key': self.key
        }
        
        files = {
            'file': audio_file
        }
        
        data = {
            'response_format': response_format
        }
        
        if language:
            data['language'] = language
            
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        return response.json()

    def translate_audio(self, audio_file, response_format="json"):
        """Translate audio to English text
        
        Args:
            audio_file (file): Audio file to translate
            response_format (str): Format of the response
            
        Returns:
            dict: Translation response
        """
        url = f"{self.endpoint}/openai/deployments/{self.deployment}/audio/translations?api-version={self.api_version}"
        
        headers = {
            'api-key': self.key
        }
        
        files = {
            'file': audio_file
        }
        
        data = {
            'response_format': response_format
        }
            
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        return response.json()