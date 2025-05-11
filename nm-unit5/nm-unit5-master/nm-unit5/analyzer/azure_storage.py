import os
import logging
from datetime import datetime, timedelta
from django.conf import settings
from azure.storage.blob import BlobServiceClient, generate_account_sas, ResourceTypes, AccountSasPermissions

logger = logging.getLogger(__name__)

class AzureStorageService:
    def __init__(self):
        self.account_name = settings.AZURE_STORAGE_ACCOUNT
        self.container_name = settings.AZURE_STORAGE_CONTAINER
        self.storage_key = settings.AZURE_STORAGE_KEY
        
        # Initialize the BlobServiceClient
        self.service_client = BlobServiceClient(
            account_url=f"https://{self.account_name}.blob.core.windows.net",
            credential=self.storage_key
        )
        
        # Get container client
        self.container_client = self.service_client.get_container_client(self.container_name)
        
        # Log initialization
        logger.info(f"Initialized Azure Storage Service with account: {self.account_name}")
        logger.info(f"Container: {self.container_name}")

    def _get_sas_token(self, blob_name):
        """Generate a SAS token for a specific blob"""
        sas_token = generate_account_sas(
            account_name=self.account_name,
            account_key=self.storage_key,
            resource_types=ResourceTypes(service=True, container=True, object=True),
            permission=AccountSasPermissions(read=True, write=True, delete=True, list=True, add=True, create=True),
            expiry=datetime.utcnow() + timedelta(hours=1)
        )
        return sas_token

    def upload_audio(self, file_path):
        """Upload a file to Azure Blob Storage"""
        try:
            blob_name = os.path.basename(file_path)
            
            # Get blob client
            blob_client = self.container_client.get_blob_client(blob_name)
            
            logger.info(f"Attempting to upload file: {file_path}")
            
            # Check if file exists
            if not os.path.exists(file_path):
                logger.error(f"File not found: {file_path}")
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Upload the file
            with open(file_path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
                logger.info("File uploaded successfully")
            
            # Get the blob URL with SAS token
            sas_token = self._get_sas_token(blob_name)
            blob_url = f"{blob_client.url}?{sas_token}"
            
            return blob_url
                
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise

    def get_blob_url(self, blob_name):
        """Get the URL for a blob"""
        blob_client = self.container_client.get_blob_client(blob_name)
        sas_token = self._get_sas_token(blob_name)
        return f"{blob_client.url}?{sas_token}" 