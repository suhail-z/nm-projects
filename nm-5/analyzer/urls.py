from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AudioJobViewSet

router = DefaultRouter()
router.register(r'jobs', AudioJobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
] 