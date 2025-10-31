from django.urls import path
from .views import DiagnoseView, AnalysisListView, ChatView, list_models

urlpatterns = [
    path("diagnose/", DiagnoseView.as_view(), name="diagnose"),
    path("analyses/", AnalysisListView.as_view(), name="analyses"),
    path("chat/", ChatView.as_view(), name="chat"),
    path("models/", list_models),
]
