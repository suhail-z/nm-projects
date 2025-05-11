import uuid
from django.db import models

class AudioJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audio_file = models.FileField(upload_to='uploads/')
    created_at = models.DateTimeField(auto_now_add=True)
    agent = models.CharField(max_length=100, default="Unknown Agent")
    customer = models.CharField(max_length=100, default="Unknown Customer")
    duration = models.CharField(max_length=20, default="00:00")
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('complete', 'Complete'),
            ('error', 'Error')
        ],
        default='pending'
    )
    progress = models.IntegerField(default=0)
    current_step = models.CharField(max_length=50, default='')
    status_message = models.TextField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    score = models.IntegerField(default=0)
    compliance_status = models.CharField(
        max_length=20,
        choices=[
            ('compliant', 'Compliant'),
            ('warning', 'Warning'),
            ('violation', 'Violation')
        ],
        default='compliant'
    )

    def __str__(self):
        return f"Job {self.id} - {self.status}"

class Transcript(models.Model):
    job = models.ForeignKey(AudioJob, on_delete=models.CASCADE, related_name='transcripts')
    speaker = models.CharField(
        max_length=20,
        choices=[
            ('agent', 'Agent'),
            ('customer', 'Customer')
        ]
    )
    start_time = models.CharField(max_length=20)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"{self.speaker} at {self.start_time}"

class Sentiment(models.Model):
    job = models.ForeignKey(AudioJob, on_delete=models.CASCADE, related_name='sentiments')
    utterance = models.TextField()
    sentiment = models.CharField(max_length=20)
    confidence = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sentiment: {self.sentiment}"

class ContentSafety(models.Model):
    job = models.ForeignKey(AudioJob, on_delete=models.CASCADE, related_name='content_safety')
    utterance = models.TextField()
    category = models.CharField(max_length=50)
    severity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category}: {self.severity}"

class ComplianceReport(models.Model):
    job = models.OneToOneField(AudioJob, on_delete=models.CASCADE, related_name='compliance_report')
    checklist = models.JSONField()
    risk_level = models.CharField(max_length=20)
    summary = models.TextField()
    score = models.IntegerField()
    recommendations = models.JSONField()
    violations = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    sentiment = models.CharField(max_length=20, default='neutral')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Compliance Report for Job {self.job.id}"

class CallAnalytics(models.Model):
    job = models.OneToOneField(AudioJob, on_delete=models.CASCADE, related_name='analytics')
    agent_talk_time = models.IntegerField(default=0)  # in seconds
    customer_talk_time = models.IntegerField(default=0)  # in seconds
    agent_tone = models.FloatField(default=0.0)  # 0-1 scale
    customer_sentiment = models.FloatField(default=0.0)  # 0-1 scale
    silence_periods = models.IntegerField(default=0)
    interruption_count = models.IntegerField(default=0)
    key_phrases = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analytics for Job {self.job.id}"
