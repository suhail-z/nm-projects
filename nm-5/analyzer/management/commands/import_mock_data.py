import json
import os
import uuid
from datetime import datetime
from django.core.management.base import BaseCommand
from analyzer.models import AudioJob, Transcript, ComplianceReport, CallAnalytics

class Command(BaseCommand):
    help = 'Import mock data from frontend JSON file'

    def handle(self, *args, **options):
        # Path to the mock data file
        mock_data_path = os.path.join('call-clarity-monitor', 'src', 'data', 'call-data.json')
        
        try:
            with open(mock_data_path, 'r') as f:
                data = json.load(f)
                
            for call in data['callHistory']:
                # Create AudioJob with a new UUID
                job = AudioJob.objects.create(
                    agent=call['agent'],
                    customer=call['customer'],
                    duration=call['duration'],
                    compliance_status=call['status'],
                    score=call['score'],
                    status='complete',  # Set status to complete for mock data
                    created_at=datetime.strptime(f"{call['date']} {call['time']}", "%B %d, %Y %H:%M")
                )
                
                # Create Transcript segments
                for segment in call['transcript']:
                    Transcript.objects.create(
                        job=job,
                        speaker=segment['speaker'],
                        text=segment['text'],
                        start_time=segment['time']
                    )
                
                # Create Compliance Report
                compliance_report = ComplianceReport.objects.create(
                    job=job,
                    checklist=call['complianceItems'],
                    score=call['score'],  # Use the same score as the job
                    risk_level=call['status'],  # Use the status as risk level
                    summary="Compliance report generated from mock data",
                    recommendations={
                        "items": [
                            {
                                "title": "Review call handling procedures",
                                "description": "Ensure all compliance requirements are met"
                            }
                        ]
                    }
                )
                
                # Create Call Analytics with default values if not present in mock data
                analytics_data = call.get('analytics', {})
                CallAnalytics.objects.create(
                    job=job,
                    agent_talk_time=analytics_data.get('agentTalkTime', 300),  # Default 5 minutes
                    customer_talk_time=analytics_data.get('customerTalkTime', 240),  # Default 4 minutes
                    agent_tone=analytics_data.get('agentTone', 0.8),  # Default positive tone
                    customer_sentiment=analytics_data.get('customerSentiment', 0.7),  # Default positive sentiment
                    silence_periods=analytics_data.get('silencePeriods', 5),  # Default 5 silence periods
                    interruption_count=analytics_data.get('interruptionCount', 2),  # Default 2 interruptions
                    key_phrases=analytics_data.get('keyPhrases', ["refund", "policy", "satisfaction"])  # Default key phrases
                )
                
            self.stdout.write(self.style.SUCCESS('Successfully imported mock data'))
            
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'Mock data file not found at {mock_data_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing mock data: {str(e)}')) 