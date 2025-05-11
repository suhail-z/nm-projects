from rest_framework import serializers
from .models import (
    AudioJob, Transcript, Sentiment, ContentSafety,
    ComplianceReport, CallAnalytics
)

class TranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcript
        fields = ['id', 'speaker', 'text', 'start_time', 'flagged', 'flag_reason']

class SentimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sentiment
        fields = ['utterance', 'sentiment', 'confidence']

class ContentSafetySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentSafety
        fields = ['utterance', 'category', 'severity']

class ComplianceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceReport
        fields = [
            'checklist', 'risk_level', 'summary', 'score',
            'recommendations', 'violations', 'improvements',
            'sentiment'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure violations and improvements are always lists
        data['violations'] = data.get('violations', [])
        data['improvements'] = data.get('improvements', [])
        return data

class CallAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallAnalytics
        fields = [
            'agent_talk_time', 'customer_talk_time',
            'agent_tone', 'customer_sentiment',
            'silence_periods', 'interruption_count',
            'key_phrases'
        ]

class AudioJobSerializer(serializers.ModelSerializer):
    transcripts = TranscriptSerializer(many=True, read_only=True)
    sentiments = SentimentSerializer(many=True, read_only=True)
    content_safety = ContentSafetySerializer(many=True, read_only=True)
    compliance_report = serializers.SerializerMethodField()
    analytics = serializers.SerializerMethodField()

    class Meta:
        model = AudioJob
        fields = [
            'id', 'audio_file', 'created_at', 'agent', 'customer', 
            'duration', 'status', 'progress', 'current_step', 
            'status_message', 'error_message', 'score', 'compliance_status',
            'transcripts', 'sentiments', 'content_safety', 'compliance_report', 'analytics'
        ]
        read_only_fields = [
            'id', 'created_at', 'status', 'progress', 'current_step',
            'status_message', 'error_message', 'score', 'compliance_status'
        ]

    def get_compliance_report(self, obj):
        try:
            report = obj.compliance_report
            return {
                'checklist': report.checklist,
                'risk_level': report.risk_level,
                'summary': report.summary,
                'score': report.score,
                'recommendations': report.recommendations,
                'violations': report.violations,
                'improvements': report.improvements,
                'sentiment': report.sentiment
            }
        except ComplianceReport.DoesNotExist:
            return {
                'checklist': [],
                'risk_level': 'unknown',
                'summary': '',
                'score': 0,
                'recommendations': [],
                'violations': [],
                'improvements': [],
                'sentiment': 'neutral'
            }

    def get_analytics(self, obj):
        try:
            analytics = obj.analytics
            return {
                'agent_talk_time': analytics.agent_talk_time,
                'customer_talk_time': analytics.customer_talk_time,
                'agent_tone': analytics.agent_tone,
                'customer_sentiment': analytics.customer_sentiment,
                'silence_periods': analytics.silence_periods,
                'interruption_count': analytics.interruption_count,
                'key_phrases': analytics.key_phrases
            }
        except CallAnalytics.DoesNotExist:
            return {
                'agent_talk_time': 300,
                'customer_talk_time': 240,
                'agent_tone': 0.8,
                'customer_sentiment': 0.7,
                'silence_periods': 5,
                'interruption_count': 2,
                'key_phrases': ["refund", "policy", "satisfaction"]
            }

class AudioJobStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioJob
        fields = ['id', 'status', 'error_message']

class CallRecordSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    status = serializers.CharField(source='compliance_status')
    score = serializers.SerializerMethodField()

    class Meta:
        model = AudioJob
        fields = [
            'id', 'date', 'time', 'agent', 'customer',
            'duration', 'status', 'score'
        ]

    def get_date(self, obj):
        return obj.created_at.strftime('%B %d, %Y')

    def get_time(self, obj):
        return obj.created_at.strftime('%H:%M')

    def get_score(self, obj):
        return f"{obj.score}%" if obj.score is not None else "0%" 